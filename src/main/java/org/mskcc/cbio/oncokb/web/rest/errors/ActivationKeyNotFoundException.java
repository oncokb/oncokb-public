package org.mskcc.cbio.oncokb.web.rest.errors;

/**
 * Thrown when an activation key cannot be found. This happens both when the key was never valid and
 * when it has already been used (the key is cleared once verified), so the two cases are
 * indistinguishable. The dedicated {@code type} lets the frontend recognize this case without
 * matching on the message text.
 */
public class ActivationKeyNotFoundException extends BadRequestAlertException {

    private static final long serialVersionUID = 1L;

    public ActivationKeyNotFoundException() {
        super(ErrorConstants.ACTIVATION_KEY_NOT_FOUND_TYPE,
            "Your account could not be activated because the activation key is invalid or has already been used.",
            "account", "activationkeynotfound");
    }
}
