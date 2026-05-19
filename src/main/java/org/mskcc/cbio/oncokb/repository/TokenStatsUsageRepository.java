package org.mskcc.cbio.oncokb.repository;

import java.util.Optional;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageAnalysisInterval;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.ResourceUsageAnalysisRow;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageAnalysisRow;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageResourceName;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TokenStatsUsageRepository {
  Page<UsageAnalysisRow> findPagedUserUsageSummary(
    UsageAnalysisInterval interval,
    boolean publicOnly,
    Long companyId,
    Long userId,
    String searchQuery,
    String resourceContainsQuery,
    String fromDate,
    String toDate,
    Pageable pageable
  );

  Page<ResourceUsageAnalysisRow> findPagedResourceUsageSummary(
    UsageAnalysisInterval interval,
    boolean publicOnly,
    Long userId,
    String searchQuery,
    String resourceContainsQuery,
    String fromDate,
    String toDate,
    Pageable pageable
  );

  Page<ResourceUsageAnalysisRow> findPagedGlobalResourceUsageSummary(
    UsageAnalysisInterval interval,
    boolean publicOnly,
    String searchQuery,
    Long resourceId,
    String fromDate,
    String toDate,
    Pageable pageable
  );

  Optional<UsageResourceName> findResourceNameById(Long resourceId);
}
