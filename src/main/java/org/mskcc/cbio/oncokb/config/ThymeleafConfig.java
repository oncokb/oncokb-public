package org.mskcc.cbio.oncokb.config;

import org.mskcc.cbio.oncokb.domain.enumeration.ProjectProfile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.spring5.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

import javax.annotation.PostConstruct;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by Hongxin Zhang on 10/24/19.
 */
@Configuration
public class ThymeleafConfig {
    public static final String STRING_ENCODING = "UTF-8";
    @Autowired
    private ApplicationProperties applicationProperties;

    @Autowired
    private SpringTemplateEngine templateEngine;

    /* ******************************************************************** */
    /*  THYMELEAF-SPECIFIC ARTIFACTS                                        */
    /*  TemplateResolver(3) <- TemplateEngine                               */
    /* ******************************************************************** */

    public ThymeleafConfig() {
    }

    @PostConstruct
    public void extension() {
        // Adding resolves with resolvable patters
        templateEngine.addTemplateResolver(indexTemplateResolver());
        templateEngine.addTemplateResolver(htmlTemplateResolver());
        templateEngine.addTemplateResolver(xmlTemplateResolver());
        templateEngine.addTemplateResolver(textTemplateResolver());
    }

    private ITemplateResolver htmlTemplateResolver() {
        final ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
        templateResolver.setOrder(Integer.valueOf(1));
        templateResolver.setPrefix("/templates/");
        Set<String> patterns = new HashSet<>();
        patterns.add("html/*");
        templateResolver.setResolvablePatterns(patterns);
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode(TemplateMode.HTML);
        templateResolver.setCharacterEncoding(STRING_ENCODING);
        templateResolver.setCacheable(getCacheable());
        return templateResolver;
    }

    private ITemplateResolver indexTemplateResolver() {
        final ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
        templateResolver.setOrder(Integer.valueOf(1));
        templateResolver.setPrefix("/static/");
        Set<String> patterns = new HashSet<>();
        patterns.add("index");
        templateResolver.setResolvablePatterns(patterns);
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode(TemplateMode.HTML);
        templateResolver.setCharacterEncoding(STRING_ENCODING);
        templateResolver.setCacheable(false);
        return templateResolver;
    }

    private ITemplateResolver xmlTemplateResolver() {
        final ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
        templateResolver.setOrder(Integer.valueOf(2));
        templateResolver.setPrefix("/templates/");
        Set<String> patterns = new HashSet<>();
        patterns.add("xml/*");
        patterns.add("sitemap/*");
        templateResolver.setResolvablePatterns(patterns);
        templateResolver.setSuffix(".xml");
        templateResolver.setTemplateMode(TemplateMode.XML);
        templateResolver.setCharacterEncoding(STRING_ENCODING);
        templateResolver.setCacheable(getCacheable());
        return templateResolver;
    }

    private ITemplateResolver textTemplateResolver() {
        final ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
        Set<String> patterns = new HashSet<>();
        patterns.add("txt/*");
        patterns.add("mail/*");
        templateResolver.setResolvablePatterns(patterns);
        templateResolver.setOrder(Integer.valueOf(3));
        templateResolver.setPrefix("/templates/");
        templateResolver.setSuffix(".txt");
        templateResolver.setTemplateMode(TemplateMode.TEXT);
        templateResolver.setCharacterEncoding(STRING_ENCODING);
        templateResolver.setCacheable(getCacheable());
        return templateResolver;
    }

    private boolean getCacheable() {
        return applicationProperties.getProfile().equals(ProjectProfile.PROD) ? true : false;
    }
}
