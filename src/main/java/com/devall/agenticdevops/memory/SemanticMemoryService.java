package com.devall.agenticdevops.memory;

import com.microsoft.semantickernel.memory.MemoryQueryResult;
import com.microsoft.semantickernel.memory.SemanticTextMemory;
import com.microsoft.semantickernel.memory.VolatileMemoryStore;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class SemanticMemoryService {

    private final SemanticTextMemory memory;
    private final String incidentCollection = "resolved_incidents";

    public SemanticMemoryService() {
        this.memory = SemanticTextMemory.builder()
                .withMemoryStore(new VolatileMemoryStore())
                .build();
    }

    public Mono<String> findSimilarIncidentResolution(String errorSignature) {
        return memory.searchAsync(incidentCollection, errorSignature, 1, 0.85f, true)
                .map(results -> {
                    List<MemoryQueryResult> list = results.block();
                    if (list != null && !list.isEmpty()) {
                        return list.get(0).getMetadata().getText();
                    }
                    return "NO_MATCH";
                });
    }

    public Mono<Void> storeSuccessfulResolution(String incidentId, String errorSignature, String appliedFix) {
        return memory.saveInformationAsync(
                incidentCollection,
                appliedFix,
                incidentId,
                errorSignature,
                null
        );
    }
}