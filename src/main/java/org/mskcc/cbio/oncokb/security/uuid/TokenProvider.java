package org.mskcc.cbio.oncokb.security.uuid;

import io.github.jhipster.config.JHipsterProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.mskcc.cbio.oncokb.domain.Authority;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.TokenStats;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.repository.AuthorityRepository;
import org.mskcc.cbio.oncokb.repository.TokenRepository;
import org.mskcc.cbio.oncokb.repository.TokenStatsRepository;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
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
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Component("tokenProvider")
public class TokenProvider implements InitializingBean {

    private final Logger log = LoggerFactory.getLogger(TokenProvider.class);

    private static final String AUTHORITIES_KEY = "auth";

    private static final int EXPIRATION_TIME_IN_DAYS = 30;
    private static final int EXPIRATION_TIME_IN_MINUTES = 10;

    private Key key;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private TokenStatsRepository tokenStatsRepository;

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

    private Token getNewToken(Set<Authority> authorities) {
        Token token = new Token();
        LocalDateTime currentTime = LocalDateTime.now();
        LocalDateTime expirationTime = authorities.stream().filter(
            authority -> authority.getName().equalsIgnoreCase(AuthoritiesConstants.PUBLIC_WEBSITE)).count() > 0 ?
            LocalDateTime.now().plusMinutes(EXPIRATION_TIME_IN_MINUTES) : currentTime.plusHours(24 * EXPIRATION_TIME_IN_DAYS);
        token.setCreation(currentTime.toLocalDate());
        token.setExpiration(expirationTime.toLocalDate());

        token.setToken(UUID.randomUUID().toString());
        return token;
    }

    public String createToken(Authentication authentication) {
        Optional<User> userOptional = userRepository.findOneWithAuthoritiesByLogin(SecurityUtils.getCurrentUserLogin().get());
        Token token = getNewToken(userOptional.get().getAuthorities());
        token.setUser(userOptional.get());
        tokenService.save(token);
        return token.getToken();
    }

    public String getPubWebToken() {
        Optional<User> user = userRepository.findOneWithAuthoritiesByEmailIgnoreCase("user@localhost");
        if (user.isPresent()) {
            Token userToken = new Token();
            List<Token> tokenList = tokenService.findByUser(user.get());
            if (tokenList.isEmpty()) {
                Token newToken = getNewToken(user.get().getAuthorities());
                newToken.setUser(user.get());
                userToken = tokenService.save(newToken);
            } else {
                userToken = tokenList.iterator().next();
            }
            return userToken.getToken();
        }
        return null;
    }

    public Authentication getAuthentication(String token) {
        Optional<Token> tokenOptional = tokenService.findByToken(token);

        Optional<User> user = userRepository.findOneWithAuthoritiesByLogin(tokenOptional.get().getUser().getLogin());
        Collection<? extends GrantedAuthority> authorities =
            user.get().getAuthorities().stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getName()))
                .collect(Collectors.toList());

        return new UsernamePasswordAuthenticationToken(user.get().getLogin(), token, authorities);
    }

    public boolean validateToken(String tokenValue) {
        try {
            Optional<Token> token = tokenService.findByToken(tokenValue);
            if (token.isPresent() && token.get().getExpiration().isAfter(LocalDate.now())) {
                return true;
            }
            return false;
        } catch (Exception e) {
            log.info("The token is invalid.");
            log.trace("JWT token compact of handler are invalid trace: {}", e);
        }
        return false;
    }

    public TokenStats addAccessRecord(String uuid, String accessIp) {
        Optional<Token> tokenOptional = tokenService.findByToken(uuid);

        if (tokenOptional.isPresent()) {
            Token token = tokenOptional.get();
            // When the token is used for each thread, we should record the usage
            TokenStats tokenStats = new TokenStats();
            tokenStats.setToken(token);

            tokenStats.setAccessIp(accessIp);
            tokenStats.setAccessTime(LocalDate.now());

            tokenStatsRepository.save(tokenStats);

            return tokenStats;
        }
        return null;
    }
}
