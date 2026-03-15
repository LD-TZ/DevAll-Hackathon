package com.devall.agenticdevops;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.semantickernel.Kernel;
import com.microsoft.semantickernel.services.chatcompletion.ChatCompletionService;
import com.microsoft.semantickernel.services.chatcompletion.ChatHistory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class DataAgentService {

    private final ChatCompletionService chatCompletionService;
    private final ObjectMapper objectMapper;

    public DataAgentService(ChatCompletionService chatCompletionService) {
        this.chatCompletionService = chatCompletionService;
        this.objectMapper = new ObjectMapper();
    }

    public Mono<String> generateEnterpriseEtl(String sourceFormat, String sampleData, String targetDestination) {
        ChatHistory chatHistory = new ChatHistory(
                "You are an elite Enterprise Data Architect. Your task is to generate fully functional, resilient Python ETL pipelines. " +
                "MANDATORY LOGIC: " +
                "1. SYNCHRONOUS EXECUTION: The script must fetch data, print the JSON array to stdout, and exit. Do not use web servers. " +
                "2. ENCODING: You MUST include `import sys` and `sys.stdout.reconfigure(encoding='utf-8')` at the top. " +
                "3. API RESILIENCE: Safely check if the response was successful. Extract arrays safely using `.get('data', [])` or similar logic. " +
                "4. STRICT POLARS USAGE: You MUST use 'polars' (import polars as pl). IT IS STRICTLY FORBIDDEN TO USE 'pandas'. " +
                "5. DATA PROCESSING: Convert the extracted array to a DataFrame using `df = pl.DataFrame(data)`. " +
                "6. EXACT OUTPUT SYNTAX: You MUST print the final output using EXACTLY: `print(df.write_json())`. " +
                "7. AUTHENTICATION HANDLING: If the API documentation requires an API key, Auth-Key, or token, check if the user provided a real one in the input. If they did NOT, you MUST NOT use fake placeholders like 'YOUR-KEY-HERE'. Instead, write a script that bypasses the requests library entirely and exactly does this: `df = pl.DataFrame([{'DevAll_System_Alert': 'Authentication required. Please append your API Key to the input box.'}]); print(df.write_json())` and exits. " +
                "8. You MUST output a strict JSON object with exactly 4 keys: 'appPy', 'requirementsTxt', 'dockerfile', 'integrationSteps'. " +
                "Do NOT use markdown blocks like ```json around your response. Return pure JSON."
        );

        String prompt = String.format(
                "Source Format: %s\nRaw Input Data / Endpoint / Docs: %s\nTarget Destination: %s\nGenerate the complete pipeline ecosystem.",
                sourceFormat, sampleData, targetDestination
        );

        chatHistory.addUserMessage(prompt);

        return chatCompletionService.getChatMessageContentsAsync(chatHistory, Kernel.builder().build(), null)
                .map(messages -> {
                    String rawJson = messages.get(0).getContent();
                    try {
                        JsonNode node = objectMapper.readTree(rawJson);
                        if (node.has("appPy")) {
                            return node.get("appPy").asText();
                        }
                        return rawJson;
                    } catch (Exception e) {
                        return rawJson;
                    }
                });
    }
}