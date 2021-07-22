package org.mskcc.cbio.oncokb.domain;

import org.mskcc.cbio.oncokb.service.dto.UserDTO;

/**
 * Created by Benjamin Xu on 6/22/21.
 */
public class UserTokenPair {
    UserDTO userDTO;

    Token token;

    public UserTokenPair(UserDTO userDTO, Token token) {
        this.userDTO = userDTO;
        this.token = token;
    }

    public UserDTO getUserDTO() { return userDTO; }

    public Token getToken() { return token; }
}
