package api_workspace.dto.user;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import jakarta.persistence.*;
import java.util.List;
import lombok.*;

@Getter
@Setter
public class SignupRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6,
            message = "Password must contain at least 6 characters")
    private String password;
}