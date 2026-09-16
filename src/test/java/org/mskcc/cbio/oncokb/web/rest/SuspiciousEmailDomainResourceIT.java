package org.mskcc.cbio.oncokb.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.domain.SuspiciousEmailDomain;
import org.mskcc.cbio.oncokb.repository.SuspiciousEmailDomainRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.service.dto.SuspiciousEmailDomainCreateDTO;
import org.mskcc.cbio.oncokb.service.dto.SuspiciousEmailDomainDTO;
import org.mskcc.cbio.oncokb.service.mapper.SuspiciousEmailDomainMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(classes = OncokbPublicApp.class)
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser(authorities = AuthoritiesConstants.ADMIN)
class SuspiciousEmailDomainResourceIT {

    private static final String DEFAULT_DOMAIN = "example.org";
    private static final String UPDATED_DOMAIN = "example.net";

    private static final String DEFAULT_JUSTIFICATION = "Default justification";
    private static final String UPDATED_JUSTIFICATION = "Updated justification";

    @Autowired
    private SuspiciousEmailDomainRepository suspiciousEmailDomainRepository;

    @Autowired
    private SuspiciousEmailDomainMapper suspiciousEmailDomainMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSuspiciousEmailDomainMockMvc;

    private SuspiciousEmailDomain suspiciousEmailDomain;

    public static SuspiciousEmailDomain createEntity(EntityManager em) {
        SuspiciousEmailDomain suspiciousEmailDomain = new SuspiciousEmailDomain();
        suspiciousEmailDomain.setDomain(DEFAULT_DOMAIN);
        suspiciousEmailDomain.setJustification(DEFAULT_JUSTIFICATION);
        return suspiciousEmailDomain;
    }

    public static SuspiciousEmailDomain createUpdatedEntity(EntityManager em) {
        SuspiciousEmailDomain suspiciousEmailDomain = new SuspiciousEmailDomain();
        suspiciousEmailDomain.setDomain(UPDATED_DOMAIN);
        suspiciousEmailDomain.setJustification(UPDATED_JUSTIFICATION);
        return suspiciousEmailDomain;
    }

    @BeforeEach
    public void initTest() {
        suspiciousEmailDomain = createEntity(em);
    }

    @Test
    @Transactional
    void createSuspiciousEmailDomain() throws Exception {
        int databaseSizeBeforeCreate = suspiciousEmailDomainRepository.findAll().size();

        SuspiciousEmailDomainCreateDTO createDTO = new SuspiciousEmailDomainCreateDTO();
        createDTO.setDomain(DEFAULT_DOMAIN);
        createDTO.setJustification(DEFAULT_JUSTIFICATION);

        restSuspiciousEmailDomainMockMvc.perform(post("/api/suspicious-email-domains")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(createDTO)))
            .andExpect(status().isCreated());

