package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserDetails;
import org.mskcc.cbio.oncokb.domain.enumeration.AccountRequestStatus;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.repository.UserRepository;
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
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest(classes = OncokbPublicApp.class)
public class UserUUIDControllerIT {

    @Autowired
    private MockMvc restMockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDetailsRepository userDetailsRepository;

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
}
