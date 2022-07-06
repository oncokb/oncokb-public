package org.mskcc.cbio.oncokb.util;

import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.AdditionalInfoDTO;

public class ObjectUtil {
    
    /**
     * Checks if a AdditionalInfoDTO is empty or null. AdditionalInfoDTO is empty if its fields are all empty as well.
     * 
     * @param additionalInfoDTO the user's additionalInfoDTO
     * @return true if null or empty, otherwise false
     */
    public static boolean isUserAdditionalInfoEmpty(AdditionalInfoDTO additionalInfoDTO) {
        if (additionalInfoDTO == null) {
            return true;
        }
        return additionalInfoDTO.getTrialAccount() == null && additionalInfoDTO.getUserCompany() == null;
    }
}
