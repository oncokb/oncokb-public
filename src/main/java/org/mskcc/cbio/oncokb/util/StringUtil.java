package org.mskcc.cbio.oncokb.util;

/**
 * Created by Hongxin Zhang on 4/30/21.
 */
public class StringUtil {
    public static String getEmailDomain(String email) {
        return email.substring(email.indexOf("@") + 1);
    }

    public static String getFullName(String firstName, String lastName) {
        return firstName + " " + lastName;
    }
}
