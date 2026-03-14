package com.devall.agenticdevops;

import com.azure.ai.openai.OpenAIAsyncClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.core.credential.KeyCredential;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.semantickernel.Kernel;
import com.microsoft.semantickernel.services.chatcompletion.ChatCompletionService;
import com.microsoft.semantickernel.services.chatcompletion.ChatHistory;
import com.microsoft.semantickernel.aiservices.openai.chatcompletion.OpenAIChatCompletion;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class DevOpsAgentService {

    private final ChatCompletionService chatCompletionService;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    @Value("${github.api.token}")
    private String githubToken;

    public DevOpsAgentService(
            @Value("${ai.azure.openai.endpoint}") String endpoint,
            @Value("${ai.azure.openai.api-key}") String apiKey,
            @Value("${ai.azure.openai.deployment-name}") String deploymentName) {

        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
        
        this.objectMapper = new ObjectMapper();

        OpenAIAsyncClient client = new OpenAIClientBuilder()
                .endpoint(endpoint)
                .credential(new KeyCredential(apiKey))
                .buildAsyncClient();

        this.chatCompletionService = OpenAIChatCompletion.builder()
                .withOpenAIAsyncClient(client)
                .withModelId(deploymentName)
                .build();
    }

    public Mono<String> autoHealPipeline(String repoFullName, String runId, String workflowName) {
        System.out.println("🛠️ Initiating Auto-Heal for: " + repoFullName + " Run ID: " + runId);

        String rawLogs = fetchGitHubLogs(repoFullName, runId);
        
        if (rawLogs.startsWith("Error")) {
            return Mono.just("Aborted Auto-Heal. " + rawLogs);
        }

        ChatHistory chatHistory = new ChatHistory(
                "You are an autonomous CI/CD healer AI. " +
                "Analyze the provided GitHub Action logs, find the exact error, and generate the corrected code. " +
                "You MUST output your response as a strict JSON object with EXACTLY three keys: " +
                "'filePath' (the path to the broken file), 'explanation' (why it failed), and 'correctedCode' (the full fixed file content). " +
                "Do not include markdown blocks like ```json."
        );

        chatHistory.addUserMessage(String.format("Workflow '%s' failed. Here are the last 8000 characters of the logs:\n%s", workflowName, rawLogs));

        return chatCompletionService.getChatMessageContentsAsync(chatHistory, Kernel.builder().build(), null)
                .map(messages -> {
                    String aiJsonResponse = messages.get(0).getContent();
                    System.out.println("Initiating pull request sequence...");
                    
                    triggerGitHubPullRequest(repoFullName, aiJsonResponse);
                    return "Auto-Heal PR Created Successfully.";
                });
    }

    private String fetchGitHubLogs(String repoFullName, String runId) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI("[https://api.github.com/repos/](https://api.github.com/repos/)" + repoFullName + "/actions/runs/" + runId + "/logs"))
                    .header("Authorization", "Bearer " + githubToken)
                    .header("Accept", "application/vnd.github+json")
                    .GET()
                    .build();

            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            
            if (response.statusCode() != 200) {
                return "Error: GitHub returned status " + response.statusCode();
            }

            StringBuilder logBuilder = new StringBuilder();
            try (ZipInputStream zis = new ZipInputStream(response.body())) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {

                        if (!entry.isDirectory() && entry.getName().endsWith(".txt")) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            logBuilder.append(new String(buffer, 0, len, StandardCharsets.UTF_8));
                        }
                    }
                }
            }

            String fullLogs = logBuilder.toString();
            
            if (fullLogs.length() > 8000) {
                return fullLogs.substring(fullLogs.length() - 8000);
            }
            return fullLogs;

        } catch (Exception e) {
            e.printStackTrace();
            return "Error fetching logs: " + e.getMessage();
        }
    }

    private void triggerGitHubPullRequest(String repoFullName, String aiJsonPayload) {
        try {

            String cleanJson = aiJsonPayload.replaceAll("(?s)^```json\\s*|\\s*```$", "").trim();
            JsonNode node = objectMapper.readTree(cleanJson);
            
            String filePath = node.get("filePath").asText();
            String correctedCode = node.get("correctedCode").asText();
            String explanation = node.get("explanation").asText();
            
            String branchName = "devall-autofix-" + System.currentTimeMillis();
            
            HttpRequest getRefReq = buildGetRequest("[https://api.github.com/repos/](https://api.github.com/repos/)" + repoFullName + "/git/ref/heads/main");
            JsonNode refNode = objectMapper.readTree(httpClient.send(getRefReq, HttpResponse.BodyHandlers.ofString()).body());
            String mainSha = refNode.get("object").get("sha").asText();

            String createBranchJson = "{\"ref\": \"refs/heads/" + branchName + "\", \"sha\": \"" + mainSha + "\"}";
            HttpRequest createBranchReq = buildPostRequest("[https://api.github.com/repos/](https://api.github.com/repos/)" + repoFullName + "/git/refs", createBranchJson);
            httpClient.send(createBranchReq, HttpResponse.BodyHandlers.ofString());

            HttpRequest getFileReq = buildGetRequest("[https://api.github.com/repos/](https://api.github.com/repos/)" + repoFullName + "/contents/" + filePath + "?ref=" + branchName);
            JsonNode fileNode = objectMapper.readTree(httpClient.send(getFileReq, HttpResponse.BodyHandlers.ofString()).body());
            String fileSha = fileNode.get("sha").asText();

            String encodedCode = Base64.getEncoder().encodeToString(correctedCode.getBytes(StandardCharsets.UTF_8)).replace("\n", "");
            String updateFileJson = objectMapper.createObjectNode()
                    .put("message", "DevAll AI Auto-Fix: " + explanation)
                    .put("content", encodedCode)
                    .put("sha", fileSha)
                    .put("branch", branchName)
                    .toString();
            
            HttpRequest updateFileReq = buildPutRequest("[https://api.github.com/repos/](https://api.github.com/repos/)" + repoFullName + "/contents/" + filePath, updateFileJson);
            httpClient.send(updateFileReq, HttpResponse.BodyHandlers.ofString());

            String prJson = objectMapper.createObjectNode()
                    .put("title", "🛠️ DevAll AI Auto-Healer Fix")
                    .put("head", branchName)
                    .put("base", "main")
                    .put("body", "### DevAll Auto-Healer Analysis\n\n**Reason for failure:**\n" + explanation + "\n\n**Action taken:**\nAutomatically corrected `" + filePath + "`.")
                    .toString();

            HttpRequest createPrReq = buildPostRequest("[https://api.github.com/repos/](https://api.github.com/repos/)" + repoFullName + "/pulls", prJson);
            HttpResponse<String> prResponse = httpClient.send(createPrReq, HttpResponse.BodyHandlers.ofString());
            
            System.out.println("Pull Request created: " + prResponse.statusCode());

        } catch (Exception e) {
            System.err.println("Failed to create pull request: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private HttpRequest buildGetRequest(String uri) {
        return HttpRequest.newBuilder().uri(URI.create(uri))
                .header("Authorization", "Bearer " + githubToken)
                .header("Accept", "application/vnd.github+json")
                .GET().build();
    }

    private HttpRequest buildPostRequest(String uri, String body) {
        return HttpRequest.newBuilder().uri(URI.create(uri))
                .header("Authorization", "Bearer " + githubToken)
                .header("Accept", "application/vnd.github+json")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build();
    }

    private HttpRequest buildPutRequest(String uri, String body) {
        return HttpRequest.newBuilder().uri(URI.create(uri))
                .header("Authorization", "Bearer " + githubToken)
                .header("Accept", "application/vnd.github+json")
                .PUT(HttpRequest.BodyPublishers.ofString(body)).build();
    }
}