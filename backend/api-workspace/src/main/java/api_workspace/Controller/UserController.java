package api_workspace.Controller;

import api_workspace.entity.User;
import api_workspace.repository.UserRepository;
import api_workspace.service.UserService;
import api_workspace.dto.user.*;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import api_workspace.dto.user.LoginResponse;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("/users")
public class UserController{
    private UserService userService;
    public UserController(UserService userService){
        this.userService = userService;
    }
    @PostMapping("/signup")
    public User signup(
        @Valid
        @RequestBody SignupRequest user){
        return userService.signup(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
        @Valid
        @RequestBody LoginRequest user){
        return ResponseEntity.ok(userService.login(user));
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put(
                "message",
                "Hello from API Workspace backend"
        );
        response.put(
                "status",
                "success"
        );
        return ResponseEntity.ok(response);
    }
}