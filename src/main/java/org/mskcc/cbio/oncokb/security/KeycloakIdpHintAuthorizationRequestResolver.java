package org.mskcc.cbio.oncokb.security;

import org.apache.commons.lang3.StringUtils;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;

public class KeycloakIdpHintAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    public static final String KC_IDP_HINT_PARAMETER = "kc_idp_hint";
    private static final String AUTHORIZATION_REQUEST_BASE_URI = "/oauth2/authorization";

    private final OAuth2AuthorizationRequestResolver delegate;

    public KeycloakIdpHintAuthorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository) {
        this.delegate = new DefaultOAuth2AuthorizationRequestResolver(
            clientRegistrationRepository,
            AUTHORIZATION_REQUEST_BASE_URI
        );
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        return customize(delegate.resolve(request), request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        return customize(delegate.resolve(request, clientRegistrationId), request);
    }

    private OAuth2AuthorizationRequest customize(
        OAuth2AuthorizationRequest authorizationRequest,
        HttpServletRequest request
    ) {
        if (authorizationRequest == null) {
            return null;
        }

        String idpHint = StringUtils.trimToNull(request.getParameter(KC_IDP_HINT_PARAMETER));
        if (idpHint == null) {
            return authorizationRequest;
        }

        Map<String, Object> additionalParameters = new LinkedHashMap<>(authorizationRequest.getAdditionalParameters());
        additionalParameters.put(KC_IDP_HINT_PARAMETER, idpHint);

        String authorizationRequestUri = UriComponentsBuilder
            .fromUriString(authorizationRequest.getAuthorizationRequestUri())
            .queryParam(KC_IDP_HINT_PARAMETER, idpHint)
            .build(true)
            .toUriString();

        return OAuth2AuthorizationRequest.from(authorizationRequest)
            .additionalParameters(additionalParameters)
            .authorizationRequestUri(authorizationRequestUri)
            .build();
    }
}
