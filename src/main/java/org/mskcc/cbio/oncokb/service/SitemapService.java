package org.mskcc.cbio.oncokb.service;

import com.google.gson.Gson;
import org.mskcc.cbio.oncokb.service.dto.oncokbcore.Alteration;
import org.mskcc.cbio.oncokb.service.dto.oncokbcore.Gene;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import java.net.URISyntaxException;

/**
 * Service for sending emails.
 * <p>
 * We use the {@link Async} annotation to send emails asynchronously.
 */
@Service
public class SitemapService {

    private final Logger log = LoggerFactory.getLogger(SitemapService.class);

    private static final String BASE_URL = "baseUrl";

    private final ApiProxyService apiProxyService;

    private final SpringTemplateEngine templateEngine;

    public SitemapService(ApiProxyService apiProxyService, SpringTemplateEngine templateEngine) {
        this.apiProxyService = apiProxyService;
        this.templateEngine = templateEngine;
    }

    public String getSitemapIndex(String baseUrl) throws URISyntaxException {
        Context context = new Context();
        context.setVariable(BASE_URL, baseUrl);

        ResponseEntity<String> requestEntity = apiProxyService.exchangeRequest(null, HttpMethod.GET, null, "/api/v1/genes");
        Gene[] genes = new Gson().fromJson(requestEntity.getBody(), Gene[].class);

        context.setVariable("genes", genes);

        String content =  templateEngine.process("sitemap/sitemapIndex", context);
        return content;
    }

    public String getSitemapGeneral(String baseUrl) {
        Context context = new Context();
        context.setVariable(BASE_URL, baseUrl);
        String content =  templateEngine.process("sitemap/sitemapGeneral", context);
        return content;
    }

    public String getSitemapGene(String baseUrl, int entrezGeneId, String hugoSymbol) throws URISyntaxException {
        Context context = new Context();
        context.setVariable(BASE_URL, baseUrl);

        ResponseEntity<String> requestEntity = apiProxyService.exchangeRequest(null, HttpMethod.GET, null, "/api/v1/genes/" + entrezGeneId + "/variants");
        Alteration[] alterations = new Gson().fromJson(requestEntity.getBody(), Alteration[].class);

        context.setVariable("hugoSymbol", hugoSymbol);
        context.setVariable("entrezGeneId", entrezGeneId);
        context.setVariable("alterations", alterations);

        String content =  templateEngine.process("sitemap/sitemapGene", context);
        return content;
    }



    public String getRobotsTxt(String baseUrl) {
        Context context = new Context();
        context.setVariable(BASE_URL, baseUrl);
        String content =  templateEngine.process("txt/robots", context);
        return content;
    }
}
