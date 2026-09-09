package org.mskcc.cbio.oncokb.web.rest.vm;

import org.mskcc.cbio.oncokb.service.dto.UserDTO;

import java.util.List;

public class RegisteredUsersResponseVM {
    private long totalCount;
    private List<UserDTO> users;

    public RegisteredUsersResponseVM(long totalCount, List<UserDTO> users) {
        this.totalCount = totalCount;
        this.users = users;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public List<UserDTO> getUsers() {
        return users;
    }

    public void setUsers(List<UserDTO> users) {
        this.users = users;
    }
}
