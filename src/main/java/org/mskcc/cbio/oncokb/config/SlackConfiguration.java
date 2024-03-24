package org.mskcc.cbio.oncokb.config;

import com.slack.api.Slack;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SlackConfiguration {

    @Bean
    public Slack slack() {
        return Slack.getInstance();
    }
}
