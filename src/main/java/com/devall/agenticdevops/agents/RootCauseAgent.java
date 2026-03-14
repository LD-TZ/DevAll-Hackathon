package com.devall.agenticdevops.agents;

import com.devall.agenticdevops.memory.SemanticMemoryService;
import com.microsoft.semantickernel.Kernel;
import com.microsoft.semantickernel.services.chatcompletion.ChatCompletionService;
import com.microsoft.semantickernel.services.chatcompletion.ChatHistory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class RootCauseAgent {

    private final ChatCompletionService chatCompletionService;
    private final SemanticMemoryService semanticMemoryService;
    private final Kernel kernel;

    public RootCauseAgent(ChatCompletionService chatCompletionService, SemanticMemoryService semanticMemoryService) {
        this.chatCompletionService = chatCompletionService;
        this.semanticMemoryService = semanticMemoryService;
        this.kernel = Kernel.builder().build();
    }

    public Mono<String> determineRootCause(String logs) {
        return semanticMemoryService.findSimilarIncidentResolution(logs)
                .flatMap(historicalData -> {
                    ChatHistory history = new ChatHistory(
                            "You are an Azure SRE Agent. Analyze the logs and correlate with the provided historical data. Identify the exact root cause of the failure. Output only the technical root cause."
                    );
                    history.addUserMessage("Logs:\n" + logs + "\nHistorical Context:\n" + historicalData);
                    return chatCompletionService.getChatMessageContentsAsync(history, kernel, null)
                            .map(messages -> messages.get(0).getContent());
                });
    }
}