package org.mskcc.cbio.oncokb.web.rest;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.repository.projection.UserRegistrationSummaryProjection;
import org.mskcc.cbio.oncokb.service.TokenStatsService;
import org.mskcc.cbio.oncokb.web.rest.errors.ExceptionTranslator;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.ResourceUsageAnalysisRow;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageAnalysisInterval;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageAnalysisRow;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageResourceName;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import java.util.Optional;

/**
 * Unit tests for the {@link UsageAnalysisController} REST controller.
 */
public class UsageAnalysisControllerIT {
  @Mock
  private TokenStatsService tokenStatsService;

  @Mock
  private UserDetailsRepository userDetailsRepository;

  private MockMvc restMockMvc;

  @Before
  public void setup() {
    MockitoAnnotations.initMocks(this);
    UsageAnalysisController usageAnalysisController =
      new UsageAnalysisController(
        tokenStatsService,
        userDetailsRepository
      );
    this.restMockMvc =
      MockMvcBuilders
        .standaloneSetup(usageAnalysisController)
        .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
        .setControllerAdvice(new ExceptionTranslator(new MockEnvironment()))
        .build();
  }

  @Test
  public void shouldGetUsageSummaryUsersWithDefaultSorting() throws Exception {
    UsageAnalysisRow row = new UsageAnalysisRow();
    row.setUserId("42");
    row.setUserEmail("user@example.org");
    row.setResource("/api/v1/genes");
    row.setUsage(123L);
    row.setTime("2026-05-19");
    row.setMaxUsageProportion(87.5f);

    when(
      tokenStatsService.getPagedUserUsageSummary(
        org.mockito.ArgumentMatchers.eq(UsageAnalysisInterval.DAY),
        org.mockito.ArgumentMatchers.eq(true),
        org.mockito.ArgumentMatchers.eq(99L),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.any(Pageable.class)
      )
    )
      .thenReturn(ListBackedPages.userUsagePage(row));

    restMockMvc
      .perform(get("/api/usage/summary/users").param("companyId", "99"))
      .andExpect(status().isOk())
      .andExpect(
        content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
      )
      .andExpect(header().string("X-Total-Count", "1"))
      .andExpect(jsonPath("$", hasSize(1)))
      .andExpect(jsonPath("$[0].userId").value("42"))
      .andExpect(jsonPath("$[0].userEmail").value("user@example.org"))
      .andExpect(jsonPath("$[0].resource").value("/api/v1/genes"))
      .andExpect(jsonPath("$[0].usage").value(123))
      .andExpect(jsonPath("$[0].time").value("2026-05-19"))
      .andExpect(jsonPath("$[0].maxUsageProportion").value(87.5));

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(
      Pageable.class
    );
    verify(tokenStatsService)
      .getPagedUserUsageSummary(
        UsageAnalysisInterval.DAY,
        true,
        99L,
        null,
        null,
        null,
        null,
        null,
        pageableCaptor.capture()
      );

    Pageable pageable = pageableCaptor.getValue();
    org.assertj.core.api.Assertions
      .assertThat(pageable.getPageNumber())
      .isEqualTo(0);
    org.assertj.core.api.Assertions
      .assertThat(pageable.getPageSize())
      .isEqualTo(20);
    org.assertj.core.api.Assertions
      .assertThat(pageable.getSort().toList())
      .containsExactly(
        new Sort.Order(Sort.Direction.DESC, "time"),
        new Sort.Order(Sort.Direction.DESC, "usage"),
        new Sort.Order(Sort.Direction.ASC, "userEmail")
      );
  }

