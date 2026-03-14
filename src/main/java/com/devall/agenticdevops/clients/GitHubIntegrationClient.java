package com.devall.agenticdevops.clients;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Component
public class GitHubIntegrationClient {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String githubToken;

    public GitHubIntegrationClient(@Value("${github.api.token}") String githubToken) {
        this.httpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();
        this.objectMapper = new ObjectMapper();
        this.githubToken = githubToken;
    }

    public String fetchWorkflowLogs(String repoFullName, String runId) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI("https://api.github.com/repos/" + repoFullName + "/actions/runs/" + runId + "/logs"))
                .header("Authorization", "Bearer " + githubToken)
                .header("Accept", "application/vnd.github+json")
                .GET().build();

        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        if (response.statusCode() != 200) {
            throw new RuntimeException("GitHub_API_Error_" + response.statusCode());
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
        return fullLogs.length() > 8000 ? fullLogs.substring(fullLogs.length() - 8000) : fullLogs;
    }

    public String commitAndPushFix(String repoFullName, String filePath, String correctedCode, String branchName) throws Exception {
        HttpRequest getRefReq = buildGetRequest("https://api.github.com/repos/" + repoFullName + "/git/ref/heads/main");
        JsonNode refNode = objectMapper.readTree(httpClient.send(getRefReq, HttpResponse.BodyHandlers.ofString()).body());
        String mainSha = refNode.get("object").get("sha").asText();

        String createBranchJson = "{\"ref\": \"refs/heads/" + branchName + "\", \"sha\": \"" + mainSha + "\"}";
        httpClient.send(buildPostRequest("https://api.github.com/repos/" + repoFullName + "/git/refs", createBranchJson), HttpResponse.BodyHandlers.ofString());

        HttpRequest getFileReq = buildGetRequest("https://api.github.com/repos/" + repoFullName + "/contents/" + filePath + "?ref=" + branchName);
        JsonNode fileNode = objectMapper.readTree(httpClient.send(getFileReq, HttpResponse.BodyHandlers.ofString()).body());
        String fileSha = fileNode.get("sha").asText();

        String encodedCode = Base64.getEncoder().encodeToString(correctedCode.getBytes(StandardCharsets.UTF_8)).replace("\n", "");
        String updateFileJson = objectMapper.createObjectNode()
                .put("message", "DevAll Automated Fix Validation")
                .put("content", encodedCode)
                .put("sha", fileSha)
                .put("branch", branchName).toString();

        httpClient.send(buildPutRequest("https://api.github.com/repos/" + repoFullName + "/contents/" + filePath, updateFileJson), HttpResponse.BodyHandlers.ofString());
        return branchName;
    }

    public void triggerWorkflowValidation(String repoFullName, String branchName, String workflowId) throws Exception {
        String payload = "{\"ref\": \"" + branchName + "\"}";
        httpClient.send(buildPostRequest("https://api.github.com/repos/" + repoFullName + "/actions/workflows/" + workflowId + "/dispatches", payload), HttpResponse.BodyHandlers.ofString());
    }

    public String checkWorkflowStatus(String repoFullName, String branchName) throws Exception {
        HttpRequest request = buildGetRequest("https://api.github.com/repos/" + repoFullName + "/actions/runs?branch=" + branchName);
        JsonNode responseNode = objectMapper.readTree(httpClient.send(request, HttpResponse.BodyHandlers.ofString()).body());
        JsonNode runs = responseNode.get("workflow_runs");
        if (runs != null && runs.isArray() && runs.size() > 0) {
            JsonNode latestRun = runs.get(0);
            String status = latestRun.get("status").asText();
            if ("completed".equals(status)) {
                return latestRun.get("conclusion").asText();
            }
            return status;
        }
        return "unknown";
    }

    public void createPullRequest(String repoFullName, String branchName, String title, String explanation) throws Exception {
        String prJson = objectMapper.createObjectNode()
                .put("title", title)
                .put("head", branchName)
                .put("base", "main")
                .put("body", explanation).toString();
        httpClient.send(buildPostRequest("https://api.github.com/repos/" + repoFullName + "/pulls", prJson), HttpResponse.BodyHandlers.ofString());
    }

    private HttpRequest buildGetRequest(String uri) {
        return HttpRequest.newBuilder().uri(URI.create(uri)).header("Authorization", "Bearer " + githubToken).header("Accept", "application/vnd.github+json").GET().build();
    }

    private HttpRequest buildPostRequest(String uri, String body) {
        return HttpRequest.newBuilder().uri(URI.create(uri)).header("Authorization", "Bearer " + githubToken).header("Accept", "application/vnd.github+json").POST(HttpRequest.BodyPublishers.ofString(body)).build();
    }

    private HttpRequest buildPutRequest(String uri, String body) {
        return HttpRequest.newBuilder().uri(URI.create(uri)).header("Authorization", "Bearer " + githubToken).header("Accept", "application/vnd.github+json").PUT(HttpRequest.BodyPublishers.ofString(body)).build();
    }
}