package org.mskcc.cbio.oncokb.util;

import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;

import static org.mskcc.cbio.oncokb.config.Constants.MSK_EMAIL_DOMAIN;
import static org.mskcc.cbio.oncokb.util.StringUtil.getEmailDomain;

/**
 * Created by Hongxin Zhang on 4/30/21.
 */
public class MainUtil {
    public static boolean isMSKUser(UserDTO userDTO) {
        return getEmailDomain(userDTO.getEmail()).toLowerCase().endsWith(MSK_EMAIL_DOMAIN.toLowerCase());
    }

    public static boolean isMSKCommercialUser(UserDTO userDTO) {
        return isMSKUser(userDTO) && !userDTO.getLicenseType().equals(LicenseType.ACADEMIC);
    }
}
