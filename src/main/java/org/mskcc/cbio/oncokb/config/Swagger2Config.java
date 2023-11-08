package org.mskcc.cbio.oncokb.config;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.EmailAddresses;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.Optional;

@Configuration
@EnableSwagger2
public class Swagger2Config {
    final ApplicationProperties applicationProperties;
    final String contactAddress;

    public Swagger2Config(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
        Optional<String> contractAddress = Optional.ofNullable(applicationProperties)
            .map(ApplicationProperties::getEmailAddresses)
            .map(EmailAddresses::getContactAddress);
        this.contactAddress = contractAddress.isPresent() ? contractAddress.get() : "";
    }

    // based on the suggestion to overwrite the default Docket setup
    // https://github.com/jhipster/generator-jhipster/issues/10034
    @Bean
    public Docket swaggerSpringfoxApiDocket() {
        return new Docket(DocumentationType.SWAGGER_2)
            .groupName("default")
            .select()
            .apis(RequestHandlerSelectors
                .basePackage("org.mskcc.cbio.oncokb.web.rest"))
            .paths(PathSelectors.regex("/.*"))
            .build().apiInfo(apiEndPointsInfo());
    }

    private ApiInfo apiEndPointsInfo() {
        return new ApiInfoBuilder().title("OncoKB™ APIs")
            .description("OncoKB™ is a precision oncology knowledge base developed at Memorial Sloan Kettering Cancer Center that contains biological and clinical information about genomic alterations in cancer.")
            .contact(new Contact("OncoKB™", applicationProperties.getBaseUrl(), this.contactAddress))
            .license("Terms of Use")
            .licenseUrl(applicationProperties.getBaseUrl() + "/terms")
            .termsOfServiceUrl(applicationProperties.getBaseUrl() + "/terms")
            .version("v1.0.0")
            .build();
    }
}
