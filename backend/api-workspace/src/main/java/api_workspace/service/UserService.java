package api_workspace.service;

import api_workspace.entity.User;
import api_workspace.repository.UserRepository;
import api_workspace.dto.user.LoginResponse;

import org.springframework.stereotype.Service;
import api_workspace.dto.user.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;


// @Configuration
// @EnableWebSecurity
@Service
public class UserService {
    // @Autowired
    private final UserRepository userRepository;
    // @Autowired
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User signup(SignupRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        String encodedPassword =
                passwordEncoder.encode(request.getPassword());
        user.setPassword(encodedPassword);
        User exists = userRepository.findByEmail(user.getEmail());
        if (exists != null) {
            throw new RuntimeException("User already exists");
        }
        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request){
        User exists = userRepository.findByEmail(request.getEmail());
        if (exists == null) {
            throw new RuntimeException("User not found");
        }
        if (!passwordEncoder.matches(
                request.getPassword(),
                exists.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        String token = jwtService.generateToken(exists.getEmail());
        return new LoginResponse(
            token
        );
    }
}