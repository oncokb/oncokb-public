package org.mskcc.cbio.oncokb.security.uuid;

import org.mskcc.cbio.oncokb.domain.Authority;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.TokenStats;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.repository.TokenStatsRepository;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.security.SecurityUtils;
import org.mskcc.cbio.oncokb.service.TokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Component("tokenProvider")
public class TokenProvider implements InitializingBean {

    private final Logger log = LoggerFactory.getLogger(TokenProvider.class);

    // This is for general users
    public static final int EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 24 * 30 * 6;

    // This is for the public website
    private static final int EXPIRATION_TIME_PUBLIC_WEBSITE_IN_SECONDS = 60 * 60;

    private Key key;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private TokenStatsRepository tokenStatsRepository;

    public TokenProvider() {
    }

    @Override
    public void afterPropertiesSet() throws Exception {
    }

    public List<Token> getUserTokens(User userLogin) {
        return tokenService.findValidByUser(userLogin);
    }

    private Token getNewToken(Set<Authority> authorities, Optional<Instant> definedExpirationTime) {
        Token token = new Token();
        Instant currentTime = Instant.now();
        token.setCreation(currentTime);

        if (definedExpirationTime.isPresent()) {
            token.setExpiration(definedExpirationTime.get());
        } else {
            Instant expirationTime = authorities.stream().filter(
                authority -> authority.getName().equalsIgnoreCase(AuthoritiesConstants.PUBLIC_WEBSITE)).count() > 0 ?
                Instant.now().plusSeconds(EXPIRATION_TIME_PUBLIC_WEBSITE_IN_SECONDS) : currentTime.plusSeconds(EXPIRATION_TIME_IN_SECONDS);
            token.setExpiration(expirationTime);
        }
        token.setToken(UUID.randomUUID());
        return token;
    }

    public Token createToken(Optional<Instant> definedExpirationTime) {
        Optional<User> userOptional = userRepository.findOneWithAuthoritiesByLogin(SecurityUtils.getCurrentUserLogin().get());
        Token token = getNewToken(userOptional.get().getAuthorities(), definedExpirationTime);
        token.setUser(userOptional.get());
        tokenService.save(token);
        return token;
    }

    public void expireToken(Token token) {
        token.setExpiration(Instant.now());
        tokenService.save(token);
    }

    // This method is used in the frontend thymeleaf parsing
    public UUID getPubWebToken() {
        Optional<User> user = userRepository.findOneWithAuthoritiesByEmailIgnoreCase("public_website@localhost");
        if (user.isPresent()) {
            Token userToken = new Token();
            List<Token> tokenList = tokenService.findByUser(user.get());
            if (tokenList.isEmpty()) {
                Token newToken = getNewToken(user.get().getAuthorities(), Optional.empty());
                newToken.setUser(user.get());
                userToken = tokenService.save(newToken);
            } else {
                userToken = tokenList.iterator().next();
                if (userToken.getExpiration().isBefore(Instant.now())) {
                    // I want to update the token associated with public website once it's expired
                    Token newToken = getNewToken(user.get().getAuthorities(), Optional.empty());
                    userToken.setToken(newToken.getToken());
                    userToken.setCreation(newToken.getCreation());
                    userToken.setExpiration(newToken.getExpiration());
                    // Reset the usage after recreating the token
                    userToken.setCurrentUsage(0);
                    tokenService.save(userToken);
                }
            }
            return userToken.getToken();
        }
        return null;
    }

    public Authentication getAuthentication(UUID token) {
        Optional<Token> tokenOptional = tokenService.findByToken(token);

        Optional<User> user = userRepository.findOneWithAuthoritiesByLogin(tokenOptional.get().getUser().getLogin());
        Collection<? extends GrantedAuthority> authorities =
            user.get().getAuthorities().stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getName()))
                .collect(Collectors.toList());

        return new UsernamePasswordAuthenticationToken(user.get().getLogin(), token, authorities);
    }

    public boolean validateToken(UUID tokenValue) {
        try {
            Optional<Token> token = tokenService.findByToken(tokenValue);
            if (token.isPresent() && token.get().getExpiration().isAfter(Instant.now())) {
                if(token.get().getUsageLimit() == null || token.get().getCurrentUsage() < token.get().getUsageLimit()) {
                    return true;
                }else{
                    return false;
                }
            }
            return false;
        } catch (Exception e) {
            log.info("The token is invalid.");
            log.trace("JWT token compact of handler are invalid trace: {}", e);
        }
        return false;
    }
}
