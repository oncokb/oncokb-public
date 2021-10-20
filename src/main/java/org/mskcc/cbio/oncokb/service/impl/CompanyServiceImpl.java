package org.mskcc.cbio.oncokb.service.impl;

import org.mskcc.cbio.oncokb.service.CompanyDomainService;
import org.mskcc.cbio.oncokb.service.CompanyService;
import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.domain.CompanyDomain;
import org.mskcc.cbio.oncokb.repository.CompanyRepository;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.mskcc.cbio.oncokb.service.dto.CompanyDomainDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.CompanyDomainMapper;
import org.mskcc.cbio.oncokb.service.mapper.CompanyMapper;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.vm.CompanyVM;
import org.mskcc.cbio.oncokb.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing {@link Company}.
 */
@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final Logger log = LoggerFactory.getLogger(CompanyServiceImpl.class);

    private final CompanyRepository companyRepository;

    private final CompanyMapper companyMapper;

    private final CompanyDomainService companyDomainService;

    private final CompanyDomainMapper companyDomainMapper;

    private final UserService userService;

    private final UserMapper userMapper;

    public CompanyServiceImpl(
        CompanyRepository companyRepository, 
        CompanyMapper companyMapper, 
        CompanyDomainService companyDomainService,
        CompanyDomainMapper companyDomainMapper,
        UserService userService,
        UserMapper userMapper
    ) {
        this.companyRepository = companyRepository;
        this.companyMapper = companyMapper;
        this.companyDomainService = companyDomainService;
        this.companyDomainMapper = companyDomainMapper;
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @Override
    public CompanyDTO createCompany(CompanyDTO companyDTO) {
        log.debug("Request to save Company : {}", companyDTO);
        Company company = companyMapper.toEntity(companyDTO);
        company = companyRepository.save(company);

        updateCompanyDomains(companyDTO.getCompanyDomains(), company);

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
        updateCompanyDomains(companyVm.getCompanyDomains(), company);

        // Update the licenses for current users of the company
        List<UserDTO> companyUsers = userService.getUsersOfCompany(company.getId());
        if(isLicenseUpdateRequired){
            companyUsers.forEach(userDTO -> userService.updateUserWithCompanyLicense(userMapper.userDTOToUser(userDTO), company));
        }else{
            companyUsers.forEach(userDTO -> userService.updateUser(userDTO));
        }

        // Update the licenses for new users being added to this company
        companyVm.getCompanyUserDTOs()
            .forEach(userDTO -> userService.updateUserWithCompanyLicense(userMapper.userDTOToUser(userDTO), company));

        return companyMapper.toDto(company);
    }

    /**
     * This method will map new domains to the company and also remove domains
     * that should no longer be associated with the company.
     * @param domains new set of domain names
     * @param company company to associate the domains with
     */
    private void updateCompanyDomains(Set<String> newDomains, Company company){
        // Get existing company domains
        Set<CompanyDomainDTO> existingDomains = 
            companyDomainService
                .findAllCompanyDomainsByCompanyId(company.getId())
                .stream()
                .collect(Collectors.toSet());

        // Delete exisiting domains not part of the new list.
        // Also remove from new domain set if the domain alreadt exists in db.
        for(CompanyDomainDTO domainDTO: existingDomains){
            if(newDomains.contains(domainDTO.getName())){
                newDomains.remove(domainDTO.getName());
            }else{
                companyDomainService.delete(domainDTO.getId());
            }
        }

        // The domains left in the set need to be mapped
        newDomains.forEach(domainToAdd -> {
            CompanyDomain domain = new CompanyDomain();
            domain.setName(domainToAdd);
            domain.setCompany(company);
            companyDomainService.save(companyDomainMapper.toDto(domain));
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDTO> findAll() {
        log.debug("Request to get all Companies");
        return companyRepository.findAll().stream()
            .map(companyMapper::toDto)
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
    public void delete(Long id) {
        log.debug("Request to delete Company : {}", id);
        companyRepository.deleteById(id);
    }

}
