package com.devall.agenticdevops;

import com.github.difflib.DiffUtils;
import com.github.difflib.patch.Patch;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class ExecutionEngineService {

    @Cacheable(value = "pipelineExecutions", key = "#aiCorrectedCode.hashCode()")
    public Map<String, Object> executeAndAnalyze(String originalCode, String aiCorrectedCode, String pipelineType) {
        Map<String, Object> response = new HashMap<>();

        List<String> originalLines = Arrays.asList(originalCode.split("\n"));
        List<String> revisedLines = Arrays.asList(aiCorrectedCode.split("\n"));
        Patch<String> patch = DiffUtils.diff(originalLines, revisedLines);

        long startTime = System.currentTimeMillis();
        String stdout = "";
        String stderr = "";
        boolean success = false;
        
        try {
            Path tempScript = Files.createTempFile("devall_pipeline_", ".py");
            Files.writeString(tempScript, aiCorrectedCode, StandardOpenOption.WRITE);

            ProcessBuilder processBuilder = new ProcessBuilder("python", tempScript.toString());
            processBuilder.directory(new File(System.getProperty("java.io.tmpdir")));
            Process process = processBuilder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder outStr = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                outStr.append(line).append("\n");
            }
            stdout = outStr.toString();

            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            StringBuilder errStr = new StringBuilder();
            while ((line = errorReader.readLine()) != null) {
                errStr.append(line).append("\n");
            }
            stderr = errStr.toString();

            success = process.waitFor(30, TimeUnit.SECONDS);
            
            Files.deleteIfExists(tempScript);

        } catch (Exception e) {
            stderr = "System Execution Exception: " + e.getMessage();
        }

        long executionTimeMs = System.currentTimeMillis() - startTime;
        
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("executionTimeMs", executionTimeMs);
        metrics.put("status", success && stderr.isEmpty() ? "SUCCESS" : "FAILED");
        metrics.put("memoryAllocatedMb", Runtime.getRuntime().totalMemory() / (1024 * 1024));

        response.put("originalCode", originalCode);
        response.put("correctedCode", aiCorrectedCode);
        response.put("diffDeltas", patch.getDeltas().size());
        
        if ("SQL".equalsIgnoreCase(pipelineType)) {
            response.put("sqlModeling", stdout.trim());
            response.put("jsonOutput", "{}");
        } else {
            response.put("jsonOutput", stdout.trim().isEmpty() ? stderr.trim() : stdout.trim());
        }

        response.put("metrics", metrics);
        response.put("aiRecommendation", success && stderr.isEmpty() 
            ? "Execution passed. Data payload successfully generated." 
            : "Execution failed. Review stderr logs for syntax or dependency issues.");

        return response;
    }
}