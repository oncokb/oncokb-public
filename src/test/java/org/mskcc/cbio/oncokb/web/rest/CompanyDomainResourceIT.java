package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.RedisTestContainerExtension;
import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.domain.CompanyDomain;
import org.mskcc.cbio.oncokb.repository.CompanyDomainRepository;
import org.mskcc.cbio.oncokb.service.CompanyDomainService;
import org.mskcc.cbio.oncokb.service.dto.CompanyDomainDTO;
import org.mskcc.cbio.oncokb.service.mapper.CompanyDomainMapper;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import javax.persistence.EntityManager;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the {@link CompanyDomainResource} REST controller.
 */
@SpringBootTest(classes = OncokbPublicApp.class)
@ExtendWith({ RedisTestContainerExtension.class, MockitoExtension.class })
@AutoConfigureMockMvc
@WithMockUser(authorities = AuthoritiesConstants.ADMIN)
public class CompanyDomainResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    @Autowired
    private CompanyDomainRepository companyDomainRepository;

    @Autowired
    private CompanyDomainMapper companyDomainMapper;

    @Autowired
    private CompanyDomainService companyDomainService;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCompanyDomainMockMvc;

    private CompanyDomain companyDomain;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CompanyDomain createEntity(EntityManager em) {
        CompanyDomain companyDomain = new CompanyDomain()
            .name(DEFAULT_NAME);
        return companyDomain;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CompanyDomain createUpdatedEntity(EntityManager em) {
        CompanyDomain companyDomain = new CompanyDomain()
            .name(UPDATED_NAME);
        return companyDomain;
    }

    @BeforeEach
    public void initTest() {
        companyDomain = createEntity(em);
    }

    @Test
    @Transactional
    public void createCompanyDomain() throws Exception {
        int databaseSizeBeforeCreate = companyDomainRepository.findAll().size();
        // Create the CompanyDomain
        CompanyDomainDTO companyDomainDTO = companyDomainMapper.toDto(companyDomain);
        restCompanyDomainMockMvc.perform(post("/api/company-domains")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(companyDomainDTO)))
            .andExpect(status().isCreated());

        // Validate the CompanyDomain in the database
        List<CompanyDomain> companyDomainList = companyDomainRepository.findAll();
        assertThat(companyDomainList).hasSize(databaseSizeBeforeCreate + 1);
        CompanyDomain testCompanyDomain = companyDomainList.get(companyDomainList.size() - 1);
        assertThat(testCompanyDomain.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    public void createCompanyDomainWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = companyDomainRepository.findAll().size();

        // Create the CompanyDomain with an existing ID
        companyDomain.setId(1L);
        CompanyDomainDTO companyDomainDTO = companyDomainMapper.toDto(companyDomain);

        // An entity with an existing ID cannot be created, so this API call must fail
        restCompanyDomainMockMvc.perform(post("/api/company-domains")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(companyDomainDTO)))
            .andExpect(status().isBadRequest());

        // Validate the CompanyDomain in the database
        List<CompanyDomain> companyDomainList = companyDomainRepository.findAll();
        assertThat(companyDomainList).hasSize(databaseSizeBeforeCreate);
    }


    @Test
    @Transactional
    public void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = companyDomainRepository.findAll().size();
        // set the field null
        companyDomain.setName(null);

        // Create the CompanyDomain, which fails.
        CompanyDomainDTO companyDomainDTO = companyDomainMapper.toDto(companyDomain);


        restCompanyDomainMockMvc.perform(post("/api/company-domains")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(companyDomainDTO)))
            .andExpect(status().isBadRequest());

        List<CompanyDomain> companyDomainList = companyDomainRepository.findAll();
        assertThat(companyDomainList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllCompanyDomains() throws Exception {
        // Initialize the database
        companyDomainRepository.saveAndFlush(companyDomain);

        // Get all the companyDomainList
        restCompanyDomainMockMvc.perform(get("/api/company-domains?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(companyDomain.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }
    
    @Test
    @Transactional
    public void getCompanyDomain() throws Exception {
        // Initialize the database
        companyDomainRepository.saveAndFlush(companyDomain);

        // Get the companyDomain
        restCompanyDomainMockMvc.perform(get("/api/company-domains/{id}", companyDomain.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(companyDomain.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }
    @Test
    @Transactional
    public void getNonExistingCompanyDomain() throws Exception {
        // Get the companyDomain
        restCompanyDomainMockMvc.perform(get("/api/company-domains/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateCompanyDomain() throws Exception {
        // Initialize the database
        companyDomainRepository.saveAndFlush(companyDomain);

        int databaseSizeBeforeUpdate = companyDomainRepository.findAll().size();

        // Update the companyDomain
        CompanyDomain updatedCompanyDomain = companyDomainRepository.findById(companyDomain.getId()).get();
        // Disconnect from session so that the updates on updatedCompanyDomain are not directly saved in db
        em.detach(updatedCompanyDomain);
        updatedCompanyDomain
            .name(UPDATED_NAME);
        CompanyDomainDTO companyDomainDTO = companyDomainMapper.toDto(updatedCompanyDomain);

        restCompanyDomainMockMvc.perform(put("/api/company-domains")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(companyDomainDTO)))
            .andExpect(status().isOk());

        // Validate the CompanyDomain in the database
        List<CompanyDomain> companyDomainList = companyDomainRepository.findAll();
        assertThat(companyDomainList).hasSize(databaseSizeBeforeUpdate);
        CompanyDomain testCompanyDomain = companyDomainList.get(companyDomainList.size() - 1);
        assertThat(testCompanyDomain.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    public void updateNonExistingCompanyDomain() throws Exception {
        int databaseSizeBeforeUpdate = companyDomainRepository.findAll().size();

        // Create the CompanyDomain
        CompanyDomainDTO companyDomainDTO = companyDomainMapper.toDto(companyDomain);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCompanyDomainMockMvc.perform(put("/api/company-domains")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(companyDomainDTO)))
            .andExpect(status().isBadRequest());

        // Validate the CompanyDomain in the database
        List<CompanyDomain> companyDomainList = companyDomainRepository.findAll();
        assertThat(companyDomainList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteCompanyDomain() throws Exception {
        // Initialize the database
        companyDomainRepository.saveAndFlush(companyDomain);

        int databaseSizeBeforeDelete = companyDomainRepository.findAll().size();

        // Delete the companyDomain
        restCompanyDomainMockMvc.perform(delete("/api/company-domains/{id}", companyDomain.getId())
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk());

        // Validate the database contains one less item
        List<CompanyDomain> companyDomainList = companyDomainRepository.findAll();
        assertThat(companyDomainList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
