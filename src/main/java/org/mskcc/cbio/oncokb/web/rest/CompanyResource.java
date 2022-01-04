package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.repository.CompanyRepository;
import org.mskcc.cbio.oncokb.service.CompanyService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.web.rest.errors.BadRequestAlertException;
import org.mskcc.cbio.oncokb.web.rest.vm.CompanyVM;
import org.mskcc.cbio.oncokb.web.rest.vm.VerifyCompanyNameVM;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

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

    private final CompanyRepository companyRepository;

    public CompanyResource(CompanyService companyService, UserService userService, CompanyRepository companyRepository) {
        this.companyService = companyService;
        this.userService = userService;
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
}
