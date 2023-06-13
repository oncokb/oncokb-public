package org.mskcc.cbio.oncokb.domain.enumeration;

/**
 * The EmailSubject enumeration.
 *
 * This enum is for the Slack integration. When team member
 * selects an email option, an input modal will pop up with
 * one of the below options as a default subject. See
 *
 * SlackService.buildModalView()
 *
 * for more details.
 */
public enum EmailSubject {
    DEFAULT // "License for " + userDTO.getLicenseType().getName() + " of OncoKB"
    , COMPANY // "OncoKB - " + userDTO.getCompanyName() + " license options"
}
