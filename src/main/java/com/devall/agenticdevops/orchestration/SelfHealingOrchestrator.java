package com.devall.agenticdevops.orchestration;

import com.devall.agenticdevops.agents.*;
import com.devall.agenticdevops.memory.SemanticMemoryService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SelfHealingOrchestrator {

    private final LogAnalyzerAgent logAnalyzerAgent;
    private final RootCauseAgent rootCauseAgent;
    private final CodeFixAgent codeFixAgent;
    private final ValidatorAgent validatorAgent;
    private final ReviewerAgent reviewerAgent;
    private final SemanticMemoryService semanticMemoryService;
    private final ObjectMapper objectMapper;

    private final Map<String, Map<String, Object>> incidentRegistry = new ConcurrentHashMap<>();

    private static final int MAX_RETRIES = 3;

    public SelfHealingOrchestrator(
            LogAnalyzerAgent logAnalyzerAgent,
            RootCauseAgent rootCauseAgent,
            CodeFixAgent codeFixAgent,
            ValidatorAgent validatorAgent,
            ReviewerAgent reviewerAgent,
            SemanticMemoryService semanticMemoryService) {
        this.logAnalyzerAgent = logAnalyzerAgent;
        this.rootCauseAgent = rootCauseAgent;
        this.codeFixAgent = codeFixAgent;
        this.validatorAgent = validatorAgent;
        this.reviewerAgent = reviewerAgent;
        this.semanticMemoryService = semanticMemoryService;
        this.objectMapper = new ObjectMapper();
    }

    public List<Map<String, Object>> getActiveIncidents() {
        return new ArrayList<>(incidentRegistry.values());
    }

    public Mono<Map<String, Object>> stageHealingWorkflow(String repoFullName, String runId) {
        Map<String, Object> state = new HashMap<>();
        state.put("id", runId);
        state.put("repo", repoFullName);
        state.put("error", "Pending analysis of GitHub Action logs...");
        state.put("time", "Just now");
        state.put("status", "STAGED");
        
        incidentRegistry.put(runId, state);
        return Mono.just(state);
    }

    public Mono<Map<String, Object>> executeStagedWorkflow(String runId) {
        if (!incidentRegistry.containsKey(runId)) {
            return Mono.just(Map.of("status", "NOT_FOUND"));
        }

        Map<String, Object> state = incidentRegistry.get(runId);
        String repoFullName = (String) state.get("repo");

        state.put("status", "IN_PROGRESS");

        String logs = logAnalyzerAgent.analyzeLogs(repoFullName, runId);
        if ("ERROR_FETCHING_LOGS".equals(logs)) {
            state.put("status", "FAILED_LOG_EXTRACTION");
            return Mono.just(state);
        }

        state.put("error", "Root cause analysis in progress...");

        return rootCauseAgent.determineRootCause(logs)
                .flatMap(rootCause -> {
                    state.put("error", rootCause);
                    return processRetryLoop(repoFullName, logs, rootCause, 1, "", state);
                });
    }

    private Mono<Map<String, Object>> processRetryLoop(String repoFullName, String logs, String rootCause, int attempt, String feedbackContext, Map<String, Object> state) {
        if (attempt > MAX_RETRIES) {
            state.put("status", "FAILED_MAX_RETRIES");
            return Mono.just(state);
        }

        return codeFixAgent.generateFix(rootCause, logs, feedbackContext)
                .flatMap(aiPayload -> {
                    try {
                        String cleanJson = aiPayload.replaceAll("(?s)^```json\\s*|\\s*```$", "").trim();
                        JsonNode node = objectMapper.readTree(cleanJson);
                        String filePath = node.get("filePath").asText();
                        String correctedCode = node.get("correctedCode").asText();
                        String branchName = "devall-autofix-" + attempt + "-" + System.currentTimeMillis();

                        return validatorAgent.validateFix(repoFullName, filePath, correctedCode, branchName)
                                .flatMap(validationStatus -> {
                                    if ("success".equals(validationStatus)) {
                                        return reviewerAgent.reviewAndApprove(repoFullName, branchName, correctedCode, rootCause)
                                                .flatMap(approved -> {
                                                    if (approved) {
                                                        state.put("status", "RESOLVED");
                                                        state.put("appliedFix", correctedCode);
                                                        return semanticMemoryService.storeSuccessfulResolution(
                                                                (String) state.get("id"),
                                                                rootCause,
                                                                correctedCode
                                                        ).thenReturn(state);
                                                    } else {
                                                        return processRetryLoop(repoFullName, logs, rootCause, attempt + 1, "Security rejected fix", state);
                                                    }
                                                });
                                    } else {
                                        return processRetryLoop(repoFullName, logs, rootCause, attempt + 1, "CI failed", state);
                                    }
                                });
                    } catch (Exception e) {
                        return processRetryLoop(repoFullName, logs, rootCause, attempt + 1, "Parsing error", state);
                    }
                });
    }
}