package org.mskcc.cbio.oncokb.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Oncokb.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link io.github.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {
    private String apiPod;
    private Integer apiPodPort;

    public String getApiPod() {
        return apiPod;
    }

    public void setApiPod(String apiPod) {
        this.apiPod = apiPod;
    }

    public Integer getApiPodPort() {
        return apiPodPort;
    }

    public void setApiPodPort(Integer apiPodPort) {
        this.apiPodPort = apiPodPort;
    }
}
