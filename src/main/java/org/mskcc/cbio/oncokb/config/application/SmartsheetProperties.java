package org.mskcc.cbio.oncokb.config.application;


import java.util.List;

public class SmartsheetProperties {
    String accessToken;
    Long sheetId;
    String editor = "OncoKB"; // the editor name will be included as the author of adding records to smartsheet, or any operations related to smartsheet
    List<Long> columnIds;

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public Long getSheetId() {
        return sheetId;
    }

    public void setSheetId(Long sheetId) {
        this.sheetId = sheetId;
    }

    public String getEditor() {
        return editor;
    }

    public void setEditor(String editor) {
        this.editor = editor;
    }

    public List<Long> getColumnIds() {
        return columnIds;
    }

    public void setColumnIds(List<Long> columnIds) {
        this.columnIds = columnIds;
    }
}
