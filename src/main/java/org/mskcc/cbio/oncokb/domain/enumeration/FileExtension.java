package org.mskcc.cbio.oncokb.domain.enumeration;

/**
 * The FileExtension enumeration.
 */
public enum FileExtension {
    ZIPPED_FILE(".zip"),
    TEXT_FILE(".txt"),
    JSON_FILE(".json");
    String extension;

    FileExtension(String extension) {
        this.extension = extension;
    }

    public String getExtension() { return extension; }
}
