package mx.iqenglish.tutoring.integration.talkio;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TalkIOConfiguration {

    @Value("${app.integrations.talkio.enabled:true}")
    private boolean enabled;

    @Value("${app.integrations.talkio.base-url:https://api.talkio.ai/v1}")
    private String baseUrl;

    @Value("${app.integrations.talkio.api-key:mock-talkio-api-key}")
    private String apiKey;

    @Value("${app.integrations.talkio.setup-accounts:3000}")
    private int setupAccounts;

    public boolean isEnabled() { return enabled; }
    public String getBaseUrl() { return baseUrl; }
    public String getApiKey() { return apiKey; }
    public int getSetupAccounts() { return setupAccounts; }
}
