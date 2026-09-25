package mx.iqenglish.tutoring.integration.talkio;

import mx.iqenglish.tutoring.dto.TalkIOSessionDTO;
import org.springframework.stereotype.Service;

@Service
public class TalkIOService {

    private final TalkIOClient client;

    public TalkIOService(TalkIOClient client) {
        this.client = client;
    }

    public TalkIOSessionDTO practiceModuleTopic(String studentName, String moduleCode, String topicTitle, String promptText, String userSpeechText) {
        return client.evaluateOralPractice(studentName, moduleCode, topicTitle, promptText, userSpeechText);
    }
}
