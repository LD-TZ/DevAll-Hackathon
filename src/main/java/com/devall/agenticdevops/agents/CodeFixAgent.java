package com.devall.agenticdevops.agents;

import com.microsoft.semantickernel.Kernel;
import com.microsoft.semantickernel.services.chatcompletion.ChatCompletionService;
import com.microsoft.semantickernel.services.chatcompletion.ChatHistory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CodeFixAgent {

    private final ChatCompletionService chatCompletionService;
    private final Kernel kernel;

    public CodeFixAgent(ChatCompletionService chatCompletionService) {
        this.chatCompletionService = chatCompletionService;
        this.kernel = Kernel.builder().build();
    }

    public Mono<String> generateFix(String rootCause, String logs, String feedbackContext) {
        ChatHistory history = new ChatHistory(
                "You are a GitHub Copilot Coding Agent. Based on the root cause and logs, generate the fix. You MUST output a strict JSON object with exactly 3 keys: 'filePath', 'explanation', and 'correctedCode'. Do not include markdown blocks."
        );
        String prompt = "Root Cause:\n" + rootCause + "\nLogs:\n" + logs;
        if (feedbackContext != null && !feedbackContext.isEmpty()) {
            prompt += "\nPrevious Attempt Feedback:\n" + feedbackContext;
        }
        history.addUserMessage(prompt);

        return chatCompletionService.getChatMessageContentsAsync(history, kernel, null)
                .map(messages -> messages.get(0).getContent());
    }
}