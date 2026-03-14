package com.devall.agenticdevops;

import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AgenticController {

    private final DevOpsAgentService devOpsAgentService;
    private final DataAgentService dataAgentService;
    private final ExecutionEngineService executionEngineService;

    public AgenticController(DevOpsAgentService devOpsAgentService, 
                             DataAgentService dataAgentService,
                             ExecutionEngineService executionEngineService) {
        this.devOpsAgentService = devOpsAgentService;
        this.dataAgentService = dataAgentService;
        this.executionEngineService = executionEngineService;
    }

    @PostMapping("/webhook/github")
    public Mono<String> receiveGithubEvent(
            @RequestHeader("X-GitHub-Event") String githubEvent,
            @RequestBody Map<String, Object> payload) {

        if ("workflow_run".equals(githubEvent)) {
            Map<String, Object> workflowRun = (Map<String, Object>) payload.get("workflow_run");
            Map<String, Object> repository = (Map<String, Object>) payload.get("repository");

            if (workflowRun != null && repository != null) {
                String status = (String) workflowRun.get("conclusion");
                String workflowName = (String) workflowRun.get("name");
                String repoFullName = (String) repository.get("full_name");
                String runId = String.valueOf(workflowRun.get("id"));

                if ("failure".equals(status)) {
                    return devOpsAgentService.autoHealPipeline(repoFullName, runId, workflowName)
                            .map(fix -> "Auto-Heal Process Completed.");
                }
            }
        }
        return Mono.just("Event ignored.");
    }

    @PostMapping("/data/generate-etl")
    public Mono<String> generateDataPipeline(@RequestBody Map<String, String> request) {
        String sourceFormat = request.getOrDefault("sourceFormat", "JSON");
        String sampleData = request.getOrDefault("sampleData", "{}");
        String targetDestination = request.getOrDefault("targetDestination", "Power BI");

        return dataAgentService.generateEnterpriseEtl(sourceFormat, sampleData, targetDestination)
                .map(ecosystemJson -> {
                    System.out.println("\n--- GENERATED ETL ---");
                    System.out.println(ecosystemJson);
                    System.out.println("---------------------\n");
                    return ecosystemJson;
                });
    }

    @PostMapping("/execute")
    public Map<String, Object> executeCode(@RequestBody Map<String, String> request) {
        String originalCode = request.getOrDefault("originalCode", "");
        String newCode = request.getOrDefault("newCode", "");
        String type = request.getOrDefault("pipelineType", "Data");

        return executionEngineService.executeAndAnalyze(originalCode, newCode, type);
    }
}