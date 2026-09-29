package mx.iqenglish.tutoring;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class IQEnglishTutoringApplication {

    public static void main(String[] args) {
        SpringApplication.run(IQEnglishTutoringApplication.class, args);
    }
}
