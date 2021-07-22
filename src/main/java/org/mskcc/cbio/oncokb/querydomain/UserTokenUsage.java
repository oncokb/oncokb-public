package org.mskcc.cbio.oncokb.querydomain;

import org.mskcc.cbio.oncokb.domain.Token;

/**
 * Created by Hongxin Zhang on 7/1/20.
 */
public interface UserTokenUsage {
    Integer getCount();
    Integer getNumAccessIps();
    Token getToken();
}
