package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.TalkIOSessionDTO;
import mx.iqenglish.tutoring.integration.talkio.TalkIOService;
import mx.iqenglish.tutoring.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/talkio")
@Tag(name = "TalkIO AI Oral Practice", description = "Integration with TalkIO AI conversational agent for English pronunciation and fluency practice")
public class TalkIOController {

    private final TalkIOService talkIOService;

    public TalkIOController(TalkIOService talkIOService) {
        this.talkIOService = talkIOService;
    }

    @PostMapping("/practice")
    @Operation(summary = "Execute AI conversational evaluation for an English curriculum topic")
    public ResponseEntity<ApiResponse<TalkIOSessionDTO>> practice(
            @RequestParam String moduleCode,
            @RequestParam String topicTitle,
            @RequestParam String promptText,
            @RequestParam(required = false) String speechText) {
        String username = SecurityUtils.getCurrentUsername().orElse("Student");
        TalkIOSessionDTO session = talkIOService.practiceModuleTopic(username, moduleCode, topicTitle, promptText, speechText);
        return ResponseEntity.ok(ApiResponse.ok("Evaluation completed by TalkIO AI Agent", session));
    }
}
