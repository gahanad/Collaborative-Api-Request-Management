package api_workspace.controller;

import api_workspace.entity.User;
import api_workspace.repository.UserRepository;
import api_workspace.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController{
    private UserService userService;
    public UserController(UserService userService){
        this.userService = userService;
    }
    @PostMapping("/signup")
    public User signup(@RequestBody User user){
        return userService.signup(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody User user){
        return userService.login(user);
    }

    @GetMapping("/test")
    public String test(){
        return "Protected API";
    }
}