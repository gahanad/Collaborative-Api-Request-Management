package api_workspace.service;

import api_workspace.entity.User;
import api_workspace.repository.UserRepository;
import org.springframework.stereotype.Service;
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

    public User signup(User user) {
        User exists = userRepository.findByEmail(user.getEmail());
        if(exists != null){
            throw new RuntimeException("User already exists");
        }
        String enCodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(enCodedPassword);
        return userRepository.save(user);
    }
    public String login(User user){
        User exists = userRepository.findByEmail(user.getEmail());
        if(exists == null){
            return "User not found";
        }
        if(passwordEncoder.matches(user.getPassword(), exists.getPassword())){
            String token = jwtService.generateToken(exists.getEmail());
            return token;
        }
        return "Invalid Credentials";
    }
}