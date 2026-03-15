package com.devall.agenticdevops.models;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public class Models {

    public record Incident(String id, String repo, String error, String time, String status) {}
    
    public record AgentStatus(String name, String desc, boolean isOnline) {}

    public record ExecutionContext(
        UUID pipelineId,
        String originalCode,
        String correctedCode,
        String sqlModeling,
        Map<String, Object> polarsDataPayload,
        Metrics metrics,
        String status // STAGED, RUNNING, SUCCESS, FAILED, PENDING_APPROVAL
    ) {}

    public record Metrics(String status, long executionTimeMs, int memoryAllocatedMb) {}
    
    public record PipelineTriggerRequest(String repo, String errorLog) {}
}