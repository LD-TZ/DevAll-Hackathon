package com.devall.agenticdevops;

import com.azure.ai.openai.OpenAIAsyncClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.core.credential.KeyCredential;
import com.microsoft.semantickernel.Kernel;
import com.microsoft.semantickernel.services.chatcompletion.ChatCompletionService;
import com.microsoft.semantickernel.services.chatcompletion.ChatHistory;
import com.microsoft.semantickernel.aiservices.openai.chatcompletion.OpenAIChatCompletion;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class DataAgentService {

    private final ChatCompletionService chatCompletionService;

    public DataAgentService(
            @Value("${ai.azure.openai.endpoint}") String endpoint,
            @Value("${ai.azure.openai.api-key}") String apiKey,
            @Value("${ai.azure.openai.deployment-name}") String deploymentName) {

        OpenAIAsyncClient client = new OpenAIClientBuilder()
                .endpoint(endpoint)
                .credential(new KeyCredential(apiKey))
                .buildAsyncClient();

        this.chatCompletionService = OpenAIChatCompletion.builder()
                .withOpenAIAsyncClient(client)
                .withModelId(deploymentName)
                .build();
    }

    public Mono<String> generateEnterpriseEtl(String sourceFormat, String sampleData, String targetDestination) {
        System.out.println("DevAll AI generating - ETL for destination: " + targetDestination);

        ChatHistory chatHistory = new ChatHistory(
                "You are an elite Enterprise Data Architect specialized in the Microsoft ecosystem. " +
                "Your task is to generate fully functional, deployable Python ETL pipelines. " +
                "MANDATORY LOGIC: " +
                "1. If the target is 'Power BI', you MUST wrap the data transformation in a FastAPI application, expose an endpoint returning a JSON array of records, and include logic to parse the source format (JSON/XML/CSV) into a Pandas DataFrame first. " +
                "2. If the target is 'Azure Data Lake' or 'Synapse', you MUST use the official azure-storage-file-datalake SDK. " +
                "3. You MUST output a strict JSON object with exactly 4 keys: " +
                "'appPy' (the complete, runnable Python code), " +
                "'requirementsTxt' (all pip dependencies), " +
                "'dockerfile' (a Dockerfile ready for Azure App Service/Container Apps), " +
                "'integrationSteps' (step-by-step instructions on how to consume this in the target Microsoft tool). " +
                "Do NOT use markdown code blocks like ```json around your response. Return pure JSON." +
                "Do NOT USE EMOJIS or ANY OTHER UNPROFESSIONAL LANGUAGE."
        );

        String prompt = String.format(
                "Source Format: %s\nSample Data: %s\nTarget Destination: %s\nGenerate the complete pipeline ecosystem.",
                sourceFormat, sampleData, targetDestination
        );

        chatHistory.addUserMessage(prompt);

        return chatCompletionService.getChatMessageContentsAsync(chatHistory, Kernel.builder().build(), null)
                .map(messages -> {
                    String aiResponse = messages.get(0).getContent();
                    System.out.println("ETL system generated Successfully.");
                    return aiResponse;
                });
    }
}