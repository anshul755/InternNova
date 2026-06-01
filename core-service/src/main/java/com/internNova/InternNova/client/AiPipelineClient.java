package com.internNova.InternNova.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.internNova.InternNova.dto.EvaluateRequestDTO;
import com.internNova.InternNova.dto.EvaluateResponseDTO;

/**
 * Thin HTTP client for the internal AI pipeline service. The only thing in
 * core-service that knows the AI service exists; everything else talks to it
 * through {@link EvaluateRequestDTO} / {@link EvaluateResponseDTO}.
 */
@Component
public class AiPipelineClient {

    private final RestClient restClient;

    public AiPipelineClient(@Value("${ai.service.base-url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public EvaluateResponseDTO evaluate(EvaluateRequestDTO request) {
        return restClient.post()
                .uri("/pipeline/v1/evaluate")
                .body(request)
                .retrieve()
                .body(EvaluateResponseDTO.class);
    }
}
