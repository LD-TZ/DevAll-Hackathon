package com.devall.agenticdevops.memory;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SemanticMemoryService {

    private final Map<String, String> incidentMemory = new ConcurrentHashMap<>();

    public Mono<String> findSimilarIncidentResolution(String errorSignature) {
        return Mono.fromCallable(() -> {
            for (Map.Entry<String, String> entry : incidentMemory.entrySet()) {
                if (errorSignature.contains(entry.getKey()) || entry.getKey().contains(errorSignature)) {
                    return entry.getValue();
                }
            }
            return "NO_MATCH";
        });
    }

    public Mono<Void> storeSuccessfulResolution(String incidentId, String errorSignature, String appliedFix) {
        return Mono.fromRunnable(() -> {
            String signatureKey = errorSignature.length() > 500 ? errorSignature.substring(0, 500) : errorSignature;
            incidentMemory.put(signatureKey, appliedFix);
        });
    }
}