package org.mskcc.cbio.oncokb.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import javax.validation.Valid;

import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.repository.CompanyRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.security.SecurityUtils;
import org.mskcc.cbio.oncokb.service.CompanyService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.errors.BadRequestAlertException;
import org.mskcc.cbio.oncokb.web.rest.errors.CustomMessageRuntimeException;
import org.mskcc.cbio.oncokb.web.rest.vm.CompanyVM;
import org.mskcc.cbio.oncokb.web.rest.vm.VerifyCompanyNameVM;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.github.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.cbio.oncokb.domain.Company}.
 */
@RestController
@RequestMapping("/api")
public class CompanyResource {

    private final Logger log = LoggerFactory.getLogger(CompanyResource.class);

    private static final String ENTITY_NAME = "company";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CompanyService companyService;

    private final UserService userService;

    private final UserMapper userMapper;

    private final CompanyRepository companyRepository;

    public CompanyResource(
            CompanyService companyService,
            UserService userService,
            UserMapper userMapper,
            CompanyRepository companyRepository) {
        this.companyService = companyService;
        this.userService = userService;
        this.userMapper = userMapper;
        this.companyRepository = companyRepository;
    }

    /**
     * {@code POST  /companies} : Create a new company.
     *
     * @param companyDTO the companyDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new companyDTO, or with status {@code 400 (Bad Request)} if the company has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/companies")
    public ResponseEntity<CompanyDTO> createCompany(@Valid @RequestBody CompanyDTO companyDTO) throws URISyntaxException {
        log.debug("REST request to save Company : {}", companyDTO);
        if (companyDTO.getId() != null) {
            throw new BadRequestAlertException("A new company cannot already have an ID", ENTITY_NAME, "idexists");
        }else if(companyService.findOneByNameIgnoreCase(companyDTO.getName()).isPresent()){
            throw new BadRequestAlertException("Company name already in use.", ENTITY_NAME, "nameexists");
        }
        CompanyDTO result = companyService.createCompany(companyDTO);
        return ResponseEntity.created(new URI("/api/companies/" + result.getId()))
            .body(result);
    }

    /**
     * {@code PUT  /companies} : Updates an existing company.
     *
     * @param companyVM the companyVm to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated companyDTO,
     * or with status {@code 400 (Bad Request)} if the companyDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the companyDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/companies")
    public ResponseEntity<CompanyDTO> updateCompany(@Valid @RequestBody CompanyVM companyVM) throws URISyntaxException {
        log.debug("REST request to update Company : {}", companyVM);
        if (companyVM.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Optional<CompanyDTO> company = companyService.findOneByNameIgnoreCase(companyVM.getName());
        if(company.isPresent() && !company.get().getId().equals(companyVM.getId())){
            throw new BadRequestAlertException("Company name already in use.", ENTITY_NAME, "nameexists");
        }

        Optional<Company> existingCompany = companyRepository.findById(companyVM.getId());
        if(existingCompany.isPresent()) {
            if(!companyService.verifyLicenseStatusChange(existingCompany.get().getLicenseStatus(), companyVM.getLicenseStatus())){
                String errorMessage = String.format(
                    "Updating license status from %s to %s is not invalid.",
                    existingCompany.get().getLicenseStatus(),
                    companyVM.getLicenseStatus());
                throw new BadRequestAlertException(errorMessage, ENTITY_NAME, "licensestatuschangeinvalid");
            }
        }

        CompanyDTO result = companyService.updateCompany(companyVM);

        if (!result.getLicenseType().equals(LicenseType.ACADEMIC)) {
            List<UserDTO> usersInCompany = userService.getCompanyUsers(result.getId());
            for (UserDTO user : usersInCompany) {
                Set<String> userAuthorities = user.getAuthorities();
                if (!userAuthorities.contains(AuthoritiesConstants.API)) {
                    userAuthorities.add(AuthoritiesConstants.API);
                    userService.updateUserAndTokens(user);
                }
            }
        }

        return ResponseEntity.ok()
            .body(result);
    }

    /**
     * {@code GET  /companies} : get all the companies.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of companies in body.
     */
    @GetMapping("/companies")
    public List<CompanyDTO> getAllCompanies() {
        log.debug("REST request to get all Companies");
        return companyService.findAll();
    }

