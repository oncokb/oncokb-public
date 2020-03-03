package org.mskcc.cbio.oncokb.service;

public class EmailAlreadyUsedException extends RuntimeException {

    public EmailAlreadyUsedException() {
        super("Email is already in use.");
    }

}
