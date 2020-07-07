package org.mskcc.cbio.oncokb.web.rest;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.security.uuid.UUIDFilter;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.service.TokenService;
import org.mskcc.cbio.oncokb.web.rest.errors.TokenExpiredException;
import org.mskcc.cbio.oncokb.web.rest.vm.LoginVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller to authenticate users.
 */
@RestController
@RequestMapping("/api")
public class UserUUIDController {

    private final TokenProvider tokenProvider;

    @Autowired
    private TokenService tokenService;

    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    public UserUUIDController(TokenProvider tokenProvider, AuthenticationManagerBuilder authenticationManagerBuilder) {
        this.tokenProvider = tokenProvider;
        this.authenticationManagerBuilder = authenticationManagerBuilder;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<UUID> authorize(@Valid @RequestBody LoginVM loginVM) {

        UsernamePasswordAuthenticationToken authenticationToken =
            new UsernamePasswordAuthenticationToken(loginVM.getUsername(), loginVM.getPassword());

        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        List<Token> tokenList = tokenService.findByUserIsCurrentUser();
        UUID uuid;
        if (tokenList.size() > 0) {
            List<Token> validTokens = tokenList.stream().filter(token -> token.getExpiration().isAfter(Instant.now())).collect(Collectors.toList());
            if (validTokens.size() > 0) {
                uuid = validTokens.iterator().next().getToken();
            } else {
                throw new TokenExpiredException();
            }
        } else {
            Token token = tokenProvider.createTokenForCurrentUserLogin(Optional.empty(), Optional.empty());
            uuid = token.getToken();
        }
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(UUIDFilter.AUTHORIZATION_HEADER, "Bearer " + uuid);
        return new ResponseEntity<>(uuid, httpHeaders, HttpStatus.OK);
    }

    /**
     * Object to return as body in JWT Authentication.
     */
    static class UUIDToken {

        private String idToken;

        UUIDToken(String idToken) {
            this.idToken = idToken;
        }

        @JsonProperty("id_token")
        String getIdToken() {
            return idToken;
        }

        void setIdToken(String idToken) {
            this.idToken = idToken;
        }
    }
}
