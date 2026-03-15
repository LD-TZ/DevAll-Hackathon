package com.devall.agenticdevops.agents;

import com.devall.agenticdevops.clients.GitHubIntegrationClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class ValidatorAgent {

    private final GitHubIntegrationClient gitHubClient;

    public ValidatorAgent(GitHubIntegrationClient gitHubClient) {
        this.gitHubClient = gitHubClient;
    }

    public Mono<String> validateFix(String repoFullName, String filePath, String correctedCode, String branchName) {
        return Mono.fromCallable(() -> {
            gitHubClient.commitAndPushFix(repoFullName, filePath, correctedCode, branchName);
            gitHubClient.triggerWorkflowValidation(repoFullName, branchName, "ci.yml");

            String validationStatus = "in_progress";
            int pollingAttempts = 0;
            while (("in_progress".equals(validationStatus) || "queued".equals(validationStatus)) && pollingAttempts < 20) {
                Thread.sleep(15000);
                validationStatus = gitHubClient.checkWorkflowStatus(repoFullName, branchName);
                pollingAttempts++;
            }
            return validationStatus;
        });
    }
}