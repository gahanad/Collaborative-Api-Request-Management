package api_workspace.service;

import api_workspace.dto.header.CreateHeaderRequest;
import api_workspace.dto.header.HeaderResponse;
import api_workspace.dto.queryparam.CreateQueryParamRequest;
import api_workspace.dto.queryparam.QueryParamResponse;
import api_workspace.enums.WorkspaceRole;
import api_workspace.entity.*;
import api_workspace.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequestQueryParamService {

    private final WorkspaceRepository workspaceRepository;
    private final CollectionRepository collectionRepository;
    private final ApiRequestRepository apiRequestRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final RequestHeaderRepository requestHeaderRepository;
    private final RequestQueryParamRepository requestQueryParamRepository;

    public RequestQueryParamService(
            WorkspaceRepository workspaceRepository,
            CollectionRepository collectionRepository,
            ApiRequestRepository apiRequestRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            RequestHeaderRepository requestHeaderRepository,
            RequestQueryParamRepository requestQueryParamRepository) {

        this.workspaceRepository = workspaceRepository;
        this.collectionRepository = collectionRepository;
        this.apiRequestRepository = apiRequestRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.requestHeaderRepository = requestHeaderRepository;
        this.requestQueryParamRepository = requestQueryParamRepository;
    }

    private QueryParamResponse convertToDTO(RequestQueryParam param){

        return new QueryParamResponse(
                param.getId(),
                param.getParamKey(),
                param.getParamValue(),
                param.getEnabled()
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

    public QueryParamResponse createQueryParam(
        Long workspaceId,
        Long collectionId,
        Long requestId,
        CreateQueryParamRequest dto){

        WorkspaceMember member =
                validateMember(workspaceId, collectionId, requestId);

        if(member.getRole() == WorkspaceRole.VIEWER){
            throw new RuntimeException("Permission denied");
        }

        ApiRequest request =
                apiRequestRepository.findById(requestId).get();

        RequestQueryParam param = new RequestQueryParam();

        param.setParamKey(dto.getParamKey());
        param.setParamValue(dto.getParamValue());
        param.setEnabled(dto.getEnabled());
        param.setApiRequest(request);

        return convertToDTO(requestQueryParamRepository.save(param));
    }

    // Getting all headers
    public List<QueryParamResponse> getAllQueryParams(
        Long workspaceId,
        Long collectionId,
        Long requestId){

        validateMember(workspaceId, collectionId, requestId);

        ApiRequest request =
                apiRequestRepository.findById(requestId).get();

        return requestQueryParamRepository
                .findByApiRequest(request)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // Getting one single header
    public QueryParamResponse getQueryParam(
        Long workspaceId,
        Long collectionId,
        Long requestId,
        Long paramId){

        validateMember(workspaceId, collectionId, requestId);

        RequestQueryParam param =
                requestQueryParamRepository.findById(paramId)
                        .orElseThrow(() ->
                                new RuntimeException("Query parameter not found"));

        if(!param.getApiRequest().getId().equals(requestId)){
            throw new RuntimeException("Query parameter does not belong to request");
        }

        return convertToDTO(param);
    }

    // Updating header
    public QueryParamResponse updateQueryParam(
        Long workspaceId,
        Long collectionId,
        Long requestId,
        Long paramId,
        CreateQueryParamRequest dto){

        WorkspaceMember member =
                validateMember(workspaceId, collectionId, requestId);

        if(member.getRole() == WorkspaceRole.VIEWER){
            throw new RuntimeException("Permission denied");
        }

        RequestQueryParam param =
                requestQueryParamRepository.findById(paramId)
                        .orElseThrow(() ->
                                new RuntimeException("Query parameter not found"));

        if(!param.getApiRequest().getId().equals(requestId)){
            throw new RuntimeException("Query parameter does not belong to request");
        }

        param.setParamKey(dto.getParamKey());
        param.setParamValue(dto.getParamValue());
        param.setEnabled(dto.getEnabled());

        return convertToDTO(requestQueryParamRepository.save(param));
    }


    // Deleting header
    public String deleteQueryParam(
        Long workspaceId,
        Long collectionId,
        Long requestId,
        Long paramId){

        WorkspaceMember member =
                validateMember(workspaceId, collectionId, requestId);

        if(member.getRole() == WorkspaceRole.VIEWER){
            throw new RuntimeException("Permission denied");
        }

        RequestQueryParam param =
                requestQueryParamRepository.findById(paramId)
                        .orElseThrow(() ->
                                new RuntimeException("Query parameter not found"));

        if(!param.getApiRequest().getId().equals(requestId)){
            throw new RuntimeException("Query parameter does not belong to request");
        }

        requestQueryParamRepository.delete(param);

        return "Query parameter deleted successfully";
    }
}