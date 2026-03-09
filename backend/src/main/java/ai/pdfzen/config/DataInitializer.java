package ai.pdfzen.config;

import ai.pdfzen.entity.User;
import ai.pdfzen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("user@pdfzen.ai").isEmpty()) {
            User user = User.builder()
                    .email("user@pdfzen.ai")
                    .displayName("Demo User")
                    .build();
            userRepository.save(user);
            log.info("Created demo user: user@pdfzen.ai (use ID as basic auth username for API)");
        }
    }
}
