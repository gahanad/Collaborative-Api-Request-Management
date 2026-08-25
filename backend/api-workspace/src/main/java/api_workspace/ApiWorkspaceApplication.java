package api_workspace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;


@SpringBootApplication
@EnableJpaAuditing
public class ApiWorkspaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiWorkspaceApplication.class, args);
	}

}
