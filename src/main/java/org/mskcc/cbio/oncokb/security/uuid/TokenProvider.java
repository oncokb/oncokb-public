package org.mskcc.cbio.oncokb.security.uuid;

import io.github.jhipster.config.JHipsterProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.repository.AuthorityRepository;
import org.mskcc.cbio.oncokb.repository.TokenRepository;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.security.SecurityUtils;
import org.mskcc.cbio.oncokb.service.TokenService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.swing.text.html.Option;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class TokenProvider implements InitializingBean {

    private final Logger log = LoggerFactory.getLogger(TokenProvider.class);

    private static final String AUTHORITIES_KEY = "auth";

    private static final int EXPIRATION_TIME_IN_DAYS = 30;

    private Key key;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    private final JHipsterProperties jHipsterProperties;

    public TokenProvider(JHipsterProperties jHipsterProperties) {
        this.jHipsterProperties = jHipsterProperties;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
//        byte[] keyBytes;
//        String secret = jHipsterProperties.getSecurity().getAuthentication().getJwt().getSecret();
//        if (!StringUtils.isEmpty(secret)) {
//            log.warn("Warning: the JWT key used is not Base64-encoded. " +
//                "We recommend using the `jhipster.security.authentication.jwt.base64-secret` key for optimum security.");
//            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
//        } else {
//            log.debug("Using a Base64-encoded JWT secret key");
//            keyBytes = Decoders.BASE64.decode(jHipsterProperties.getSecurity().getAuthentication().getJwt().getBase64Secret());
//        }
//        this.key = Keys.hmacShaKeyFor(keyBytes);
//        this.tokenValidityInMilliseconds =
//            1000 * jHipsterProperties.getSecurity().getAuthentication().getJwt().getTokenValidityInSeconds();
//        this.tokenValidityInMillisecondsForRememberMe =
//            1000 * jHipsterProperties.getSecurity().getAuthentication().getJwt()
//                .getTokenValidityInSecondsForRememberMe();
    }

    public String createToken(Authentication authentication) {
        Token token = new Token();
        LocalDate currentTime = LocalDate.now();
        LocalDate expirationTime = currentTime.plusDays(EXPIRATION_TIME_IN_DAYS);
        token.setCreation(currentTime);
        token.setExpiration(expirationTime);

        token.setToken(UUID.randomUUID().toString());

        Optional<User> userOptional = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().get());
        token.setUser(userOptional.get());
        tokenRepository.save(token);
        return token.getToken();
    }



    public Authentication getAuthentication(String token) {
        Optional<Token> tokenOptional = tokenRepository.findByToken(token);

        Optional<User> user = userRepository.findOneWithAuthoritiesByLogin(tokenOptional.get().getUser().getLogin());
        Collection<? extends GrantedAuthority> authorities =
            user.get().getAuthorities().stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getName()))
                .collect(Collectors.toList());

        return new UsernamePasswordAuthenticationToken(user.get().getLogin(), token, authorities);
    }

    public boolean validateToken(String tokenValue) {
        try {
            Optional<Token> token = tokenRepository.findByToken(tokenValue);
            if(token.isPresent() && token.get().getExpiration().isAfter(LocalDate.now())) {
                return true;
            }
            return false;
        } catch (Exception e) {
            log.info("The token is invalid.");
            log.trace("JWT token compact of handler are invalid trace: {}", e);
        }
        return false;
    }
}
