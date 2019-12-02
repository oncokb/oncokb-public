package org.mskcc.cbio.oncokb.web.rest;

import io.swagger.annotations.ApiParam;
import org.mskcc.cbio.oncokb.config.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.enumeration.ProjectProfile;
import org.mskcc.cbio.oncokb.service.SitemapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import java.net.URISyntaxException;

import static org.springframework.http.MediaType.APPLICATION_XML_VALUE;

/**
 * Created by Hongxin Zhang on 10/23/19.
 */
@ApiIgnore
@RestController
public class SitemapResource {
    @Autowired
    private SitemapService sitemapService;

    @Autowired
    private ApplicationProperties applicationProperties;

    @GetMapping(path = "/sitemap_index.xml", produces = APPLICATION_XML_VALUE)
    public ResponseEntity<String> getSiteMapIndex(HttpServletRequest request) throws URISyntaxException {
        if(!applicationProperties.getSitemapEnabled()) {
            return ResponseEntity.notFound().build();
        }
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_XML);
        ResponseEntity responseEntity = ResponseEntity.ok().headers(httpHeaders).body(sitemapService.getSitemapIndex(getBaseUrl(request)));
        return responseEntity;
    }

    @GetMapping(path = "/sitemap_general.xml", produces = APPLICATION_XML_VALUE)
    public ResponseEntity<String> getSiteMapGeneral(HttpServletRequest request) throws URISyntaxException {
        if(!applicationProperties.getSitemapEnabled()) {
            return ResponseEntity.notFound().build();
        }
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_XML);
        ResponseEntity responseEntity = ResponseEntity.ok().headers(httpHeaders).body(sitemapService.getSitemapGeneral(getBaseUrl(request)));
        return responseEntity;
    }

    @GetMapping(path = "/sitemap_gene.xml", produces = APPLICATION_XML_VALUE)
    public ResponseEntity<String> getSiteMapGene(
        HttpServletRequest request,
        @ApiParam(value = "The entrez gene ID.", required = true) @RequestParam("entrezGeneId") Integer entrezGeneId,
        @ApiParam(value = "The hugo symbpol.", required = true) @RequestParam("hugoSymbol") String hugoSymbol
    ) throws URISyntaxException {
        if(!applicationProperties.getSitemapEnabled()) {
            return ResponseEntity.notFound().build();
        }
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_XML);
        ResponseEntity responseEntity = ResponseEntity.ok().headers(httpHeaders).body(sitemapService.getSitemapGene(getBaseUrl(request), entrezGeneId, hugoSymbol));
        return responseEntity;
    }

    @GetMapping(path = "/robots.txt", produces = APPLICATION_XML_VALUE)
    public ResponseEntity<String> getRobotsTxt(HttpServletRequest request) {
        if(!applicationProperties.getSitemapEnabled()) {
            return ResponseEntity.notFound().build();
        }
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.TEXT_PLAIN);
        ResponseEntity responseEntity = ResponseEntity.ok().headers(httpHeaders).body(sitemapService.getRobotsTxt(getBaseUrl(request)));
        return responseEntity;
    }

    private String getBaseUrl(HttpServletRequest request) {
        StringBuffer basePath = new StringBuffer();
        String scheme = request.getScheme();
        String domain = request.getServerName();
//        basePath.append(scheme);
        // The certificate is attached on the ingress level and not propagate to pods
        // Within the cluster, all connections are to http which will cause issue in the sitemap generation.
        // We only want to show the result in google with https anyway, so hard code to https for now
        basePath.append("https");
        basePath.append("://");
        basePath.append(domain);

        if (!applicationProperties.getProfile().equals(ProjectProfile.PROD)) {
            int port = request.getServerPort();
            basePath.append(":");
            basePath.append(port);
        }
        return basePath.toString();
    }
}