  @Test
  public void shouldGetUsageSummaryResources() throws Exception {
    ResourceUsageAnalysisRow row = new ResourceUsageAnalysisRow();
    row.setResourceId(8L);
    row.setResource("/api/v1/variants");
    row.setUsage(55L);
    row.setTime("2026-05");

    when(
      tokenStatsService.getPagedGlobalResourceUsageSummary(
        org.mockito.ArgumentMatchers.eq(UsageAnalysisInterval.MONTH),
        org.mockito.ArgumentMatchers.eq(false),
        org.mockito.ArgumentMatchers.eq("variants"),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.any(Pageable.class)
      )
    )
      .thenReturn(
        new PageImpl<>(
          Collections.singletonList(row),
          PageRequest.of(
            0,
            5,
            Sort.by(
              Sort.Order.asc("resource"),
              Sort.Order.desc("usage")
            )
          ),
          1
        )
      );

    restMockMvc
      .perform(
        get("/api/usage/summary/resources")
          .param("interval", "MONTH")
          .param("publicOnly", "false")
          .param("search", "variants")
          .param("size", "5")
          .param("sort", "resource,asc")
          .param("sort", "usage,desc")
      )
      .andExpect(status().isOk())
      .andExpect(header().string("X-Total-Count", "1"))
      .andExpect(jsonPath("$", hasSize(1)))
      .andExpect(jsonPath("$[0].resourceId").value(8))
      .andExpect(jsonPath("$[0].resource").value("/api/v1/variants"))
      .andExpect(jsonPath("$[0].usage").value(55))
      .andExpect(jsonPath("$[0].time").value("2026-05"));

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(
      Pageable.class
    );
    verify(tokenStatsService)
      .getPagedGlobalResourceUsageSummary(
        UsageAnalysisInterval.MONTH,
        false,
        "variants",
        null,
        null,
        null,
        pageableCaptor.capture()
      );

    org.assertj.core.api.Assertions
      .assertThat(pageableCaptor.getValue().getSort().toList())
      .containsExactly(
        new Sort.Order(Sort.Direction.ASC, "resource"),
        new Sort.Order(Sort.Direction.DESC, "usage")
      );
  }

  @Test
  public void shouldGetUsageSummaryResourcesByResourceId() throws Exception {
    ResourceUsageAnalysisRow row = new ResourceUsageAnalysisRow();
    row.setResourceId(77L);
    row.setResource("/api/v1/annotate/mutations/byProteinChange");
    row.setUsage(21L);
    row.setTime("2026-05");

    when(
      tokenStatsService.getPagedGlobalResourceUsageSummary(
        org.mockito.ArgumentMatchers.eq(UsageAnalysisInterval.MONTH),
        org.mockito.ArgumentMatchers.eq(true),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.eq(77L),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.any(Pageable.class)
      )
    )
      .thenReturn(ListBackedPages.resourceUsagePage(row));

    restMockMvc
      .perform(
        get("/api/usage/summary/resources")
          .param("interval", "MONTH")
          .param("resourceId", "77")
      )
      .andExpect(status().isOk())
      .andExpect(header().string("X-Total-Count", "1"))
      .andExpect(jsonPath("$[0].resourceId").value(77))
      .andExpect(
        jsonPath("$[0].resource").value(
          "/api/v1/annotate/mutations/byProteinChange"
        )
      );

    verify(tokenStatsService)
      .getPagedGlobalResourceUsageSummary(
        UsageAnalysisInterval.MONTH,
        true,
        null,
        77L,
        null,
        null,
        PageRequest.of(
          0,
          20,
          Sort.by(
            Sort.Order.desc("time"),
            Sort.Order.desc("usage"),
            Sort.Order.asc("resource")
          )
        )
      );
  }

  @Test
  public void shouldGetUsageResourceName() throws Exception {
    UsageResourceName resourceName = new UsageResourceName();
    resourceName.setResourceId(77L);
    resourceName.setResource("/api/v1/annotate/mutations/byProteinChange");

    when(tokenStatsService.getUsageResourceName(77L))
      .thenReturn(Optional.of(resourceName));

    restMockMvc
      .perform(get("/api/usage/resources/77"))
      .andExpect(status().isOk())
      .andExpect(
        content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
      )
      .andExpect(jsonPath("$.resourceId").value(77))
      .andExpect(
        jsonPath("$.resource").value(
          "/api/v1/annotate/mutations/byProteinChange"
        )
      );
  }

  @Test
  public void shouldReturnNotFoundForUnknownUsageResourceName() throws Exception {
    when(tokenStatsService.getUsageResourceName(77L))
      .thenReturn(Optional.empty());

    restMockMvc
      .perform(get("/api/usage/resources/77"))
      .andExpect(status().isNotFound());
  }

