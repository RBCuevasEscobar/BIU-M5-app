package mx.iqenglish.tutoring.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI iqEnglishOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
            .info(new Info()
                .title("IQ ENGLISH - Tutoring Management System API")
                .description("Production-grade RESTful API for academic tutoring management, student scheduling, teacher assignment, group capacities and attendance tracking.")
                .version("1.0.0")
                .contact(new Contact()
                    .name("IQ English Academic Technology Team")
                    .url("https://iqenglish.mx")
                    .email("contacto@iqenglish.mx"))
                .license(new License().name("Proprietary - IQ English S.A. de C.V.")))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}
