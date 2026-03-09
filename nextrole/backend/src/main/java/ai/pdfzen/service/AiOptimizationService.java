package ai.pdfzen.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * OpenAI integration for resume optimization and suggestions.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AiOptimizationService {

    private static final String OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();

    private final ObjectMapper objectMapper;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:gpt-4o-mini}")
    private String model;

    public String optimizeResumeText(String extractedText, String jobType, Map<String, Object> context) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("No AI API key configured; returning extracted text as-is");
            return extractedText;
        }
        try {
            String targetRole = context != null ? (String) context.getOrDefault("targetRole", "") : "";
            String targetIndustry = context != null ? (String) context.getOrDefault("targetIndustry", "") : "";

            StringBuilder userPrompt = new StringBuilder();
            userPrompt.append("You are an expert resume writer and ATS optimization specialist.\n")
                    .append("Job type: ").append(jobType == null ? "general" : jobType).append("\n");
            if (!targetRole.isBlank()) {
                userPrompt.append("Target role: ").append(targetRole).append("\n");
            }
            if (!targetIndustry.isBlank()) {
                userPrompt.append("Target industry: ").append(targetIndustry).append("\n");
            }
            userPrompt.append("\nRewrite the following resume content to be clearer, more impactful, ")
                    .append("and optimized for modern ATS systems while preserving factual accuracy. ")
                    .append("Return ONLY the improved resume text, without additional commentary.\n\n")
                    .append("=== ORIGINAL RESUME TEXT ===\n")
                    .append(extractedText);

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("temperature", 0.7);
            body.put("messages", List.of(
                    Map.of(
                            "role", "system",
                            "content", "You are an expert resume writer who produces concise, professional resumes."
                    ),
                    Map.of(
                            "role", "user",
                            "content", userPrompt.toString()
                    )
            ));

            String responseContent = callOpenAi(body);
            if (responseContent == null || responseContent.isBlank()) {
                log.warn("Empty response from OpenAI for optimizeResumeText; returning original text");
                return extractedText;
            }
            return responseContent.trim();
        } catch (Exception e) {
            log.error("Failed to optimize resume text via OpenAI", e);
            // Fallback to original text on error
            return extractedText;
        }
    }

    public Map<String, Object> getSuggestions(String extractedText, String jobType, Map<String, Object> context) {
        Map<String, Object> suggestions = new HashMap<>();

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("No AI API key configured; returning placeholder suggestions");
            suggestions.put("summary", "Configure OPENAI_API_KEY for AI-powered suggestions.");
            suggestions.put("keywords", List.of());
            suggestions.put("improvements", List.of());
            return suggestions;
        }

        try {
            String targetRole = context != null ? (String) context.getOrDefault("targetRole", "") : "";
            String targetIndustry = context != null ? (String) context.getOrDefault("targetIndustry", "") : "";

            StringBuilder userPrompt = new StringBuilder();
            userPrompt.append("You are an expert resume reviewer and ATS optimization specialist.\n")
                    .append("Job type: ").append(jobType == null ? "general" : jobType).append("\n");
            if (!targetRole.isBlank()) {
                userPrompt.append("Target role: ").append(targetRole).append("\n");
            }
            if (!targetIndustry.isBlank()) {
                userPrompt.append("Target industry: ").append(targetIndustry).append("\n");
            }
            userPrompt.append("\nAnalyze the resume content below and respond ONLY with a JSON object ")
                    .append("having the following structure:\n")
                    .append("{\n")
                    .append("  \"summary\": string,\n")
                    .append("  \"keywords\": string[],\n")
                    .append("  \"improvements\": string[]\n")
                    .append("}\n\n")
                    .append("The \"keywords\" array should list the most important skills, tools, and domains. ")
                    .append("The \"improvements\" array should be concrete suggestions for how to strengthen the resume.\n\n")
                    .append("=== RESUME TEXT ===\n")
                    .append(extractedText);

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("temperature", 0.4);
            body.put("response_format", Map.of("type", "json_object"));
            body.put("messages", List.of(
                    Map.of(
                            "role", "system",
                            "content", "You are an expert resume reviewer who outputs strict JSON only."
                    ),
                    Map.of(
                            "role", "user",
                            "content", userPrompt.toString()
                    )
            ));

            String responseContent = callOpenAi(body);
            if (responseContent == null || responseContent.isBlank()) {
                log.warn("Empty response from OpenAI for getSuggestions; returning placeholder suggestions");
                suggestions.put("summary", "Unable to generate suggestions at this time.");
                suggestions.put("keywords", List.of());
                suggestions.put("improvements", List.of());
                return suggestions;
            }

            Map<String, Object> parsed = objectMapper.readValue(
                    responseContent,
                    new TypeReference<Map<String, Object>>() {}
            );
            suggestions.putAll(parsed);
            return suggestions;
        } catch (Exception e) {
            log.error("Failed to get suggestions via OpenAI", e);
            suggestions.put("summary", "Error while generating AI suggestions.");
            suggestions.put("keywords", List.of());
            suggestions.put("improvements", List.of());
            return suggestions;
        }
    }

    private String callOpenAi(Map<String, Object> body) throws Exception {
        try {
            String requestJson = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_CHAT_COMPLETIONS_URL))
                    .timeout(Duration.ofSeconds(60))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() / 100 != 2) {
                String responseBody = response.body();
                String truncated = responseBody == null ? "" : responseBody.substring(0, Math.min(4000, responseBody.length()));
                log.error("OpenAI API error: status={}, body(truncated)={}", response.statusCode(), truncated);
                throw new IllegalStateException("OpenAI API returned non-success status: " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
            if (contentNode.isMissingNode() || contentNode.isNull()) {
                String responseBody = response.body();
                String truncated = responseBody == null ? "" : responseBody.substring(0, Math.min(4000, responseBody.length()));
                log.error("Unexpected OpenAI response format. body(truncated)={}", truncated);
                throw new IllegalStateException("OpenAI response missing content");
            }
            return contentNode.asText();
        } catch (Exception e) {
            log.error("OpenAI API call failed: {}", e.getMessage(), e);
            throw e;
        }
    }
}
