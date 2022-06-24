package org.mskcc.cbio.oncokb.service.impl;

import org.mskcc.cbio.oncokb.service.CompanyDomainService;
import org.mskcc.cbio.oncokb.service.CompanyService;
import org.mskcc.cbio.oncokb.config.cache.CacheNameResolver;
import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseStatus;
import org.mskcc.cbio.oncokb.repository.CompanyRepository;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.CompanyDomainMapper;
import org.mskcc.cbio.oncokb.service.mapper.CompanyMapper;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.vm.CompanyVM;
import org.mskcc.cbio.oncokb.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.mskcc.cbio.oncokb.config.cache.CompanyCacheResolver.COMPANIES_BY_ID_CACHE;
import static org.mskcc.cbio.oncokb.config.cache.CompanyCacheResolver.COMPANIES_BY_NAME_CACHE;

/**
 * Service Implementation for managing {@link Company}.
 */
@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final Logger log = LoggerFactory.getLogger(CompanyServiceImpl.class);

    private final CompanyRepository companyRepository;

    private final CompanyMapper companyMapper;

    private final UserMapper userMapper;

    private final UserService userService;
    
    private final CacheManager cacheManager;

    private final CacheNameResolver cacheNameResolver;

    public CompanyServiceImpl(
        CompanyRepository companyRepository, 
        CompanyMapper companyMapper, 
        CompanyDomainService companyDomainService,
        CompanyDomainMapper companyDomainMapper,
        UserService userService,
        UserMapper userMapper,
        CacheManager cacheManager,
        CacheNameResolver cacheNameResolver
    ) {
        this.companyRepository = companyRepository;
        this.companyMapper = companyMapper;
        this.userMapper = userMapper;
        this.userService = userService;
        this.cacheManager = cacheManager;
        this.cacheNameResolver = cacheNameResolver;
    }

    @Override
    public CompanyDTO createCompany(CompanyDTO companyDTO) {
        log.debug("Request to save Company : {}", companyDTO);
        Company company = companyMapper.toEntity(companyDTO);
        company = companyRepository.save(company);

        this.clearCompanyCaches(company);
        return companyMapper.toDto(company);
    }

    @Override
    public CompanyDTO updateCompany(CompanyVM companyVm) {
        log.debug("Request to save Company : {}", companyVm);

        Optional<Company> oldCompany = companyRepository.findById(companyVm.getId());
        Boolean isLicenseUpdateRequired = false;
        if(oldCompany.isPresent()){
            // When there is a change in license status, we need to re-update user's license as well
            isLicenseUpdateRequired = oldCompany.get().getLicenseStatus() != companyVm.getLicenseStatus();
        }

        Company company = companyRepository.save(companyMapper.toEntity(companyVm));

        // Update the licenses for current users of the company
        List<UserDTO> companyUsers = userService.getCompanyUsers(company.getId());
        if(isLicenseUpdateRequired){
            companyUsers.forEach(userDTO -> userService.updateUserWithCompanyLicense(userDTO, company, false, false));
        }else{
            companyUsers.forEach(userDTO -> userService.updateUser(userDTO));
        }

        // Update the licenses for new users being added to this company
        if(companyVm.getCompanyUserEmails() != null){
            companyVm.getCompanyUserEmails()
                .stream()
                .map(email -> userService.getUserByEmailIgnoreCase(email))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(user -> userMapper.userToUserDTO(user))
                .forEach(userDTO -> userService.updateUserWithCompanyLicense(userDTO, company, true, false));
        }

        this.clearCompanyCaches(company);
        return companyMapper.toDto(company);
    }

    /**
     * Check whether the license status change is supported.
     * @param oldLicenseStatus
     * @param newLicenseStatus
     * @return true if the license status change is valid
     */
    @Override
    public boolean verifyLicenseStatusChange(LicenseStatus oldLicenseStatus, LicenseStatus newLicenseStatus) {
        switch(oldLicenseStatus) {
            case REGULAR:
                return !newLicenseStatus.equals(LicenseStatus.TRIAL_EXPIRED);
            case TRIAL:
                break;
            case TRIAL_EXPIRED:
                return !newLicenseStatus.equals(LicenseStatus.EXPIRED);
            case EXPIRED:
                return !newLicenseStatus.equals(LicenseStatus.TRIAL_EXPIRED);
            case UNKNOWN:
                break;
            default:
                return false;
        }
        return true;
    }


    @Override
    @Transactional(readOnly = true)
    public List<CompanyDTO> findAll() {
        log.debug("Request to get all Companies");
        return companyRepository.findAll().stream()
            .map(companyMapper::toDto)
            .map(companyDTO -> {
                companyDTO.setNumberOfUsers(userService.getCompanyUsers(companyDTO.getId()).size());
                return companyDTO;
            })
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CompanyDTO> findOne(Long id) {
        log.debug("Request to get Company : {}", id);
        return companyRepository.findById(id)
            .map(companyMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CompanyDTO> findOneByNameIgnoreCase(String name) {
        log.debug("Request to get Company by name: {}", name);
        return companyRepository.findOneByNameIgnoreCase(name).map(company -> companyMapper.toDto(company));
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete Company : {}", id);
        companyRepository.deleteById(id);
    }

    private void clearCompanyCaches(Company company) {
        Objects.requireNonNull(cacheManager.getCache(this.cacheNameResolver.getCacheName(COMPANIES_BY_ID_CACHE))).evict(company.getId());
        Objects.requireNonNull(cacheManager.getCache(this.cacheNameResolver.getCacheName(COMPANIES_BY_NAME_CACHE))).evict(company.getName());
    }

}