package org.mskcc.cbio.oncokb.querydomain;

import org.mskcc.cbio.oncokb.domain.Token;

/**
 * Created by Yifu Yao on 2021-1-14
 */

public interface UserTokenUsageWithInfo {
    Integer getCount();
    Token getToken();
    String getTime();
    String getResource();
}
