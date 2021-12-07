package org.mskcc.cbio.oncokb.service.mapper;

import org.junit.Before;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.domain.CompanyDomain;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseStatus;
import org.mskcc.cbio.oncokb.domain.enumeration.CompanyType;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseModel;
import org.mskcc.cbio.oncokb.repository.CompanyDomainRepository;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@ExtendWith(MockitoExtension.class)
public class CompanyMapperTest {

    private static final String DEFAULT_DOMAIN_NAME = "mskcc.org";
    
    @Mock
    private CompanyDomainRepository companyDomainRepository;

    @InjectMocks
    private CompanyMapperImpl companyMapper;

    private Company company;
    
    private CompanyDTO companyDTO;

    @Before
    public void init() {
        MockitoAnnotations.initMocks(this);
    }

    @BeforeEach
    public void setUp() {
        company = new Company();
        company.setName("MSKCC");
        company.setDescription("Description");
        company.setCompanyType(CompanyType.PARENT);
        company.setLicenseType(LicenseType.ACADEMIC);
        company.setLicenseModel(LicenseModel.REGULAR);
        company.setLicenseStatus(LicenseStatus.REGULAR);
        company.setBusinessContact("business contact");
        company.setLegalContact("legal contact");
        company.setCompanyDomains(new HashSet<CompanyDomain>(Arrays.asList(this.generateCompanyDomain())));

        companyDTO = new CompanyDTO();
        companyDTO.setName("MSKCC");
        companyDTO.setDescription("Description");
        companyDTO.setCompanyType(CompanyType.PARENT);
        companyDTO.setLicenseType(LicenseType.ACADEMIC);
        companyDTO.setLicenseModel(LicenseModel.REGULAR);
        companyDTO.setLicenseStatus(LicenseStatus.REGULAR);
        companyDTO.setBusinessContact("business contact");
        companyDTO.setLegalContact("legal contact");
        Set<String> companyDomains = new HashSet<>();
        companyDomains.add(DEFAULT_DOMAIN_NAME);
        companyDTO.setCompanyDomains(companyDomains);

    }

    @Test
    public void companyToCompanyDTOShouldMapDomainsToStrings() {
        CompanyDTO convertedCompanyDTO = companyMapper.toDto(company);
        
        assertThat(convertedCompanyDTO.getCompanyDomains()).isNotEmpty();
        assertThat(convertedCompanyDTO.getCompanyDomains().iterator().next()).isEqualTo(DEFAULT_DOMAIN_NAME);
    }

    @Test
    public void companyDTOToCompanyWithPreExistingCompanyDomainsShouldMapStringsToCompanyDomains() {
        Mockito.when(companyDomainRepository.findOneByNameIgnoreCase(any(String.class)))
            .thenReturn(Optional.of(this.generateCompanyDomain()));

        Company convertedCompany = companyMapper.toEntity(companyDTO);

        assertThat(convertedCompany.getCompanyDomains()).isNotEmpty();
        CompanyDomain domain = convertedCompany.getCompanyDomains().iterator().next();
        assertThat(domain.getName()).isEqualTo(DEFAULT_DOMAIN_NAME);
        assertThat(domain.getId()).isEqualTo(1L);   // Company Domain exists in DB
        assertThat(domain.getCompanies()).isNotNull();
        assertThat(domain.getCompanies().size()).isEqualTo(1);
        assertThat(domain.getCompanies().iterator().next().getId()).isEqualTo(companyDTO.getId());
    }

    @Test
    public void companyDTOToCompanyWithNoPreExistingCompanyDomainsShouldMapStringsToCompanyDomains() {
        Mockito.when(companyDomainRepository.findOneByNameIgnoreCase(any(String.class)))
            .thenReturn(Optional.empty());

        Company convertedCompany = companyMapper.toEntity(companyDTO);
        assertThat(convertedCompany.getCompanyDomains()).isNotEmpty();
        CompanyDomain domain = convertedCompany.getCompanyDomains().iterator().next();
        assertThat(domain.getName()).isEqualTo(DEFAULT_DOMAIN_NAME);
        assertThat(domain.getId()).isNull();    // Company Domain does not exist in DB
        assertThat(domain.getCompanies()).isNotNull();
        assertThat(domain.getCompanies().size()).isEqualTo(1);
        assertThat(domain.getCompanies().iterator().next().getId()).isEqualTo(companyDTO.getId());
    }

    @Test
    public void testEntityFromId() {
        Long id = 1L;
        assertThat(companyMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(companyMapper.fromId(null)).isNull();
    }

    private CompanyDomain generateCompanyDomain() {
        CompanyDomain companyDomain = new CompanyDomain();
        companyDomain.setId(1L);
        companyDomain.setName(DEFAULT_DOMAIN_NAME);
        return companyDomain;
    }

}
