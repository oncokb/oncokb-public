package org.mskcc.cbio.oncokb.web.rest;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.mskcc.cbio.oncokb.domain.ContentNews;
import org.mskcc.cbio.oncokb.domain.DeveloperNews;
import org.mskcc.cbio.oncokb.domain.DeveloperNews.DeveloperPullRequest;
import org.mskcc.cbio.oncokb.domain.enumeration.DeveloperNewsType;
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
    
    private static final String ONCOKB_DATA_BRANCH = "master";
    private static final String ONCOKB_DATA_RELEASE_FOLDER = "https://api.github.com/repos/knowledgesystems/oncokb-data/contents/RELEASE";
    
    private static final String RELEASE_NOTES_REPO = "oncokb/oncokb";
    private static final String RELEASE_NOTES_RAW_URL = String.format("https://raw.githubusercontent.com/%s/refs/heads/master/release-notes", RELEASE_NOTES_REPO);
    private static final String RELEASE_NOTES_API_URL = String.format("https://api.github.com/repos/%s/contents/release-notes", RELEASE_NOTES_REPO);
    private static final String RELEASE_NOTES_DISPLAY_URL = String.format("https://github.com/%s/blob/master", RELEASE_NOTES_REPO);

    private final ObjectMapper objectMapper;
    private final ApplicationProperties applicationProperties;
    private final Logger log = LoggerFactory.getLogger(NewsResource.class);

    public NewsResource(ObjectMapper objectMapper, ApplicationProperties applicationProperties) {
        this.objectMapper = objectMapper;
        this.applicationProperties = applicationProperties;
    }

    private static volatile List<ContentNews> contentNews = null;
    private static volatile List<DeveloperNews> developerNews = Collections.emptyList();

    @PostConstruct
    public void init() {
        initDeveloperNews();
        initContentNews();
    }

    private void initContentNews() { // fetch content news from GitHub
        String token = applicationProperties.getOncokbDataToken();
        if (token.isEmpty()) {
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

    private void initDeveloperNews() {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            if (applicationProperties.getGithubToken() != null && !applicationProperties.getGithubToken().isEmpty()) {
                headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + applicationProperties.getGithubToken());
            }

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            ResponseEntity<List<GitHubFile>> response = restTemplate.exchange(
                RELEASE_NOTES_API_URL,
                HttpMethod.GET,
                requestEntity,
                new ParameterizedTypeReference<List<GitHubFile>>() {}
            );

            List<GitHubFile> releaseFolders = response.getBody();
            if (releaseFolders == null) {
                developerNews = Collections.emptyList();
                return;
            }

            List<CompletableFuture<DeveloperNews>> futures = releaseFolders.stream()
                .filter(file -> "dir".equals(file.type) && file.name != null && file.name.startsWith("v"))
                .map(file -> CompletableFuture.supplyAsync(() -> fetchDeveloperRelease(file, restTemplate, headers)))
                .collect(Collectors.toList());

            developerNews = futures.stream()
                .map(CompletableFuture::join)
                .filter(Objects::nonNull)
                .sorted((r1, r2) -> compareSemver(r1.getName(), r2.getName()))
                .collect(Collectors.toList());

            log.info("Developer news initialized");
        } catch (Exception e) {
            log.warn("Error initializing developer news: {}", e.getMessage());
            developerNews = Collections.emptyList();
        }
    }

    private DeveloperNews fetchDeveloperRelease(
        GitHubFile releaseFolder,
        RestTemplate restTemplate,
        HttpHeaders headers
    ) {
        try {
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            ResponseEntity<List<GitHubFile>> releaseResponse = restTemplate.exchange(
                String.format("%s/%s", RELEASE_NOTES_API_URL, releaseFolder.name),
                HttpMethod.GET,
                requestEntity,
                new ParameterizedTypeReference<List<GitHubFile>>() {}
            );

            Map<String, String> metadataFiles = Collections.emptyMap();
            String publishedAt = null;
            ResponseEntity<String> metadataResponse = restTemplate.exchange(
                String.format("%s/%s/metadata.json", RELEASE_NOTES_RAW_URL, releaseFolder.name),
                HttpMethod.GET,
                requestEntity,
                String.class
            );
            String metadataBody = metadataResponse.getBody();
            if (metadataBody != null) {
                ReleaseMetadata metadata = objectMapper.readValue(metadataBody, ReleaseMetadata.class);
                if (metadata != null) {
                    metadataFiles = metadata.files != null ? metadata.files : Collections.emptyMap();
                    publishedAt = metadata.publishedAt;
                }
            }
            final Map<String, String> metadataFilesMap = metadataFiles;

            List<GitHubFile> filesInRelease = releaseResponse.getBody() == null
                ? Collections.emptyList()
                : releaseResponse.getBody();

            List<DeveloperPullRequest> pullRequests = filesInRelease.stream()
                .filter(file -> file.name != null)
                .filter(file -> !"metadata.json".equals(file.name))
                .map(file -> {
                    String[] parts = file.name.split("-");
                    DeveloperNewsType type = parts.length > 2
                        ? DeveloperNewsType.fromValue(parts[2])
                        : DeveloperNewsType.CHORE;
                    String title = metadataFilesMap.getOrDefault(file.name, file.name);
                    return new DeveloperPullRequest(
                        title,
                        String.format("%s/%s", RELEASE_NOTES_DISPLAY_URL, file.path),
                        type
                    );
                })
                .collect(Collectors.toList());

            return new DeveloperNews(releaseFolder.name, publishedAt, pullRequests);
        } catch (Exception e) {
            log.warn("Error fetching developer news for release {}: {}", releaseFolder.name, e.getMessage());
            return null;
        }
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

    @GetMapping("/developer-news")
    public ResponseEntity<List<DeveloperNews>> getDeveloperNews() {
        return ResponseEntity.ok(developerNews);
    }

    private static class GitHubFile {
        @JsonProperty("path")
        private String path;
        @JsonProperty("name")
        private String name;
        @JsonProperty("type")
        private String type;
    }

    private static class ReleaseMetadata {
        @JsonProperty("published_at")
        private String publishedAt;

        @JsonProperty("files")
        private Map<String, String> files = Collections.emptyMap();
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
