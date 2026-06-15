package com.internNova.InternNova.client;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.internNova.InternNova.dto.EvaluateRequestDTO;
import com.internNova.InternNova.dto.EvaluateResponseDTO;
import com.internNova.InternNova.dto.GenerateResumeRequestDTO;
import com.internNova.InternNova.dto.GenerateResumeResponseDTO;

/**
 * Thin HTTP client for the internal AI pipeline service. The only thing in
 * core-service that knows the AI service exists; everything else talks to it
 * through {@link EvaluateRequestDTO} / {@link EvaluateResponseDTO}.
 */
@Component
public class AiPipelineClient {

    private static final Logger log = LoggerFactory.getLogger(AiPipelineClient.class);

    private final RestClient restClient;
    private final String baseUrl;

    public AiPipelineClient(@Value("${ai.service.base-url}") String baseUrl) {
        this.baseUrl = baseUrl;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofSeconds(90));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
        log.info("AiPipelineClient configured with base URL: {}", baseUrl);
    }

    public EvaluateResponseDTO evaluate(EvaluateRequestDTO request) {
        log.info("POST {}/pipeline/v1/evaluate for application {}", baseUrl, request.getApplicationId());
        return restClient.post()
                .uri("/pipeline/v1/evaluate")
                .body(request)
                .retrieve()
                .onStatus(status -> status.value() >= 400, (req, resp) -> {
                    String body = new String(resp.getBody().readAllBytes());
                    log.error("AI service returned {} for evaluate: {}", resp.getStatusCode(), body);
                    throw new RuntimeException(
                            "AI service error (" + resp.getStatusCode() + "): " + body);
                })
                .body(EvaluateResponseDTO.class);
    }

    public GenerateResumeResponseDTO generateResume(GenerateResumeRequestDTO request) {
        return restClient.post()
                .uri("/pipeline/v1/generate-resume")
                .body(request)
                .retrieve()
                .onStatus(status -> status.value() >= 400, (req, resp) -> {
                    String body = new String(resp.getBody().readAllBytes());
                    log.error("AI service returned {} for generate-resume: {}", resp.getStatusCode(), body);
                    throw new RuntimeException(
                            "AI service error (" + resp.getStatusCode() + "): " + body);
                })
                .body(GenerateResumeResponseDTO.class);
    }
}
