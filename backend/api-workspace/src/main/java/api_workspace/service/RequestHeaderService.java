package api_workspace.service;

import api_workspace.dto.header.CreateHeaderRequest;
import api_workspace.dto.header.HeaderResponse;
import api_workspace.entity.*;
import api_workspace.repository.*;
import api_workspace.enums.WorkspaceRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequestHeaderService {

    private final WorkspaceRepository workspaceRepository;
    private final CollectionRepository collectionRepository;
    private final ApiRequestRepository apiRequestRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final RequestHeaderRepository requestHeaderRepository;

    public RequestHeaderService(
            WorkspaceRepository workspaceRepository,
            CollectionRepository collectionRepository,
            ApiRequestRepository apiRequestRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            RequestHeaderRepository requestHeaderRepository) {

        this.workspaceRepository = workspaceRepository;
        this.collectionRepository = collectionRepository;
        this.apiRequestRepository = apiRequestRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.requestHeaderRepository = requestHeaderRepository;
    }

    private HeaderResponse convertToDTO(RequestHeader header){

        return new HeaderResponse(
                header.getId(),
                header.getHeaderKey(),
                header.getHeaderValue(),
                header.getEnabled()
        );
    }

    private WorkspaceMember validateMember(
            Long workspaceId,
            Long collectionId,
            Long requestId){
        //Check the user stored in security context
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        Workspace workspace =
                workspaceRepository.findById(workspaceId)
                        .orElseThrow(() -> new RuntimeException("Workspace not found"));

        Collection collection =
                collectionRepository.findById(collectionId)
                        .orElseThrow(() -> new RuntimeException("Collection not found"));

        if(!collection.getWorkspace().getId().equals(workspaceId)){
            throw new RuntimeException("Collection does not belong to workspace");
        }

        ApiRequest request =
                apiRequestRepository.findById(requestId)
                        .orElseThrow(() -> new RuntimeException("Request not found"));

        if(!request.getCollection().getId().equals(collectionId)){
            throw new RuntimeException("Request does not belong to collection");
        }

        WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(workspace,currentUser);

        if(member==null){
            throw new RuntimeException("User is not a member of workspace");
        }

        return member;
    }

    // Creating new header
    public HeaderResponse createHeader(
        Long workspaceId,
        Long collectionId,
        Long requestId,
        CreateHeaderRequest dto){

        WorkspaceMember member =
                validateMember(workspaceId,collectionId,requestId);

        if(member.getRole()==WorkspaceRole.VIEWER){
            throw new RuntimeException("Permission denied");
        }

        ApiRequest request =
                apiRequestRepository.findById(requestId).get();

        RequestHeader header = new RequestHeader();

        header.setHeaderKey(dto.getHeaderKey());
        header.setHeaderValue(dto.getHeaderValue());
        header.setEnabled(dto.getEnabled());
        header.setApiRequest(request);

        return convertToDTO(requestHeaderRepository.save(header));
    }

    // Getting all headers
    public List<HeaderResponse> getAllHeaders(
        Long workspaceId,
        Long collectionId,
        Long requestId){

        validateMember(workspaceId,collectionId,requestId);

        ApiRequest request =
                apiRequestRepository.findById(requestId).get();

        return requestHeaderRepository
                .findByApiRequest(request)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // Getting one single header
    public HeaderResponse getHeader(
        Long workspaceId,
        Long collectionId,
        Long requestId,
        Long headerId){

        validateMember(workspaceId,collectionId,requestId);

        RequestHeader header =
                requestHeaderRepository.findById(headerId)
                        .orElseThrow(() -> new RuntimeException("Header not found"));

        if(!header.getApiRequest().getId().equals(requestId)){
            throw new RuntimeException("Header does not belong to request");
        }

        return convertToDTO(header);
    }

    // Updating header
    public HeaderResponse updateHeader(
        Long workspaceId,
        Long collectionId,
        Long requestId,
        Long headerId,
        CreateHeaderRequest dto){

        WorkspaceMember member =
                validateMember(workspaceId,collectionId,requestId);

        if(member.getRole()==WorkspaceRole.VIEWER){
            throw new RuntimeException("Permission denied");
        }

        RequestHeader header =
                requestHeaderRepository.findById(headerId)
                        .orElseThrow(() -> new RuntimeException("Header not found"));

        if(!header.getApiRequest().getId().equals(requestId)){
            throw new RuntimeException("Header does not belong to request");
        }

        header.setHeaderKey(dto.getHeaderKey());
        header.setHeaderValue(dto.getHeaderValue());
        header.setEnabled(dto.getEnabled());

        return convertToDTO(requestHeaderRepository.save(header));
    }


    // Deleting header
    public String deleteHeader(
        Long workspaceId,
        Long collectionId,
        Long requestId,
        Long headerId){

        WorkspaceMember member =
                validateMember(workspaceId,collectionId,requestId);

        if(member.getRole()==WorkspaceRole.VIEWER){
            throw new RuntimeException("Permission denied");
        }

        RequestHeader header =
                requestHeaderRepository.findById(headerId)
                        .orElseThrow(() -> new RuntimeException("Header not found"));

        if(!header.getApiRequest().getId().equals(requestId)){
            throw new RuntimeException("Header does not belong to request");
        }

        requestHeaderRepository.delete(header);

        return "Header deleted successfully";
    }
}