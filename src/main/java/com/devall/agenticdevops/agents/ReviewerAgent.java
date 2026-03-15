package com.devall.agenticdevops.agents;

import com.devall.agenticdevops.clients.GitHubIntegrationClient;
import com.microsoft.semantickernel.Kernel;
import com.microsoft.semantickernel.services.chatcompletion.ChatCompletionService;
import com.microsoft.semantickernel.services.chatcompletion.ChatHistory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class ReviewerAgent {

    private final ChatCompletionService chatCompletionService;
    private final GitHubIntegrationClient gitHubClient;
    private final Kernel kernel;

    public ReviewerAgent(ChatCompletionService chatCompletionService, GitHubIntegrationClient gitHubClient) {
        this.chatCompletionService = chatCompletionService;
        this.gitHubClient = gitHubClient;
        this.kernel = Kernel.builder().build();
    }

    public Mono<Boolean> reviewAndApprove(String repoFullName, String branchName, String correctedCode, String rootCause) {
        ChatHistory history = new ChatHistory(
                "You are an Enterprise Security Reviewer Agent. Perform a security scan on the provided code. If it introduces any security vulnerabilities, respond with 'REJECTED'. If it is safe, provide a professional Markdown explanation of the fix for a Pull Request."
        );
        history.addUserMessage("Root Cause:\n" + rootCause + "\nCode:\n" + correctedCode);

        return chatCompletionService.getChatMessageContentsAsync(history, kernel, null)
                .flatMap(messages -> {
                    String reviewOutput = messages.get(0).getContent();
                    if (reviewOutput.contains("REJECTED")) {
                        return Mono.just(false);
                    }
                    try {
                        gitHubClient.createPullRequest(repoFullName, branchName, "Automated Fix Review", reviewOutput);
                        return Mono.just(true);
                    } catch (Exception e) {
                        return Mono.just(false);
                    }
                });
    }
}