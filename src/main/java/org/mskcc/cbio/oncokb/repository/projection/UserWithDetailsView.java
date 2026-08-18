package org.mskcc.cbio.oncokb.repository.projection;

import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserDetails;

public class UserWithDetailsView implements UserWithDetailsProjection {
    private final User user;
    private final UserDetails userDetails;

    public UserWithDetailsView(User user, UserDetails userDetails) {
        this.user = user;
        this.userDetails = userDetails;
    }

    @Override
    public User getUser() {
        return user;
    }

    @Override
    public UserDetails getUserDetails() {
        return userDetails;
    }
}
