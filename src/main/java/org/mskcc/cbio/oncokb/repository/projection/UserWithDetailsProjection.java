package org.mskcc.cbio.oncokb.repository.projection;

import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserDetails;

public interface UserWithDetailsProjection {
    User getUser();

    UserDetails getUserDetails();
}
