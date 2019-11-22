package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.OncokbApp;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.repository.TokenRepository;
import org.mskcc.cbio.oncokb.service.TokenService;
import org.mskcc.cbio.oncokb.web.rest.errors.ExceptionTranslator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.Validator;

import javax.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.mskcc.cbio.oncokb.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the {@link TokenResource} REST controller.
 */
@SpringBootTest(classes = OncokbApp.class)
public class TokenResourceIT {

    private static final UUID DEFAULT_TOKEN = UUID.randomUUID();
    private static final UUID UPDATED_TOKEN = UUID.randomUUID();

    private static final Instant DEFAULT_CREATION = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATION = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_EXPIRATION = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_EXPIRATION = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    @Autowired
    private Validator validator;

    private MockMvc restTokenMockMvc;

    private Token token;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final TokenResource tokenResource = new TokenResource(tokenService);
        this.restTokenMockMvc = MockMvcBuilders.standaloneSetup(tokenResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter)
            .setValidator(validator).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Token createEntity(EntityManager em) {
        Token token = new Token()
            .token(DEFAULT_TOKEN)
            .creation(DEFAULT_CREATION)
            .expiration(DEFAULT_EXPIRATION);
        return token;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Token createUpdatedEntity(EntityManager em) {
        Token token = new Token()
            .token(UPDATED_TOKEN)
            .creation(UPDATED_CREATION)
            .expiration(UPDATED_EXPIRATION);
        return token;
    }

    @BeforeEach
    public void initTest() {
        token = createEntity(em);
    }

    @Test
    @Transactional
    public void createToken() throws Exception {
        int databaseSizeBeforeCreate = tokenRepository.findAll().size();

        // Create the Token
        restTokenMockMvc.perform(post("/api/tokens")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(token)))
            .andExpect(status().isCreated());

        // Validate the Token in the database
        List<Token> tokenList = tokenRepository.findAll();
        assertThat(tokenList).hasSize(databaseSizeBeforeCreate + 1);
        Token testToken = tokenList.get(tokenList.size() - 1);
        assertThat(testToken.getToken()).isEqualTo(DEFAULT_TOKEN);
        assertThat(testToken.getCreation()).isEqualTo(DEFAULT_CREATION);
        assertThat(testToken.getExpiration()).isEqualTo(DEFAULT_EXPIRATION);
    }

    @Test
    @Transactional
    public void createTokenWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = tokenRepository.findAll().size();

        // Create the Token with an existing ID
        token.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restTokenMockMvc.perform(post("/api/tokens")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(token)))
            .andExpect(status().isBadRequest());

        // Validate the Token in the database
        List<Token> tokenList = tokenRepository.findAll();
        assertThat(tokenList).hasSize(databaseSizeBeforeCreate);
    }


    @Test
    @Transactional
    public void getAllTokens() throws Exception {
        // Initialize the database
        tokenRepository.saveAndFlush(token);

        // Get all the tokenList
        restTokenMockMvc.perform(get("/api/tokens?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(token.getId().intValue())))
            .andExpect(jsonPath("$.[*].token").value(hasItem(DEFAULT_TOKEN.toString())))
            .andExpect(jsonPath("$.[*].creation").value(hasItem(DEFAULT_CREATION.toString())))
            .andExpect(jsonPath("$.[*].expiration").value(hasItem(DEFAULT_EXPIRATION.toString())));
    }
    
    @Test
    @Transactional
    public void getToken() throws Exception {
        // Initialize the database
        tokenRepository.saveAndFlush(token);

        // Get the token
        restTokenMockMvc.perform(get("/api/tokens/{id}", token.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(token.getId().intValue()))
            .andExpect(jsonPath("$.token").value(DEFAULT_TOKEN.toString()))
            .andExpect(jsonPath("$.creation").value(DEFAULT_CREATION.toString()))
            .andExpect(jsonPath("$.expiration").value(DEFAULT_EXPIRATION.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingToken() throws Exception {
        // Get the token
        restTokenMockMvc.perform(get("/api/tokens/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateToken() throws Exception {
        // Initialize the database
        tokenService.save(token);

        int databaseSizeBeforeUpdate = tokenRepository.findAll().size();

        // Update the token
        Token updatedToken = tokenRepository.findById(token.getId()).get();
        // Disconnect from session so that the updates on updatedToken are not directly saved in db
        em.detach(updatedToken);
        updatedToken
            .token(UPDATED_TOKEN)
            .creation(UPDATED_CREATION)
            .expiration(UPDATED_EXPIRATION);

        restTokenMockMvc.perform(put("/api/tokens")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedToken)))
            .andExpect(status().isOk());

        // Validate the Token in the database
        List<Token> tokenList = tokenRepository.findAll();
        assertThat(tokenList).hasSize(databaseSizeBeforeUpdate);
        Token testToken = tokenList.get(tokenList.size() - 1);
        assertThat(testToken.getToken()).isEqualTo(UPDATED_TOKEN);
        assertThat(testToken.getCreation()).isEqualTo(UPDATED_CREATION);
        assertThat(testToken.getExpiration()).isEqualTo(UPDATED_EXPIRATION);
    }

    @Test
    @Transactional
    public void updateNonExistingToken() throws Exception {
        int databaseSizeBeforeUpdate = tokenRepository.findAll().size();

        // Create the Token

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTokenMockMvc.perform(put("/api/tokens")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(token)))
            .andExpect(status().isBadRequest());

        // Validate the Token in the database
        List<Token> tokenList = tokenRepository.findAll();
        assertThat(tokenList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteToken() throws Exception {
        // Initialize the database
        tokenService.save(token);

        int databaseSizeBeforeDelete = tokenRepository.findAll().size();

        // Delete the token
        restTokenMockMvc.perform(delete("/api/tokens/{id}", token.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Token> tokenList = tokenRepository.findAll();
        assertThat(tokenList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
