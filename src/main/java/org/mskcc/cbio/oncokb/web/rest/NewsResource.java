package org.mskcc.cbio.oncokb.web.rest;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.mskcc.cbio.oncokb.domain.ContentNews;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/news")
public class NewsResource {
    
    private static final String ONCOKB_DATA_BRANCH = "data-release-v7.5";
    private static final String ONCOKB_DATA_RELEASE_FOLDER = "https://api.github.com/repos/knowledgesystems/oncokb-data/contents/RELEASE";

    private final ObjectMapper objectMapper;
    private final ApplicationProperties applicationProperties;
    private final Logger log = LoggerFactory.getLogger(NewsResource.class);

    public NewsResource(ObjectMapper objectMapper, ApplicationProperties applicationProperties) {
        this.objectMapper = objectMapper;
        this.applicationProperties = applicationProperties;
    }

    private static volatile List<ContentNews> contentNews = null;

    @PostConstruct
    public void init() { // fetch content news from GitHub
        String token = applicationProperties.getOncokbDataToken();
        if (token == "") {
            log.info("OncoKB Data token not set, content news will not be populated");
            return;
        }

        RestTemplate restTemplate = new RestTemplate();
        String url = String.format("%s?ref=%s", ONCOKB_DATA_RELEASE_FOLDER, ONCOKB_DATA_BRANCH);
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + token);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        ResponseEntity<List<GitHubFile>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            requestEntity,
            new ParameterizedTypeReference<List<GitHubFile>>() {}
        );

        List<GitHubFile> gitHubFiles = response.getBody();
        headers.set("Accept", "application/vnd.github.raw+json");
        Map<String, ContentNews> contentNewsByFilename = new ConcurrentHashMap<>();
        
        List<CompletableFuture<Void>> futures = gitHubFiles.stream()
            .filter(file -> "dir".equals(file.type) && file.name != null && file.name.startsWith("v"))
            .map(file -> CompletableFuture.runAsync(() -> {
                String contentNewsUrl = String.format("%s/%s/content_news.json?ref=%s", ONCOKB_DATA_RELEASE_FOLDER, file.name, ONCOKB_DATA_BRANCH);
                
                try {
                    HttpEntity<Void> entity = new HttpEntity<>(headers);
            
                    ResponseEntity<String> contentNewsResp = restTemplate.exchange(
                        contentNewsUrl,
                        HttpMethod.GET,
                        entity,
                        String.class
                    );

                    String body = contentNewsResp.getBody();
                    ContentNews contentNews = objectMapper.readValue(body, ContentNews.class);
                    contentNews.setDataVersion(file.name);
                    contentNewsByFilename.put(file.name, contentNews);
                } catch (Exception e) { 
                    log.warn(String.format("Error fetching content news for data version %s: %s", file.name, e.getMessage()));
                }
            }))
            .collect(Collectors.toList());
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        contentNews = contentNewsByFilename.entrySet()
            .stream()
            .sorted((e1, e2) -> compareSemver(e1.getKey(), e2.getKey()))
            .map(Map.Entry::getValue)
            .collect(Collectors.toList());

        log.info("Content news initialized");
    }

    /**
     * {@code GET  /content-news} : get all OncoKB content news
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with the body a map from the data release version to its content news
     */
    @GetMapping("/content-news")
    public ResponseEntity<List<ContentNews>> getContentNews() throws IOException {
        return ResponseEntity.ok(contentNews);
    }

    private static class GitHubFile {
        @JsonProperty("path")
        private String path;
        @JsonProperty("name")
        private String name;
        @JsonProperty("type")
        private String type;
    }

    private int compareSemver(String v1, String v2) {
        String[] parts1 = v1.replaceFirst("^v", "").split("\\.");
        String[] parts2 = v2.replaceFirst("^v", "").split("\\.");

        int maj1 = Integer.parseInt(parts1[0]);
        int min1 = Integer.parseInt(parts1[1]);
        int pat1 = Integer.parseInt(parts1[2]);

        int maj2 = Integer.parseInt(parts2[0]);
        int min2 = Integer.parseInt(parts2[1]);
        int pat2 = Integer.parseInt(parts2[2]);

        // Compare major, then minor, then patch (v2 - v1 for descending)
        if (maj2 != maj1) return maj2 - maj1;
        if (min2 != min1) return min2 - min1;
        return pat2 - pat1;
    }
}
