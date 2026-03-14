package com.devall.agenticdevops;

import com.devall.agenticdevops.orchestration.SelfHealingOrchestrator;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AgenticController {

    private final SelfHealingOrchestrator orchestrator;

    public AgenticController(SelfHealingOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    @PostMapping("/webhook")
    public Mono<Map<String, Object>> receiveGithubWebhook(
            @RequestHeader("X-GitHub-Event") String githubEvent,
            @RequestBody Map<String, Object> payload) {

        if ("workflow_run".equals(githubEvent)) {
            Map<String, Object> workflowRun = (Map<String, Object>) payload.get("workflow_run");
            Map<String, Object> repository = (Map<String, Object>) payload.get("repository");

            if (workflowRun != null && repository != null) {
                String conclusion = (String) workflowRun.get("conclusion");
                if ("failure".equals(conclusion)) {
                    String repoFullName = (String) repository.get("full_name");
                    String runId = String.valueOf(workflowRun.get("id"));

                    return orchestrator.executeHealingWorkflow(repoFullName, runId);
                }
            }
        }
        return Mono.just(Map.of("status", "IGNORED"));
    }
}