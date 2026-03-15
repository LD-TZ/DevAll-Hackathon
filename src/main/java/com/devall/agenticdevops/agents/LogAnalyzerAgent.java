package com.devall.agenticdevops.agents;

import com.devall.agenticdevops.clients.GitHubIntegrationClient;
import org.springframework.stereotype.Service;

@Service
public class LogAnalyzerAgent {

    private final GitHubIntegrationClient gitHubClient;

    public LogAnalyzerAgent(GitHubIntegrationClient gitHubClient) {
        this.gitHubClient = gitHubClient;
    }

    public String analyzeLogs(String repoFullName, String runId) {
        try {
            return gitHubClient.fetchWorkflowLogs(repoFullName, runId);
        } catch (Exception e) {
            return "ERROR_FETCHING_LOGS";
        }
    }
}