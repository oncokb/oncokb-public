package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.domain.Authority;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserDetails;
import org.mskcc.cbio.oncokb.domain.enumeration.AccountRequestStatus;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.repository.AuthorityRepository;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.service.TokenService;
import org.mskcc.cbio.oncokb.web.rest.vm.LoginVM;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest(classes = OncokbPublicApp.class)
public class UserUUIDControllerIT {

    @Autowired
    private MockMvc restMockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private UserDetailsRepository userDetailsRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    @Transactional
    public void testRejectedUserCannotLogin(boolean activated) throws Exception {
        String login = "rejected.user." + activated;
        String rawPassword = "password";

        User user = new User();
        user.setLogin(login);
        user.setEmail("rejected.user." + activated + "@example.com");
        user.setFirstName("Rejected");
        user.setLastName("User");
        user.setLangKey("en");
        user.setActivated(activated);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user = userRepository.save(user);

        UserDetails userDetails = new UserDetails();
        userDetails.setUser(user);
        userDetails.setAccountRequestStatus(AccountRequestStatus.REJECTED);
        userDetailsRepository.save(userDetails);

        LoginVM loginVM = new LoginVM();
        loginVM.setUsername(login);
        loginVM.setPassword(rawPassword);
        loginVM.setRememberMe(false);

        if (activated) {
            restMockMvc.perform(post("/api/authenticate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(loginVM)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("rejected")));
        } else {
            restMockMvc.perform(post("/api/authenticate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(loginVM)))
                .andExpect(status().isUnauthorized());
        }
    }

    @Test
    @Transactional
    public void testGracePeriodUserCanRefreshExpiredTokenOnLogin() throws Exception {
        String login = "pending.grace.user";
        String rawPassword = "password";

        User user = new User();
        user.setLogin(login);
        user.setEmail("pending.grace.user@example.com");
        user.setFirstName("Pending");
        user.setLastName("Grace");
        user.setLangKey("en");
        user.setActivated(false);
        user.setActivationKey(null);
        user.setCreatedDate(Instant.now());
        user.setPassword(passwordEncoder.encode(rawPassword));
        Authority userAuthority = authorityRepository.findById(AuthoritiesConstants.USER)
            .orElseThrow(() -> new IllegalStateException("Missing ROLE_USER authority"));
        user.setAuthorities(Collections.singleton(userAuthority));
        user = userRepository.save(user);

        UserDetails userDetails = new UserDetails();
        userDetails.setUser(user);
        userDetails.setAccountRequestStatus(AccountRequestStatus.PENDING);
        userDetails.setLicenseType(LicenseType.COMMERCIAL);
        userDetailsRepository.save(userDetails);

        Token expiredToken = new Token();
        expiredToken.setUser(user);
        expiredToken.setToken(UUID.randomUUID());
        expiredToken.setCreation(Instant.now().minusSeconds(3600));
        expiredToken.setExpiration(Instant.now().minusSeconds(60));
        expiredToken.setRenewable(true);
        tokenService.save(expiredToken);

        LoginVM loginVM = new LoginVM();
        loginVM.setUsername(login);
        loginVM.setPassword(rawPassword);
        loginVM.setRememberMe(false);

        MvcResult result = restMockMvc.perform(post("/api/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(loginVM)))
            .andExpect(status().isOk())
            .andExpect(header().string("Authorization", containsString("Bearer ")))
            .andReturn();

        Token refreshedToken = tokenService.findByUser(user).stream()
            .filter(token -> token.getId().equals(expiredToken.getId()))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Expired token was not refreshed"));

        assertThat(refreshedToken.getExpiration()).isAfter(Instant.now());
        assertThat(result.getResponse().getContentAsString()).isEqualTo("\"" + refreshedToken.getToken() + "\"");
    }
}
