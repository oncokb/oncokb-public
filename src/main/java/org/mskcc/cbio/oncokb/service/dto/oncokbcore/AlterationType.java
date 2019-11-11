package org.mskcc.cbio.oncokb.service.dto.oncokbcore;
public enum AlterationType {

    MUTATION("Mutation"),
    COPY_NUMBER_ALTERATION("Copy number alteration"),

    @Deprecated
    FUSION("Fusion"),

    STRUCTURAL_VARIANT("Structural Variant");

    private AlterationType(String label) {
        this.label = label;
    }

    private String label;

    public String label() {
        return label;
    }

    public static AlterationType getByName(String name) {
        for (AlterationType alterationType : AlterationType.values()) {
            if (alterationType.name().equalsIgnoreCase(name)) {
                return alterationType;
            }
        }
        return null;
    }
}
