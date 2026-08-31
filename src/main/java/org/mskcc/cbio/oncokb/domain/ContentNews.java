package org.mskcc.cbio.oncokb.domain;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ContentNews {
    private String dataVersion;
    private History history;
    private History germlineHistory;

    @JsonCreator
    public ContentNews(@JsonProperty("history") History history, @JsonProperty("germline_history") History germlineHistory) {
        this.history = history;
        this.germlineHistory = germlineHistory;
    }

    public String getDataVersion() {
        return dataVersion;
    }

    public void setDataVersion(String dataVersion) {
        this.dataVersion = dataVersion;
    }

    public History getHistory() {
        return history;
    }

    public History getGermlineHistory() {
        return germlineHistory;
    }

    public static class History {
        List<GeneUpdates> geneUpdates;

        @JsonCreator
        public History(LinkedHashMap<String, GeneUpdates> geneUpdates) {
            this.geneUpdates = new ArrayList<>();
            for (Map.Entry<String, GeneUpdates> entry : geneUpdates.entrySet()) {
                GeneUpdates updates = entry.getValue();
                updates.setHugoSymbol(entry.getKey());
                this.geneUpdates.add(updates);
            }
        }

        public List<GeneUpdates> getGeneUpdates() {
            return geneUpdates;
        }
    }

    public static class GeneUpdates {
        private String hugoSymbol;
        private List<Update> updates;
        private List<AlterationUpdates> alterationUpdates;

        @JsonCreator
        public GeneUpdates(
            @JsonProperty("updates") List<Update> updates,
            @JsonProperty("alteration_updates") LinkedHashMap<String, AlterationUpdates> alterationUpdates
        ) {
            this.updates = updates;
            this.alterationUpdates = new ArrayList<>();
            if (alterationUpdates != null) {
                for (Map.Entry<String, AlterationUpdates> entry : alterationUpdates.entrySet()) {
                    AlterationUpdates altUpdate = entry.getValue();
                    altUpdate.setAlteration(entry.getKey());
                    this.alterationUpdates.add(altUpdate);
                }
            }
        }

        public String getHugoSymbol() { 
            return hugoSymbol; 
        }

        public void setHugoSymbol(String hugoSymbol) { 
            this.hugoSymbol = hugoSymbol; 
        }

        public List<Update> getUpdates() { 
            return updates; 
        }

        public List<AlterationUpdates> getAlterationUpdates() { 
            return alterationUpdates; 
        }
    }

    public static class AlterationUpdates {
        private String alteration;
        private List<Update> updates;
        private List<CancerTypeUpdates> cancerTypeUpdates;

        @JsonCreator
        public AlterationUpdates(
            @JsonProperty("updates") List<Update> updates,
            @JsonProperty("cancer_type_updates") LinkedHashMap<String, CancerTypeUpdates> cancerTypeUpdates
        ) {
            this.updates = updates;
            this.cancerTypeUpdates = new ArrayList<>();
            if (cancerTypeUpdates != null) {
                for (Map.Entry<String, CancerTypeUpdates> entry : cancerTypeUpdates.entrySet()) {
                    CancerTypeUpdates ctUpdates = entry.getValue();
                    ctUpdates.setCancerType(entry.getKey());
                    this.cancerTypeUpdates.add(ctUpdates);
                }
            }
        }

        public String getAlteration() { 
            return alteration; 
        }
       
        public void setAlteration(String alteration) { 
            this.alteration = alteration; 
        }
        
        public List<Update> getUpdates() { 
            return updates;
        }

        public List<CancerTypeUpdates> getCancerTypeUpdates() { 
            return cancerTypeUpdates; 
        }
    }

    public static class CancerTypeUpdates {
        private String cancerType;
        private List<Update> updates;
        private List<TreatmentUpdates> treatmentUpdates;

        @JsonCreator
        public CancerTypeUpdates(
            @JsonProperty("updates") List<Update> updates,
            @JsonProperty("treatment_updates") LinkedHashMap<String, TreatmentUpdates> treatmentUpdates
        ) {
            this.updates = updates;
            this.treatmentUpdates = new ArrayList<>();
            if (treatmentUpdates != null) {
                for (Map.Entry<String, TreatmentUpdates> entry : treatmentUpdates.entrySet()) {
                    TreatmentUpdates txUpdates = entry.getValue();
                    txUpdates.setTreatment(entry.getKey());
                    this.treatmentUpdates.add(txUpdates);
                }
            }
        }

        public String getCancerType() { 
            return cancerType; 
        }

        public void setCancerType(String cancerType) { 
            this.cancerType = cancerType;
        }

        public List<Update> getUpdates() { 
            return updates; 
        }

        public List<TreatmentUpdates> getTreatmentUpdates() { 
            return treatmentUpdates; 
        }
    }

    public static class TreatmentUpdates {
        private String treatment;
        private List<Update> updates;

        @JsonCreator
        public TreatmentUpdates(
            @JsonProperty("updates") List<Update> updates
        ) {
            this.updates = updates;
        }

        public String getTreatment() { 
            return treatment; 
        }

        public void setTreatment(String treatment) { 
            this.treatment = treatment; 
        }

        public List<Update> getUpdates() { 
            return updates; 
        }
    }

    public static class Update {
        @JsonProperty("field")
        private String field;

        @JsonProperty("operation")
        private String operation;

        @JsonProperty("new")
        private String newValue;

        @JsonProperty("old")
        private String oldValue;

        @JsonProperty("timestamp")
        private long timestamp;
    }
}