        List<SuspiciousEmailDomain> list = suspiciousEmailDomainRepository.findAll();
        assertThat(list).hasSize(databaseSizeBeforeCreate + 1);
        SuspiciousEmailDomain testItem = list.get(list.size() - 1);
        assertThat(testItem.getDomain()).isEqualTo(DEFAULT_DOMAIN);
        assertThat(testItem.getJustification()).isEqualTo(DEFAULT_JUSTIFICATION);
    }

    @Test
    @Transactional
    void createSuspiciousEmailDomainNormalizesDomainAndJustification() throws Exception {
        SuspiciousEmailDomainCreateDTO createDTO = new SuspiciousEmailDomainCreateDTO();
        createDTO.setDomain("  EXAMPLE.ORG ");
        createDTO.setJustification("  test reason  ");

        restSuspiciousEmailDomainMockMvc.perform(post("/api/suspicious-email-domains")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(createDTO)))
            .andExpect(status().isCreated());

        SuspiciousEmailDomain saved = suspiciousEmailDomainRepository.findOneByDomainIgnoreCase("example.org").orElse(null);
        assertThat(saved).isNotNull();
        assertThat(saved.getDomain()).isEqualTo("example.org");
        assertThat(saved.getJustification()).isEqualTo("test reason");
    }

    @Test
    @Transactional
    void createSuspiciousEmailDomainWithDuplicateDomainShouldFail() throws Exception {
        suspiciousEmailDomainRepository.saveAndFlush(suspiciousEmailDomain);
        int databaseSizeBefore = suspiciousEmailDomainRepository.findAll().size();

        SuspiciousEmailDomainCreateDTO createDTO = new SuspiciousEmailDomainCreateDTO();
        createDTO.setDomain(DEFAULT_DOMAIN.toUpperCase());
        createDTO.setJustification("Another reason");

        restSuspiciousEmailDomainMockMvc.perform(post("/api/suspicious-email-domains")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(createDTO)))
            .andExpect(status().isBadRequest());

        assertThat(suspiciousEmailDomainRepository.findAll()).hasSize(databaseSizeBefore);
    }

    @Test
    @Transactional
    void checkDomainIsRequired() throws Exception {
        int databaseSizeBefore = suspiciousEmailDomainRepository.findAll().size();

        SuspiciousEmailDomainCreateDTO createDTO = new SuspiciousEmailDomainCreateDTO();
        createDTO.setDomain(null);
        createDTO.setJustification(DEFAULT_JUSTIFICATION);

        restSuspiciousEmailDomainMockMvc.perform(post("/api/suspicious-email-domains")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(createDTO)))
            .andExpect(status().isBadRequest());

        assertThat(suspiciousEmailDomainRepository.findAll()).hasSize(databaseSizeBefore);
    }

    @Test
    @Transactional
    void checkJustificationIsRequired() throws Exception {
        int databaseSizeBefore = suspiciousEmailDomainRepository.findAll().size();

        SuspiciousEmailDomainCreateDTO createDTO = new SuspiciousEmailDomainCreateDTO();
        createDTO.setDomain(DEFAULT_DOMAIN);
        createDTO.setJustification(null);

        restSuspiciousEmailDomainMockMvc.perform(post("/api/suspicious-email-domains")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(createDTO)))
            .andExpect(status().isBadRequest());

        assertThat(suspiciousEmailDomainRepository.findAll()).hasSize(databaseSizeBefore);
    }

    @Test
    @Transactional
    void getAllSuspiciousEmailDomains() throws Exception {
        suspiciousEmailDomainRepository.saveAndFlush(suspiciousEmailDomain);

        restSuspiciousEmailDomainMockMvc.perform(get("/api/suspicious-email-domains?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(suspiciousEmailDomain.getId().intValue())))
            .andExpect(jsonPath("$.[*].domain").value(hasItem(DEFAULT_DOMAIN)))
            .andExpect(jsonPath("$.[*].justification").value(hasItem(DEFAULT_JUSTIFICATION)));
    }

    @Test
    @Transactional
    void getSuspiciousEmailDomain() throws Exception {
        suspiciousEmailDomainRepository.saveAndFlush(suspiciousEmailDomain);

        restSuspiciousEmailDomainMockMvc.perform(get("/api/suspicious-email-domains/{id}", suspiciousEmailDomain.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(suspiciousEmailDomain.getId().intValue()))
            .andExpect(jsonPath("$.domain").value(DEFAULT_DOMAIN))
            .andExpect(jsonPath("$.justification").value(DEFAULT_JUSTIFICATION));
    }

    @Test
    @Transactional
    void getNonExistingSuspiciousEmailDomain() throws Exception {
        restSuspiciousEmailDomainMockMvc.perform(get("/api/suspicious-email-domains/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void updateSuspiciousEmailDomain() throws Exception {
        suspiciousEmailDomainRepository.saveAndFlush(suspiciousEmailDomain);
        int databaseSizeBeforeUpdate = suspiciousEmailDomainRepository.findAll().size();

        SuspiciousEmailDomain updated = suspiciousEmailDomainRepository.findById(suspiciousEmailDomain.getId()).orElseThrow();
        em.detach(updated);
        updated.setDomain(UPDATED_DOMAIN);
        updated.setJustification(UPDATED_JUSTIFICATION);
        SuspiciousEmailDomainDTO dto = suspiciousEmailDomainMapper.toDto(updated);

        restSuspiciousEmailDomainMockMvc.perform(put("/api/suspicious-email-domains")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(dto)))
            .andExpect(status().isOk());

        List<SuspiciousEmailDomain> list = suspiciousEmailDomainRepository.findAll();
        assertThat(list).hasSize(databaseSizeBeforeUpdate);
        SuspiciousEmailDomain testItem = suspiciousEmailDomainRepository.findById(suspiciousEmailDomain.getId()).orElseThrow();
        assertThat(testItem.getDomain()).isEqualTo(UPDATED_DOMAIN);
        assertThat(testItem.getJustification()).isEqualTo(UPDATED_JUSTIFICATION);
    }

    @Test
    @Transactional
    void updateSuspiciousEmailDomainWithoutIdShouldFail() throws Exception {
        int databaseSizeBefore = suspiciousEmailDomainRepository.findAll().size();

        SuspiciousEmailDomainDTO dto = suspiciousEmailDomainMapper.toDto(suspiciousEmailDomain);
        dto.setId(null);

        restSuspiciousEmailDomainMockMvc.perform(put("/api/suspicious-email-domains")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(dto)))
            .andExpect(status().isBadRequest());

        assertThat(suspiciousEmailDomainRepository.findAll()).hasSize(databaseSizeBefore);
    }

    @Test
    @Transactional
    void updateSuspiciousEmailDomainToExistingDomainShouldFail() throws Exception {
        SuspiciousEmailDomain first = new SuspiciousEmailDomain();
        first.setDomain("a.org");
        first.setJustification("a");
        suspiciousEmailDomainRepository.saveAndFlush(first);

        SuspiciousEmailDomain second = new SuspiciousEmailDomain();
        second.setDomain("b.org");
        second.setJustification("b");
        suspiciousEmailDomainRepository.saveAndFlush(second);

        int databaseSizeBefore = suspiciousEmailDomainRepository.findAll().size();

        SuspiciousEmailDomainDTO dto = suspiciousEmailDomainMapper.toDto(second);
        dto.setDomain("A.ORG");

        restSuspiciousEmailDomainMockMvc.perform(put("/api/suspicious-email-domains")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(dto)))
            .andExpect(status().isBadRequest());

        assertThat(suspiciousEmailDomainRepository.findAll()).hasSize(databaseSizeBefore);
        SuspiciousEmailDomain unchanged = suspiciousEmailDomainRepository.findById(second.getId()).orElseThrow();
        assertThat(unchanged.getDomain()).isEqualTo("b.org");
    }

    @Test
    @Transactional
    void deleteSuspiciousEmailDomain() throws Exception {
        suspiciousEmailDomainRepository.saveAndFlush(suspiciousEmailDomain);
        int databaseSizeBeforeDelete = suspiciousEmailDomainRepository.findAll().size();

        restSuspiciousEmailDomainMockMvc.perform(delete("/api/suspicious-email-domains/{id}", suspiciousEmailDomain.getId())
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk());

        assertThat(suspiciousEmailDomainRepository.findAll()).hasSize(databaseSizeBeforeDelete - 1);
    }
}
