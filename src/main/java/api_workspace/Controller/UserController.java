package api_workspace.controller;

import api_workspace.entity.User;
import api_workspace.repository.UserRepository;
import api_workspace.service.UserService;
import api_workspace.dto.user.*;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import main.java.api_workspace.dto.user.LoginResponse;
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
    public String test(){
        return "Protected API";
    }
}