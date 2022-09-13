package org.mskcc.cbio.oncokb.service.dto.useradditionalinfo;

import java.io.Serializable;

/**
 * Created by Hongxin Zhang on 4/28/21.
 */
public class Contact implements Serializable {
    String email;
    String phone;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