    /**
     * {@code GET  /companies/:id} : get the "id" company.
     *
     * @param id the id of the companyDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the companyDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/companies/{id}")
    public ResponseEntity<CompanyDTO> getCompany(@PathVariable Long id) {
        log.debug("REST request to get Company : {}", id);
        Optional<CompanyDTO> companyDTO = companyService.findOne(id);
        return ResponseUtil.wrapOrNotFound(companyDTO);
    }

    @GetMapping("/companies/{id}/users")
    public List<UserDTO> getCompanyUsers(@PathVariable Long id) {
        log.debug("REST request to all users associated to Company : {}", id);
        return userService.getCompanyUsers(id);
    }

    /**
     * {@code GET /companies/lookup?name} : get the "name" company.
     *
     * @param name the name of the company to find.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the "name" company, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/companies/lookup")
    public ResponseEntity<CompanyDTO> getCompanyByName(@RequestParam String name) {
        log.debug("REST request to get Company with name : {}", name);
        return ResponseUtil.wrapOrNotFound(companyService.findOneByNameIgnoreCase(name));
    }

    @PostMapping("/companies/verify-name")
    public ResponseEntity<Boolean> verifyCompanyName(@Valid @RequestBody VerifyCompanyNameVM verificationInfo) {
        Optional<CompanyDTO> company = companyService.findOneByNameIgnoreCase(verificationInfo.getName());
        boolean isValid = true;
        if(company.isPresent()) {
            if(!company.get().getId().equals(verificationInfo.getCompanyId())) {
                isValid = false;
            }
        }
        return new ResponseEntity<>(isValid, HttpStatus.OK);
    }

    /**
     * {@code DELETE  /companies/:id} : delete the "id" company.
     *
     * @param id the id of the companyDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        log.debug("REST request to delete Company : {}", id);
        companyService.delete(id);
        return ResponseEntity.ok().build();
    }

    /* ONLY ROLE_ADMIN */
    @DeleteMapping("/companies/service/{id}")
    public ResponseEntity<Void> deleteServiceAccount(@PathVariable Long id) {
        Optional<CompanyDTO> companyDto = companyService.findOne(id);
        if (companyDto.isPresent()) {
            companyService.deleteServiceAccount(companyDto.get());
        } else {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }

    /* ONLY ROLE_COMPANY_ADMIN */
    @PostMapping("/companies/service/token") 
    public ResponseEntity<Token> createServiceAccountToken() {
        Optional<String> currentUserLoginOptional = SecurityUtils.getCurrentUserLogin();
        if (!currentUserLoginOptional.isPresent()) {
            throw new CustomMessageRuntimeException("User is not logged in");
        }

        Optional<User> userOptional = userService.getUserByLogin(currentUserLoginOptional.get());
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        UserDTO userDTO = userMapper.userToUserDTO(userOptional.get());
        return ResponseUtil.wrapOrNotFound(companyService.createServiceAccountToken(userDTO.getCompany().getId()));
    }

    /* ONLY ROLE_COMPANY_ADMIN */
    @GetMapping("/companies/service/token")
    public ResponseEntity<List<Token>> getServiceAccountTokens() {
        Optional<String> currentUserLoginOptional = SecurityUtils.getCurrentUserLogin();
        if (!currentUserLoginOptional.isPresent()) {
            throw new CustomMessageRuntimeException("User is not logged in");
        }

        Optional<User> userOptional = userService.getUserByLogin(currentUserLoginOptional.get());
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        UserDTO userDTO = userMapper.userToUserDTO(userOptional.get());
        return ResponseUtil.wrapOrNotFound(companyService.getServiceAccountTokensForCompany(userDTO.getCompany().getId()));
    }
}