  @Test
  public void shouldGetUserUsageDetails() throws Exception {
    ResourceUsageAnalysisRow row = new ResourceUsageAnalysisRow();
    row.setResource("/api/private/annotate");
    row.setUsage(12L);
    row.setTime("2026");

    when(
      tokenStatsService.getPagedResourceUsageSummary(
        org.mockito.ArgumentMatchers.eq(UsageAnalysisInterval.YEAR),
        org.mockito.ArgumentMatchers.eq(true),
        org.mockito.ArgumentMatchers.eq(7L),
        org.mockito.ArgumentMatchers.eq("annotate"),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.any(Pageable.class)
      )
    )
      .thenReturn(
        new PageImpl<>(
          Collections.singletonList(row),
          PageRequest.of(1, 10, Sort.by(Sort.Order.desc("time"))),
          3
        )
      );

    restMockMvc
      .perform(
        get("/api/usage/users/7")
          .param("interval", "YEAR")
          .param("search", "annotate")
          .param("page", "1")
          .param("size", "10")
      )
      .andExpect(status().isOk())
      .andExpect(header().string("X-Total-Count", "3"))
      .andExpect(jsonPath("$[0].resource").value("/api/private/annotate"))
      .andExpect(jsonPath("$[0].usage").value(12))
      .andExpect(jsonPath("$[0].time").value("2026"));

    verify(tokenStatsService)
      .getPagedResourceUsageSummary(
        UsageAnalysisInterval.YEAR,
        true,
        7L,
        "annotate",
        null,
        null,
        null,
        PageRequest.of(
          1,
          10,
          Sort.by(
            Sort.Order.desc("time"),
            Sort.Order.desc("usage"),
            Sort.Order.asc("resource")
          )
        )
      );
  }

  @Test
  public void shouldGetRegistrationSummary() throws Exception {
    UserRegistrationSummaryProjection noDateProjection = mock(
      UserRegistrationSummaryProjection.class
    );
    when(noDateProjection.getDate()).thenReturn(null);
    when(noDateProjection.getTotal()).thenReturn(2L);
    when(noDateProjection.getLicenseType()).thenReturn("ACADEMIC");

    UserRegistrationSummaryProjection datedProjection = mock(
      UserRegistrationSummaryProjection.class
    );
    when(datedProjection.getDate()).thenReturn(LocalDate.of(2026, 5, 19));
    when(datedProjection.getTotal()).thenReturn(4L);
    when(datedProjection.getLicenseType()).thenReturn("COMMERCIAL");

    when(userDetailsRepository.findDailyRegistrationSummaries())
      .thenReturn(Arrays.asList(noDateProjection, datedProjection));

    restMockMvc
      .perform(get("/api/usage/summary/registrations"))
      .andExpect(status().isOk())
      .andExpect(
        content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
      )
      .andExpect(jsonPath("$", hasSize(2)))
      .andExpect(jsonPath("$[0].date").value("No creation date"))
      .andExpect(jsonPath("$[0].total").value(2))
      .andExpect(jsonPath("$[0].licenseType").value("ACADEMIC"))
      .andExpect(jsonPath("$[1].date").value("2026-05-19"))
      .andExpect(jsonPath("$[1].total").value(4))
      .andExpect(jsonPath("$[1].licenseType").value("COMMERCIAL"));
  }

  private static final class ListBackedPages {
    private ListBackedPages() {}

    private static PageImpl<UsageAnalysisRow> userUsagePage(UsageAnalysisRow row) {
      return new PageImpl<>(
        Collections.singletonList(row),
        PageRequest.of(0, 20, Sort.by(Sort.Order.desc("time"))),
        1
      );
    }

    private static PageImpl<ResourceUsageAnalysisRow> resourceUsagePage(
      ResourceUsageAnalysisRow row
    ) {
      return new PageImpl<>(
        Collections.singletonList(row),
        PageRequest.of(0, 20, Sort.by(Sort.Order.desc("time"))),
        1
      );
    }
  }
}
