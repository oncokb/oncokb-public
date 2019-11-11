package org.mskcc.cbio.oncokb.service.dto.oncokbcore;

import java.util.Objects;

public class VariantConsequence implements java.io.Serializable {
    private String term;

    private Boolean isGenerallyTruncating;

    private String description;

    public VariantConsequence() {
    }

    public VariantConsequence(String term, String description, Boolean isGenerallyTruncating) {
        this.term = term;
        this.description = description;
        this.isGenerallyTruncating = isGenerallyTruncating;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsGenerallyTruncating() {
        if (this.isGenerallyTruncating == null) {
            return false;
        }
        return this.isGenerallyTruncating;
    }

    public void setIsGenerallyTruncating(Boolean isGenerallyTruncating) {
        this.isGenerallyTruncating = isGenerallyTruncating;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 79 * hash + Objects.hashCode(this.term);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final VariantConsequence other = (VariantConsequence) obj;
        if (!Objects.equals(this.term, other.term)) {
            return false;
        }
        return true;
    }


}
