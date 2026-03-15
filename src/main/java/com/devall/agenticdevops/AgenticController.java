package com.devall.agenticdevops;

import com.devall.agenticdevops.engine.ExecutionEngineService;
import com.devall.agenticdevops.orchestration.SelfHealingOrchestrator;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AgenticController {

    private final SelfHealingOrchestrator orchestrator;
    private final ExecutionEngineService executionEngineService;
    private final DataAgentService dataAgentService;

    public AgenticController(SelfHealingOrchestrator orchestrator, ExecutionEngineService executionEngineService, DataAgentService dataAgentService) {
        this.orchestrator = orchestrator;
        this.executionEngineService = executionEngineService;
        this.dataAgentService = dataAgentService;
    }

    @PostMapping("/webhook")
    @SuppressWarnings("unchecked")
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

                    return orchestrator.stageHealingWorkflow(repoFullName, runId);
                }
            }
        }
        return Mono.just(Map.of("status", "IGNORED"));
    }

    @GetMapping("/incidents")
    public Mono<List<Map<String, Object>>> getIncidents() {
        return Mono.just(orchestrator.getActiveIncidents());
    }

    @PostMapping("/execute/staged/{runId}")
    public Mono<Map<String, Object>> executeStagedPipeline(@PathVariable String runId) {
        return orchestrator.executeStagedWorkflow(runId);
    }

    @PostMapping("/execute/preview")
    public Map<String, Object> executeSandboxPreview(@RequestBody Map<String, String> request) {
        String originalCode = request.getOrDefault("originalCode", "");
        String newCode = request.getOrDefault("newCode", "");
        String type = request.getOrDefault("pipelineType", "Data");

        return executionEngineService.executeAndAnalyze(originalCode, newCode, type);
    }

    @PostMapping("/data/generate-etl")
    public Mono<String> generateDataPipeline(@RequestBody Map<String, String> request) {
        String sourceFormat = request.getOrDefault("sourceFormat", "JSON");
        String sampleData = request.getOrDefault("sampleData", "");
        String targetDestination = request.getOrDefault("targetDestination", "Power BI");

        return dataAgentService.generateEnterpriseEtl(sourceFormat, sampleData, targetDestination);
    }

    @GetMapping(value = "/system/logs", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamSystemLogs() {
        return Flux.interval(Duration.ofSeconds(1))
                .map(sequence -> {
                    if (sequence == 0) return "[INFO] System initialized. Ready for Webhook events.";
                    if (sequence % 10 == 0) return "[HEARTBEAT] Swarm Cluster node check: OK";
                    return "";
                })
                .filter(msg -> !msg.isEmpty());
    }
}