package org.mskcc.cbio.oncokb.config.application;

public class UsageLiquibaseProperties {
  private boolean enabled = false;
  private String changeLog = "classpath:config/liquibase-usage/master.xml";
  private String schema = "oncokb_metrics";
  private String databaseChangeLogTable = "DATABASECHANGELOG_USAGE";
  private String databaseChangeLogLockTable = "DATABASECHANGELOGLOCK_USAGE";

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public String getChangeLog() {
    return changeLog;
  }

  public void setChangeLog(String changeLog) {
    this.changeLog = changeLog;
  }

  public String getSchema() {
    return schema;
  }

  public void setSchema(String schema) {
    this.schema = schema;
  }

  public String getDatabaseChangeLogTable() {
    return databaseChangeLogTable;
  }

  public void setDatabaseChangeLogTable(String databaseChangeLogTable) {
    this.databaseChangeLogTable = databaseChangeLogTable;
  }

  public String getDatabaseChangeLogLockTable() {
    return databaseChangeLogLockTable;
  }

  public void setDatabaseChangeLogLockTable(String databaseChangeLogLockTable) {
    this.databaseChangeLogLockTable = databaseChangeLogLockTable;
  }
}
