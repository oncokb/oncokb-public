package org.mskcc.cbio.oncokb.domain.enumeration;

/**
 * The LicenseType enumeration.
 */
public enum LicenseType {
    ACADEMIC("Research Use in an Academic Setting"),
    COMMERCIAL("Commercial Use"),
    RESEARCH_IN_COMMERCIAL("Research Use in a Commercial Setting"),
    HOSPITAL("Hospital Use");
    String name;

    LicenseType(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
