package org.mskcc.cbio.oncokb.web.rest;

import io.github.jhipster.web.util.PaginationUtil;
import java.util.List;
import java.util.stream.Collectors;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.repository.projection.UserRegistrationSummaryProjection;
import org.mskcc.cbio.oncokb.service.TokenStatsService;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.ResourceUsageAnalysisRow;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageAnalysisInterval;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageAnalysisRow;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageResourceName;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UserRegistrationSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api")
public class UsageAnalysisController {
  public static final String NO_CREATION_DATE_LABEL = "No creation date";
  private static final int DEFAULT_PAGE_SIZE = 20;

  private final TokenStatsService tokenStatsService;
  private final UserDetailsRepository userDetailsRepository;

  public UsageAnalysisController(
    TokenStatsService tokenStatsService,
    UserDetailsRepository userDetailsRepository
  ) {
    this.tokenStatsService = tokenStatsService;
    this.userDetailsRepository = userDetailsRepository;
  }

  @GetMapping("/usage/users/{userId}")
  public ResponseEntity<List<ResourceUsageAnalysisRow>> userUsageGet(
    @PathVariable Long userId,
    @RequestParam(defaultValue = "DAY") UsageAnalysisInterval interval,
    @RequestParam(defaultValue = "true") boolean publicOnly,
    @RequestParam(required = false, name = "search") String search,
    @RequestParam(required = false, name = "resource") String resource,
    @RequestParam(required = false) String fromDate,
    @RequestParam(required = false) String toDate,
    Pageable pageable
  ) {
    Page<ResourceUsageAnalysisRow> page = tokenStatsService.getPagedResourceUsageSummary(
      interval,
      publicOnly,
      userId,
      search,
      resource,
      fromDate,
      toDate,
      withDefaultSort(
        pageable,
        Sort.by(
          Sort.Order.desc("time"),
          Sort.Order.desc("usage"),
          Sort.Order.asc("resource")
        )
      )
    );

    HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(
      ServletUriComponentsBuilder.fromCurrentRequest(),
      page
    );
    return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
  }

  @GetMapping("/usage/summary/users")
  public ResponseEntity<List<UsageAnalysisRow>> userUsageSummaryGet(
    @RequestParam(defaultValue = "DAY") UsageAnalysisInterval interval,
    @RequestParam(defaultValue = "true") boolean publicOnly,
    @RequestParam(required = false) Long companyId,
    @RequestParam(required = false, name = "search") String search,
    @RequestParam(required = false, name = "resource") String resource,
    @RequestParam(required = false) String fromDate,
    @RequestParam(required = false) String toDate,
    Pageable pageable
  ) {
    Page<UsageAnalysisRow> page = tokenStatsService.getPagedUserUsageSummary(
      interval,
      publicOnly,
      companyId,
      null,
      search,
      resource,
      fromDate,
      toDate,
      withDefaultSort(
        pageable,
        Sort.by(
          Sort.Order.desc("time"),
          Sort.Order.desc("usage"),
          Sort.Order.asc("userEmail")
        )
      )
    );

    HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(
      ServletUriComponentsBuilder.fromCurrentRequest(),
      page
    );
    return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
  }

  @GetMapping("/usage/summary/resources")
  public ResponseEntity<List<ResourceUsageAnalysisRow>> resourceUsageGet(
    @RequestParam(defaultValue = "DAY") UsageAnalysisInterval interval,
    @RequestParam(defaultValue = "true") boolean publicOnly,
    @RequestParam(required = false, name = "search") String search,
    @RequestParam(required = false) Long resourceId,
    @RequestParam(required = false) String fromDate,
    @RequestParam(required = false) String toDate,
    Pageable pageable
  ) {
    Page<ResourceUsageAnalysisRow> page = tokenStatsService.getPagedGlobalResourceUsageSummary(
      interval,
      publicOnly,
      search,
      resourceId,
      fromDate,
      toDate,
      withDefaultSort(
        pageable,
        Sort.by(
          Sort.Order.desc("time"),
          Sort.Order.desc("usage"),
          Sort.Order.asc("resource")
        )
      )
    );

    HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(
      ServletUriComponentsBuilder.fromCurrentRequest(),
      page
    );
    return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
  }

  @GetMapping("/usage/resources/{resourceId}")
  public ResponseEntity<UsageResourceName> usageResourceGet(
    @PathVariable Long resourceId
  ) {
    UsageResourceName resource = tokenStatsService
      .getUsageResourceName(resourceId)
      .orElseThrow(
        () -> new ResponseStatusException(
          HttpStatus.NOT_FOUND,
          "Usage resource not found."
        )
      );
    return new ResponseEntity<>(resource, HttpStatus.OK);
  }

  @GetMapping("/usage/summary/registrations")
  public ResponseEntity<List<UserRegistrationSummary>> registrationSummaryGet() {
    List<UserRegistrationSummary> summaries = userDetailsRepository
      .findDailyRegistrationSummaries()
      .stream()
      .map(this::toUserRegistrationSummary)
      .collect(Collectors.toList());
    return new ResponseEntity<>(summaries, HttpStatus.OK);
  }

  private Pageable withDefaultSort(Pageable pageable, Sort defaultSort) {
    int pageNumber = pageable == null ? 0 : pageable.getPageNumber();
    int pageSize =
      pageable == null || pageable.getPageSize() <= 0
        ? DEFAULT_PAGE_SIZE
        : pageable.getPageSize();
    Sort sort =
      pageable == null || pageable.getSort().isUnsorted()
        ? defaultSort
        : pageable.getSort();
    return PageRequest.of(pageNumber, pageSize, sort);
  }

  private UserRegistrationSummary toUserRegistrationSummary(
    UserRegistrationSummaryProjection projection
  ) {
    UserRegistrationSummary summary = new UserRegistrationSummary();
    summary.setDate(
      projection.getDate() == null
        ? NO_CREATION_DATE_LABEL
        : projection.getDate().toString()
    );
    summary.setTotal(projection.getTotal());
    summary.setLicenseType(projection.getLicenseType());
    return summary;
  }
}
