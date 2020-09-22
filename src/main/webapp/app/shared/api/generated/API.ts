import * as request from "superagent";

type CallbackHandler = (err: any, res ? : request.Response) => void;
export type KeyAndPasswordVM = {
    'key': string

        'newPassword': string

};
export type LoginVM = {
    'password': string

        'rememberMe': boolean

        'username': string

};
export type MailTypeInfo = {
    'description': string

        'mailType': "ACTIVATION" | "APPROVAL" | "CREATION" | "PASSWORD_RESET" | "LICENSE_REVIEW_COMMERCIAL" | "LICENSE_REVIEW_RESEARCH_COMMERCIAL" | "LICENSE_REVIEW_HOSPITAL" | "SEND_INTAKE_FORM_COMMERCIAL" | "SEND_INTAKE_FORM_RESEARCH_COMMERCIAL" | "SEND_INTAKE_FORM_HOSPITAL" | "CLARIFY_ACADEMIC_FOR_PROFIT" | "CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL" | "VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES" | "APPROVAL_MSK_IN_COMMERCIAL" | "TRIAL_ACCOUNT_IS_ABOUT_TO_EXPIRE" | "TEST"

};
export type ManagedUserVM = {
    'activated': boolean

        'activationKey': string

        'authorities': Array < string >

        'city': string

        'company': string

        'country': string

        'createdBy': string

        'createdDate': string

        'email': string

        'emailVerified': boolean

        'firstName': string

        'id': number

        'imageUrl': string

        'jobTitle': string

        'langKey': string

        'lastModifiedBy': string

        'lastModifiedDate': string

        'lastName': string

        'licenseType': "ACADEMIC" | "COMMERCIAL" | "RESEARCH_IN_COMMERCIAL" | "HOSPITAL"

        'login': string

        'password': string

        'resetDate': string

        'resetKey': string

        'tokenIsRenewable': boolean

        'tokenValidDays': number

};
export type PasswordChangeDTO = {
    'currentPassword': string

        'newPassword': string

};
export type Token = {
    'creation': string

        'currentUsage': number

        'expiration': string

        'id': number

        'renewable': boolean

        'token': string

        'usageLimit': number

        'user': User

};
export type User = {
    'activated': boolean

        'email': string

        'firstName': string

        'id': number

        'imageUrl': string

        'langKey': string

        'lastName': string

        'login': string

        'resetDate': string

};
export type UserDTO = {
    'activated': boolean

        'activationKey': string

        'authorities': Array < string >

        'city': string

        'company': string

        'country': string

        'createdBy': string

        'createdDate': string

        'email': string

        'emailVerified': boolean

        'firstName': string

        'id': number

        'imageUrl': string

        'jobTitle': string

        'langKey': string

        'lastModifiedBy': string

        'lastModifiedDate': string

        'lastName': string

        'licenseType': "ACADEMIC" | "COMMERCIAL" | "RESEARCH_IN_COMMERCIAL" | "HOSPITAL"

        'login': string

        'resetDate': string

        'resetKey': string

};
export type UserDetailsDTO = {
    'address': string

        'city': string

        'company': string

        'country': string

        'id': number

        'jobTitle': string

        'licenseType': "ACADEMIC" | "COMMERCIAL" | "RESEARCH_IN_COMMERCIAL" | "HOSPITAL"

        'userId': number

};
export type UserMailsDTO = {
    'id': number

        'mailType': "ACTIVATION" | "APPROVAL" | "CREATION" | "PASSWORD_RESET" | "LICENSE_REVIEW_COMMERCIAL" | "LICENSE_REVIEW_RESEARCH_COMMERCIAL" | "LICENSE_REVIEW_HOSPITAL" | "SEND_INTAKE_FORM_COMMERCIAL" | "SEND_INTAKE_FORM_RESEARCH_COMMERCIAL" | "SEND_INTAKE_FORM_HOSPITAL" | "CLARIFY_ACADEMIC_FOR_PROFIT" | "CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL" | "VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES" | "APPROVAL_MSK_IN_COMMERCIAL" | "TRIAL_ACCOUNT_IS_ABOUT_TO_EXPIRE" | "TEST"

        'sentBy': string

        'sentDate': string

        'sentFrom': string

        'userId': number

        'userLogin': string

};

/**
 * OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
 * @class API
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export default class API {

    private domain: string = "";
    private errorHandlers: CallbackHandler[] = [];

    constructor(domain ? : string) {
        if (domain) {
            this.domain = domain;
        }
    }

    getDomain() {
        return this.domain;
    }

    addErrorHandler(handler: CallbackHandler) {
        this.errorHandlers.push(handler);
    }

    private request(method: string, url: string, body: any, headers: any, queryParameters: any, form: any, reject: CallbackHandler, resolve: CallbackHandler, errorHandlers: CallbackHandler[]) {
        let req = (new(request as any).Request(method, url) as request.Request)
            .query(queryParameters);
        Object.keys(headers).forEach(key => {
            req.set(key, headers[key]);
        });

        if (body) {
            req.send(body);
        }

        if (typeof(body) === 'object' && !(body.constructor.name === 'Buffer')) {
            req.set('Content-Type', 'application/json');
        }

        if (Object.keys(form).length > 0) {
            req.type('form');
            req.send(form);
        }

        req.end((error, response) => {
            if (error || !response.ok) {
                reject(error);
                errorHandlers.forEach(handler => handler(error));
            } else {
                resolve(response);
            }
        });
    }

    getAccountUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/account';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getAccount
     * @method
     * @name API#getAccountUsingGET
     */
    getAccountUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/account';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getAccount
     * @method
     * @name API#getAccountUsingGET
     */
    getAccountUsingGET(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < UserDTO > {
        return this.getAccountUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    saveAccountUsingPOSTURL(parameters: {
        'userDto': UserDTO,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/account';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * saveAccount
     * @method
     * @name API#saveAccountUsingPOST
     * @param {} userDto - userDTO
     */
    saveAccountUsingPOSTWithHttpInfo(parameters: {
        'userDto': UserDTO,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/account';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['userDto'] !== undefined) {
                body = parameters['userDto'];
            }

            if (parameters['userDto'] === undefined) {
                reject(new Error('Missing required  parameter: userDto'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * saveAccount
     * @method
     * @name API#saveAccountUsingPOST
     * @param {} userDto - userDTO
     */
    saveAccountUsingPOST(parameters: {
        'userDto': UserDTO,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        return this.saveAccountUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    changePasswordUsingPOSTURL(parameters: {
        'passwordChangeDto': PasswordChangeDTO,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/account/change-password';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * changePassword
     * @method
     * @name API#changePasswordUsingPOST
     * @param {} passwordChangeDto - passwordChangeDto
     */
    changePasswordUsingPOSTWithHttpInfo(parameters: {
        'passwordChangeDto': PasswordChangeDTO,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/account/change-password';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['passwordChangeDto'] !== undefined) {
                body = parameters['passwordChangeDto'];
            }

            if (parameters['passwordChangeDto'] === undefined) {
                reject(new Error('Missing required  parameter: passwordChangeDto'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * changePassword
     * @method
     * @name API#changePasswordUsingPOST
     * @param {} passwordChangeDto - passwordChangeDto
     */
    changePasswordUsingPOST(parameters: {
        'passwordChangeDto': PasswordChangeDTO,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        return this.changePasswordUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    resendVerificationUsingPOSTURL(parameters: {
        'loginVm': LoginVM,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/account/resend-verification';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * resendVerification
     * @method
     * @name API#resendVerificationUsingPOST
     * @param {} loginVm - loginVM
     */
    resendVerificationUsingPOSTWithHttpInfo(parameters: {
        'loginVm': LoginVM,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/account/resend-verification';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['loginVm'] !== undefined) {
                body = parameters['loginVm'];
            }

            if (parameters['loginVm'] === undefined) {
                reject(new Error('Missing required  parameter: loginVm'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * resendVerification
     * @method
     * @name API#resendVerificationUsingPOST
     * @param {} loginVm - loginVM
     */
    resendVerificationUsingPOST(parameters: {
        'loginVm': LoginVM,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        return this.resendVerificationUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    finishPasswordResetUsingPOSTURL(parameters: {
        'keyAndPassword': KeyAndPasswordVM,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/account/reset-password/finish';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * finishPasswordReset
     * @method
     * @name API#finishPasswordResetUsingPOST
     * @param {} keyAndPassword - keyAndPassword
     */
    finishPasswordResetUsingPOSTWithHttpInfo(parameters: {
        'keyAndPassword': KeyAndPasswordVM,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/account/reset-password/finish';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['keyAndPassword'] !== undefined) {
                body = parameters['keyAndPassword'];
            }

            if (parameters['keyAndPassword'] === undefined) {
                reject(new Error('Missing required  parameter: keyAndPassword'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * finishPasswordReset
     * @method
     * @name API#finishPasswordResetUsingPOST
     * @param {} keyAndPassword - keyAndPassword
     */
    finishPasswordResetUsingPOST(parameters: {
        'keyAndPassword': KeyAndPasswordVM,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        return this.finishPasswordResetUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    requestPasswordResetUsingPOSTURL(parameters: {
        'mail': string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/account/reset-password/init';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * requestPasswordReset
     * @method
     * @name API#requestPasswordResetUsingPOST
     * @param {} mail - mail
     */
    requestPasswordResetUsingPOSTWithHttpInfo(parameters: {
        'mail': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/account/reset-password/init';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['mail'] !== undefined) {
                body = parameters['mail'];
            }

            if (parameters['mail'] === undefined) {
                reject(new Error('Missing required  parameter: mail'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * requestPasswordReset
     * @method
     * @name API#requestPasswordResetUsingPOST
     * @param {} mail - mail
     */
    requestPasswordResetUsingPOST(parameters: {
        'mail': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        return this.requestPasswordResetUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    getTokensUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/account/tokens';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getTokens
     * @method
     * @name API#getTokensUsingGET
     */
    getTokensUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/account/tokens';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getTokens
     * @method
     * @name API#getTokensUsingGET
     */
    getTokensUsingGET(parameters: {
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < Token >
        > {
            return this.getTokensUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    createTokenUsingPOSTURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/account/tokens';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * createToken
     * @method
     * @name API#createTokenUsingPOST
     */
    createTokenUsingPOSTWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/account/tokens';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * createToken
     * @method
     * @name API#createTokenUsingPOST
     */
    createTokenUsingPOST(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < Token > {
        return this.createTokenUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    deleteTokenUsingDELETEURL(parameters: {
        'token': Token,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/account/tokens';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * deleteToken
     * @method
     * @name API#deleteTokenUsingDELETE
     * @param {} token - token
     */
    deleteTokenUsingDELETEWithHttpInfo(parameters: {
        'token': Token,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/account/tokens';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters['token'] !== undefined) {
                body = parameters['token'];
            }

            if (parameters['token'] === undefined) {
                reject(new Error('Missing required  parameter: token'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * deleteToken
     * @method
     * @name API#deleteTokenUsingDELETE
     * @param {} token - token
     */
    deleteTokenUsingDELETE(parameters: {
        'token': Token,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        return this.deleteTokenUsingDELETEWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    activateAccountUsingGETURL(parameters: {
        'key': string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/activate';
        if (parameters['key'] !== undefined) {
            queryParameters['key'] = parameters['key'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * activateAccount
     * @method
     * @name API#activateAccountUsingGET
     * @param {string} key - key
     */
    activateAccountUsingGETWithHttpInfo(parameters: {
        'key': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/activate';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters['key'] !== undefined) {
                queryParameters['key'] = parameters['key'];
            }

            if (parameters['key'] === undefined) {
                reject(new Error('Missing required  parameter: key'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * activateAccount
     * @method
     * @name API#activateAccountUsingGET
     * @param {string} key - key
     */
    activateAccountUsingGET(parameters: {
        'key': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < boolean > {
        return this.activateAccountUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    isAuthenticatedUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/authenticate';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * isAuthenticated
     * @method
     * @name API#isAuthenticatedUsingGET
     */
    isAuthenticatedUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/authenticate';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * isAuthenticated
     * @method
     * @name API#isAuthenticatedUsingGET
     */
    isAuthenticatedUsingGET(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < string > {
        return this.isAuthenticatedUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    authorizeUsingPOSTURL(parameters: {
        'loginVm': LoginVM,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/authenticate';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * authorize
     * @method
     * @name API#authorizeUsingPOST
     * @param {} loginVm - loginVM
     */
    authorizeUsingPOSTWithHttpInfo(parameters: {
        'loginVm': LoginVM,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/authenticate';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['loginVm'] !== undefined) {
                body = parameters['loginVm'];
            }

            if (parameters['loginVm'] === undefined) {
                reject(new Error('Missing required  parameter: loginVm'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * authorize
     * @method
     * @name API#authorizeUsingPOST
     * @param {} loginVm - loginVM
     */
    authorizeUsingPOST(parameters: {
        'loginVm': LoginVM,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < string > {
        return this.authorizeUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    checkTrialAccountsUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/cronjob/check-trial-accounts';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * checkTrialAccounts
     * @method
     * @name API#checkTrialAccountsUsingGET
     */
    checkTrialAccountsUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/cronjob/check-trial-accounts';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * checkTrialAccounts
     * @method
     * @name API#checkTrialAccountsUsingGET
     */
    checkTrialAccountsUsingGET(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < any > {
        return this.checkTrialAccountsUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    generateTokensUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/cronjob/generate-tokens';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * generateTokens
     * @method
     * @name API#generateTokensUsingGET
     */
    generateTokensUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/cronjob/generate-tokens';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * generateTokens
     * @method
     * @name API#generateTokensUsingGET
     */
    generateTokensUsingGET(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < any > {
        return this.generateTokensUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    removeNotActivatedUsersUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/cronjob/remove-not-activate-users';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * removeNotActivatedUsers
     * @method
     * @name API#removeNotActivatedUsersUsingGET
     */
    removeNotActivatedUsersUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/cronjob/remove-not-activate-users';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * removeNotActivatedUsers
     * @method
     * @name API#removeNotActivatedUsersUsingGET
     */
    removeNotActivatedUsersUsingGET(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < any > {
        return this.removeNotActivatedUsersUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    removeOldAuditEventsUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/cronjob/remove-old-audit-events';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * removeOldAuditEvents
     * @method
     * @name API#removeOldAuditEventsUsingGET
     */
    removeOldAuditEventsUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/cronjob/remove-old-audit-events';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * removeOldAuditEvents
     * @method
     * @name API#removeOldAuditEventsUsingGET
     */
    removeOldAuditEventsUsingGET(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < any > {
        return this.removeOldAuditEventsUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    removeOldTokenStatsUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/cronjob/remove-old-token-stats';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * removeOldTokenStats
     * @method
     * @name API#removeOldTokenStatsUsingGET
     */
    removeOldTokenStatsUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/cronjob/remove-old-token-stats';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * removeOldTokenStats
     * @method
     * @name API#removeOldTokenStatsUsingGET
     */
    removeOldTokenStatsUsingGET(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < any > {
        return this.removeOldTokenStatsUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    tokensRenewCheckUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/cronjob/renew-tokens';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * tokensRenewCheck
     * @method
     * @name API#tokensRenewCheckUsingGET
     */
    tokensRenewCheckUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/cronjob/renew-tokens';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * tokensRenewCheck
     * @method
     * @name API#tokensRenewCheckUsingGET
     */
    tokensRenewCheckUsingGET(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < any > {
        return this.tokensRenewCheckUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    updateTokenStatsUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/cronjob/update-token-stats';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * updateTokenStats
     * @method
     * @name API#updateTokenStatsUsingGET
     */
    updateTokenStatsUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/cronjob/update-token-stats';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * updateTokenStats
     * @method
     * @name API#updateTokenStatsUsingGET
     */
    updateTokenStatsUsingGET(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < any > {
        return this.updateTokenStatsUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    getMailsFromUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/mails/from';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getMailsFrom
     * @method
     * @name API#getMailsFromUsingGET
     */
    getMailsFromUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/mails/from';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getMailsFrom
     * @method
     * @name API#getMailsFromUsingGET
     */
    getMailsFromUsingGET(parameters: {
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < string >
        > {
            return this.getMailsFromUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    getMailsTypesUsingGETURL(parameters: {
        'licenseType': "ACADEMIC" | "COMMERCIAL" | "RESEARCH_IN_COMMERCIAL" | "HOSPITAL",
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/mails/types';
        if (parameters['licenseType'] !== undefined) {
            queryParameters['licenseType'] = parameters['licenseType'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getMailsTypes
     * @method
     * @name API#getMailsTypesUsingGET
     * @param {string} licenseType - licenseType
     */
    getMailsTypesUsingGETWithHttpInfo(parameters: {
        'licenseType': "ACADEMIC" | "COMMERCIAL" | "RESEARCH_IN_COMMERCIAL" | "HOSPITAL",
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/mails/types';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters['licenseType'] !== undefined) {
                queryParameters['licenseType'] = parameters['licenseType'];
            }

            if (parameters['licenseType'] === undefined) {
                reject(new Error('Missing required  parameter: licenseType'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getMailsTypes
     * @method
     * @name API#getMailsTypesUsingGET
     * @param {string} licenseType - licenseType
     */
    getMailsTypesUsingGET(parameters: {
            'licenseType': "ACADEMIC" | "COMMERCIAL" | "RESEARCH_IN_COMMERCIAL" | "HOSPITAL",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < MailTypeInfo >
        > {
            return this.getMailsTypesUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    sendUserMailsUsingPOSTURL(parameters: {
        'by': string,
        'cc' ? : string,
        'from': string,
        'mailType': "ACTIVATION" | "APPROVAL" | "CREATION" | "PASSWORD_RESET" | "LICENSE_REVIEW_COMMERCIAL" | "LICENSE_REVIEW_RESEARCH_COMMERCIAL" | "LICENSE_REVIEW_HOSPITAL" | "SEND_INTAKE_FORM_COMMERCIAL" | "SEND_INTAKE_FORM_RESEARCH_COMMERCIAL" | "SEND_INTAKE_FORM_HOSPITAL" | "CLARIFY_ACADEMIC_FOR_PROFIT" | "CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL" | "VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES" | "APPROVAL_MSK_IN_COMMERCIAL" | "TRIAL_ACCOUNT_IS_ABOUT_TO_EXPIRE" | "TEST",
        'to': string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/mails/users';
        if (parameters['by'] !== undefined) {
            queryParameters['by'] = parameters['by'];
        }

        if (parameters['cc'] !== undefined) {
            queryParameters['cc'] = parameters['cc'];
        }

        if (parameters['from'] !== undefined) {
            queryParameters['from'] = parameters['from'];
        }

        if (parameters['mailType'] !== undefined) {
            queryParameters['mailType'] = parameters['mailType'];
        }

        if (parameters['to'] !== undefined) {
            queryParameters['to'] = parameters['to'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * sendUserMails
     * @method
     * @name API#sendUserMailsUsingPOST
     * @param {string} by - by
     * @param {string} cc - cc
     * @param {string} from - from
     * @param {string} mailType - mailType
     * @param {string} to - to
     */
    sendUserMailsUsingPOSTWithHttpInfo(parameters: {
        'by': string,
        'cc' ? : string,
        'from': string,
        'mailType': "ACTIVATION" | "APPROVAL" | "CREATION" | "PASSWORD_RESET" | "LICENSE_REVIEW_COMMERCIAL" | "LICENSE_REVIEW_RESEARCH_COMMERCIAL" | "LICENSE_REVIEW_HOSPITAL" | "SEND_INTAKE_FORM_COMMERCIAL" | "SEND_INTAKE_FORM_RESEARCH_COMMERCIAL" | "SEND_INTAKE_FORM_HOSPITAL" | "CLARIFY_ACADEMIC_FOR_PROFIT" | "CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL" | "VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES" | "APPROVAL_MSK_IN_COMMERCIAL" | "TRIAL_ACCOUNT_IS_ABOUT_TO_EXPIRE" | "TEST",
        'to': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/mails/users';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['by'] !== undefined) {
                queryParameters['by'] = parameters['by'];
            }

            if (parameters['by'] === undefined) {
                reject(new Error('Missing required  parameter: by'));
                return;
            }

            if (parameters['cc'] !== undefined) {
                queryParameters['cc'] = parameters['cc'];
            }

            if (parameters['from'] !== undefined) {
                queryParameters['from'] = parameters['from'];
            }

            if (parameters['from'] === undefined) {
                reject(new Error('Missing required  parameter: from'));
                return;
            }

            if (parameters['mailType'] !== undefined) {
                queryParameters['mailType'] = parameters['mailType'];
            }

            if (parameters['mailType'] === undefined) {
                reject(new Error('Missing required  parameter: mailType'));
                return;
            }

            if (parameters['to'] !== undefined) {
                queryParameters['to'] = parameters['to'];
            }

            if (parameters['to'] === undefined) {
                reject(new Error('Missing required  parameter: to'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * sendUserMails
     * @method
     * @name API#sendUserMailsUsingPOST
     * @param {string} by - by
     * @param {string} cc - cc
     * @param {string} from - from
     * @param {string} mailType - mailType
     * @param {string} to - to
     */
    sendUserMailsUsingPOST(parameters: {
        'by': string,
        'cc' ? : string,
        'from': string,
        'mailType': "ACTIVATION" | "APPROVAL" | "CREATION" | "PASSWORD_RESET" | "LICENSE_REVIEW_COMMERCIAL" | "LICENSE_REVIEW_RESEARCH_COMMERCIAL" | "LICENSE_REVIEW_HOSPITAL" | "SEND_INTAKE_FORM_COMMERCIAL" | "SEND_INTAKE_FORM_RESEARCH_COMMERCIAL" | "SEND_INTAKE_FORM_HOSPITAL" | "CLARIFY_ACADEMIC_FOR_PROFIT" | "CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL" | "VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES" | "APPROVAL_MSK_IN_COMMERCIAL" | "TRIAL_ACCOUNT_IS_ABOUT_TO_EXPIRE" | "TEST",
        'to': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < string > {
        return this.sendUserMailsUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    registerAccountUsingPOSTURL(parameters: {
        'managedUserVm': ManagedUserVM,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/register';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * registerAccount
     * @method
     * @name API#registerAccountUsingPOST
     * @param {} managedUserVm - managedUserVM
     */
    registerAccountUsingPOSTWithHttpInfo(parameters: {
        'managedUserVm': ManagedUserVM,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/register';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['managedUserVm'] !== undefined) {
                body = parameters['managedUserVm'];
            }

            if (parameters['managedUserVm'] === undefined) {
                reject(new Error('Missing required  parameter: managedUserVm'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * registerAccount
     * @method
     * @name API#registerAccountUsingPOST
     * @param {} managedUserVm - managedUserVM
     */
    registerAccountUsingPOST(parameters: {
        'managedUserVm': ManagedUserVM,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        return this.registerAccountUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    getAllTokensUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/tokens';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getAllTokens
     * @method
     * @name API#getAllTokensUsingGET
     */
    getAllTokensUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/tokens';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getAllTokens
     * @method
     * @name API#getAllTokensUsingGET
     */
    getAllTokensUsingGET(parameters: {
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < Token >
        > {
            return this.getAllTokensUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    createTokenUsingPOST_1URL(parameters: {
        'token': Token,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/tokens';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * createToken
     * @method
     * @name API#createTokenUsingPOST_1
     * @param {} token - token
     */
    createTokenUsingPOST_1WithHttpInfo(parameters: {
        'token': Token,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/tokens';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['token'] !== undefined) {
                body = parameters['token'];
            }

            if (parameters['token'] === undefined) {
                reject(new Error('Missing required  parameter: token'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * createToken
     * @method
     * @name API#createTokenUsingPOST_1
     * @param {} token - token
     */
    createTokenUsingPOST_1(parameters: {
        'token': Token,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < Token > {
        return this.createTokenUsingPOST_1WithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    updateTokenUsingPUTURL(parameters: {
        'token': Token,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/tokens';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * updateToken
     * @method
     * @name API#updateTokenUsingPUT
     * @param {} token - token
     */
    updateTokenUsingPUTWithHttpInfo(parameters: {
        'token': Token,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/tokens';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['token'] !== undefined) {
                body = parameters['token'];
            }

            if (parameters['token'] === undefined) {
                reject(new Error('Missing required  parameter: token'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * updateToken
     * @method
     * @name API#updateTokenUsingPUT
     * @param {} token - token
     */
    updateTokenUsingPUT(parameters: {
        'token': Token,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < Token > {
        return this.updateTokenUsingPUTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    getTokenUsingGETURL(parameters: {
        'id': number,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/tokens/{id}';

        path = path.replace('{id}', parameters['id'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getToken
     * @method
     * @name API#getTokenUsingGET
     * @param {integer} id - id
     */
    getTokenUsingGETWithHttpInfo(parameters: {
        'id': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/tokens/{id}';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            path = path.replace('{id}', parameters['id'] + '');

            if (parameters['id'] === undefined) {
                reject(new Error('Missing required  parameter: id'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getToken
     * @method
     * @name API#getTokenUsingGET
     * @param {integer} id - id
     */
    getTokenUsingGET(parameters: {
        'id': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < Token > {
        return this.getTokenUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    deleteTokenUsingDELETE_1URL(parameters: {
        'id': number,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/tokens/{id}';

        path = path.replace('{id}', parameters['id'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * deleteToken
     * @method
     * @name API#deleteTokenUsingDELETE_1
     * @param {integer} id - id
     */
    deleteTokenUsingDELETE_1WithHttpInfo(parameters: {
        'id': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/tokens/{id}';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            path = path.replace('{id}', parameters['id'] + '');

            if (parameters['id'] === undefined) {
                reject(new Error('Missing required  parameter: id'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * deleteToken
     * @method
     * @name API#deleteTokenUsingDELETE_1
     * @param {integer} id - id
     */
    deleteTokenUsingDELETE_1(parameters: {
        'id': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        return this.deleteTokenUsingDELETE_1WithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    getAllUserDetailsUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/user-details';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getAllUserDetails
     * @method
     * @name API#getAllUserDetailsUsingGET
     */
    getAllUserDetailsUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/user-details';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getAllUserDetails
     * @method
     * @name API#getAllUserDetailsUsingGET
     */
    getAllUserDetailsUsingGET(parameters: {
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < UserDetailsDTO >
        > {
            return this.getAllUserDetailsUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    createUserDetailsUsingPOSTURL(parameters: {
        'userDetailsDto': UserDetailsDTO,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/user-details';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * createUserDetails
     * @method
     * @name API#createUserDetailsUsingPOST
     * @param {} userDetailsDto - userDetailsDTO
     */
    createUserDetailsUsingPOSTWithHttpInfo(parameters: {
        'userDetailsDto': UserDetailsDTO,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/user-details';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['userDetailsDto'] !== undefined) {
                body = parameters['userDetailsDto'];
            }

            if (parameters['userDetailsDto'] === undefined) {
                reject(new Error('Missing required  parameter: userDetailsDto'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * createUserDetails
     * @method
     * @name API#createUserDetailsUsingPOST
     * @param {} userDetailsDto - userDetailsDTO
     */
    createUserDetailsUsingPOST(parameters: {
        'userDetailsDto': UserDetailsDTO,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < UserDetailsDTO > {
        return this.createUserDetailsUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    updateUserDetailsUsingPUTURL(parameters: {
        'userDetailsDto': UserDetailsDTO,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/user-details';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * updateUserDetails
     * @method
     * @name API#updateUserDetailsUsingPUT
     * @param {} userDetailsDto - userDetailsDTO
     */
    updateUserDetailsUsingPUTWithHttpInfo(parameters: {
        'userDetailsDto': UserDetailsDTO,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/user-details';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['userDetailsDto'] !== undefined) {
                body = parameters['userDetailsDto'];
            }

            if (parameters['userDetailsDto'] === undefined) {
                reject(new Error('Missing required  parameter: userDetailsDto'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * updateUserDetails
     * @method
     * @name API#updateUserDetailsUsingPUT
     * @param {} userDetailsDto - userDetailsDTO
     */
    updateUserDetailsUsingPUT(parameters: {
        'userDetailsDto': UserDetailsDTO,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < UserDetailsDTO > {
        return this.updateUserDetailsUsingPUTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    getUserDetailsUsingGETURL(parameters: {
        'id': number,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/user-details/{id}';

        path = path.replace('{id}', parameters['id'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getUserDetails
     * @method
     * @name API#getUserDetailsUsingGET
     * @param {integer} id - id
     */
    getUserDetailsUsingGETWithHttpInfo(parameters: {
        'id': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/user-details/{id}';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            path = path.replace('{id}', parameters['id'] + '');

            if (parameters['id'] === undefined) {
                reject(new Error('Missing required  parameter: id'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getUserDetails
     * @method
     * @name API#getUserDetailsUsingGET
     * @param {integer} id - id
     */
    getUserDetailsUsingGET(parameters: {
        'id': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < UserDetailsDTO > {
        return this.getUserDetailsUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    deleteUserDetailsUsingDELETEURL(parameters: {
        'id': number,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/user-details/{id}';

        path = path.replace('{id}', parameters['id'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * deleteUserDetails
     * @method
     * @name API#deleteUserDetailsUsingDELETE
     * @param {integer} id - id
     */
    deleteUserDetailsUsingDELETEWithHttpInfo(parameters: {
        'id': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/user-details/{id}';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            path = path.replace('{id}', parameters['id'] + '');

            if (parameters['id'] === undefined) {
                reject(new Error('Missing required  parameter: id'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * deleteUserDetails
     * @method
     * @name API#deleteUserDetailsUsingDELETE
     * @param {integer} id - id
     */
    deleteUserDetailsUsingDELETE(parameters: {
        'id': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        return this.deleteUserDetailsUsingDELETEWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    getAllUserMailsUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/user-mails';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getAllUserMails
     * @method
     * @name API#getAllUserMailsUsingGET
     */
    getAllUserMailsUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/user-mails';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getAllUserMails
     * @method
     * @name API#getAllUserMailsUsingGET
     */
    getAllUserMailsUsingGET(parameters: {
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < UserMailsDTO >
        > {
            return this.getAllUserMailsUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    getUsersUserMailsUsingGETURL(parameters: {
        'login': string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/user-mails/users/{login}';

        path = path.replace('{login}', parameters['login'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getUsersUserMails
     * @method
     * @name API#getUsersUserMailsUsingGET
     * @param {string} login - login
     */
    getUsersUserMailsUsingGETWithHttpInfo(parameters: {
        'login': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/user-mails/users/{login}';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            path = path.replace('{login}', parameters['login'] + '');

            if (parameters['login'] === undefined) {
                reject(new Error('Missing required  parameter: login'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getUsersUserMails
     * @method
     * @name API#getUsersUserMailsUsingGET
     * @param {string} login - login
     */
    getUsersUserMailsUsingGET(parameters: {
            'login': string,
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < UserMailsDTO >
        > {
            return this.getUsersUserMailsUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    deleteUserMailsUsingDELETEURL(parameters: {
        'id': number,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/user-mails/{id}';

        path = path.replace('{id}', parameters['id'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * deleteUserMails
     * @method
     * @name API#deleteUserMailsUsingDELETE
     * @param {integer} id - id
     */
    deleteUserMailsUsingDELETEWithHttpInfo(parameters: {
        'id': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/user-mails/{id}';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            path = path.replace('{id}', parameters['id'] + '');

            if (parameters['id'] === undefined) {
                reject(new Error('Missing required  parameter: id'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * deleteUserMails
     * @method
     * @name API#deleteUserMailsUsingDELETE
     * @param {integer} id - id
     */
    deleteUserMailsUsingDELETE(parameters: {
        'id': number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        return this.deleteUserMailsUsingDELETEWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    getAllUsersUsingGETURL(parameters: {
        'offset' ? : number,
        'page' ? : number,
        'pageNumber' ? : number,
        'pageSize' ? : number,
        'paged' ? : boolean,
        'size' ? : number,
        'sort' ? : Array < string > ,
            'sortSorted' ? : boolean,
            'sortUnsorted' ? : boolean,
            'unpaged' ? : boolean,
            $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/users';
        if (parameters['offset'] !== undefined) {
            queryParameters['offset'] = parameters['offset'];
        }

        if (parameters['page'] !== undefined) {
            queryParameters['page'] = parameters['page'];
        }

        if (parameters['pageNumber'] !== undefined) {
            queryParameters['pageNumber'] = parameters['pageNumber'];
        }

        if (parameters['pageSize'] !== undefined) {
            queryParameters['pageSize'] = parameters['pageSize'];
        }

        if (parameters['paged'] !== undefined) {
            queryParameters['paged'] = parameters['paged'];
        }

        if (parameters['size'] !== undefined) {
            queryParameters['size'] = parameters['size'];
        }

        if (parameters['sort'] !== undefined) {
            queryParameters['sort'] = parameters['sort'];
        }

        if (parameters['sortSorted'] !== undefined) {
            queryParameters['sort.sorted'] = parameters['sortSorted'];
        }

        if (parameters['sortUnsorted'] !== undefined) {
            queryParameters['sort.unsorted'] = parameters['sortUnsorted'];
        }

        if (parameters['unpaged'] !== undefined) {
            queryParameters['unpaged'] = parameters['unpaged'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getAllUsers
     * @method
     * @name API#getAllUsersUsingGET
     * @param {integer} offset - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} page - Page number of the requested page
     * @param {integer} pageNumber - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} pageSize - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} paged - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} size - Size of a page
     * @param {array} sort - Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @param {boolean} sortSorted - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} sortUnsorted - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} unpaged - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     */
    getAllUsersUsingGETWithHttpInfo(parameters: {
        'offset' ? : number,
        'page' ? : number,
        'pageNumber' ? : number,
        'pageSize' ? : number,
        'paged' ? : boolean,
        'size' ? : number,
        'sort' ? : Array < string > ,
            'sortSorted' ? : boolean,
            'sortUnsorted' ? : boolean,
            'unpaged' ? : boolean,
            $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/users';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters['offset'] !== undefined) {
                queryParameters['offset'] = parameters['offset'];
            }

            if (parameters['page'] !== undefined) {
                queryParameters['page'] = parameters['page'];
            }

            if (parameters['pageNumber'] !== undefined) {
                queryParameters['pageNumber'] = parameters['pageNumber'];
            }

            if (parameters['pageSize'] !== undefined) {
                queryParameters['pageSize'] = parameters['pageSize'];
            }

            if (parameters['paged'] !== undefined) {
                queryParameters['paged'] = parameters['paged'];
            }

            if (parameters['size'] !== undefined) {
                queryParameters['size'] = parameters['size'];
            }

            if (parameters['sort'] !== undefined) {
                queryParameters['sort'] = parameters['sort'];
            }

            if (parameters['sortSorted'] !== undefined) {
                queryParameters['sort.sorted'] = parameters['sortSorted'];
            }

            if (parameters['sortUnsorted'] !== undefined) {
                queryParameters['sort.unsorted'] = parameters['sortUnsorted'];
            }

            if (parameters['unpaged'] !== undefined) {
                queryParameters['unpaged'] = parameters['unpaged'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getAllUsers
     * @method
     * @name API#getAllUsersUsingGET
     * @param {integer} offset - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} page - Page number of the requested page
     * @param {integer} pageNumber - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} pageSize - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} paged - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} size - Size of a page
     * @param {array} sort - Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @param {boolean} sortSorted - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} sortUnsorted - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} unpaged - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     */
    getAllUsersUsingGET(parameters: {
            'offset' ? : number,
            'page' ? : number,
            'pageNumber' ? : number,
            'pageSize' ? : number,
            'paged' ? : boolean,
            'size' ? : number,
            'sort' ? : Array < string > ,
                'sortSorted' ? : boolean,
                'sortUnsorted' ? : boolean,
                'unpaged' ? : boolean,
                $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < UserDTO >
        > {
            return this.getAllUsersUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    createUserUsingPOSTURL(parameters: {
        'managedUserVm': ManagedUserVM,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/users';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * createUser
     * @method
     * @name API#createUserUsingPOST
     * @param {} managedUserVm - managedUserVM
     */
    createUserUsingPOSTWithHttpInfo(parameters: {
        'managedUserVm': ManagedUserVM,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/users';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['managedUserVm'] !== undefined) {
                body = parameters['managedUserVm'];
            }

            if (parameters['managedUserVm'] === undefined) {
                reject(new Error('Missing required  parameter: managedUserVm'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * createUser
     * @method
     * @name API#createUserUsingPOST
     * @param {} managedUserVm - managedUserVM
     */
    createUserUsingPOST(parameters: {
        'managedUserVm': ManagedUserVM,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < User > {
        return this.createUserUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    updateUserUsingPUTURL(parameters: {
        'sendEmail': boolean,
        'userDto': UserDTO,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/users';
        if (parameters['sendEmail'] !== undefined) {
            queryParameters['sendEmail'] = parameters['sendEmail'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * updateUser
     * @method
     * @name API#updateUserUsingPUT
     * @param {boolean} sendEmail - sendEmail
     * @param {} userDto - userDTO
     */
    updateUserUsingPUTWithHttpInfo(parameters: {
        'sendEmail': boolean,
        'userDto': UserDTO,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/users';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['sendEmail'] !== undefined) {
                queryParameters['sendEmail'] = parameters['sendEmail'];
            }

            if (parameters['sendEmail'] === undefined) {
                reject(new Error('Missing required  parameter: sendEmail'));
                return;
            }

            if (parameters['userDto'] !== undefined) {
                body = parameters['userDto'];
            }

            if (parameters['userDto'] === undefined) {
                reject(new Error('Missing required  parameter: userDto'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * updateUser
     * @method
     * @name API#updateUserUsingPUT
     * @param {boolean} sendEmail - sendEmail
     * @param {} userDto - userDTO
     */
    updateUserUsingPUT(parameters: {
        'sendEmail': boolean,
        'userDto': UserDTO,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < UserDTO > {
        return this.updateUserUsingPUTWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    getAuthoritiesUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/users/authorities';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getAuthorities
     * @method
     * @name API#getAuthoritiesUsingGET
     */
    getAuthoritiesUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/users/authorities';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getAuthorities
     * @method
     * @name API#getAuthoritiesUsingGET
     */
    getAuthoritiesUsingGET(parameters: {
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < string >
        > {
            return this.getAuthoritiesUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    getAllRegisteredUsersUsingGETURL(parameters: {
        'offset' ? : number,
        'page' ? : number,
        'pageNumber' ? : number,
        'pageSize' ? : number,
        'paged' ? : boolean,
        'size' ? : number,
        'sort' ? : Array < string > ,
            'sortSorted' ? : boolean,
            'sortUnsorted' ? : boolean,
            'unpaged' ? : boolean,
            $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/users/registered';
        if (parameters['offset'] !== undefined) {
            queryParameters['offset'] = parameters['offset'];
        }

        if (parameters['page'] !== undefined) {
            queryParameters['page'] = parameters['page'];
        }

        if (parameters['pageNumber'] !== undefined) {
            queryParameters['pageNumber'] = parameters['pageNumber'];
        }

        if (parameters['pageSize'] !== undefined) {
            queryParameters['pageSize'] = parameters['pageSize'];
        }

        if (parameters['paged'] !== undefined) {
            queryParameters['paged'] = parameters['paged'];
        }

        if (parameters['size'] !== undefined) {
            queryParameters['size'] = parameters['size'];
        }

        if (parameters['sort'] !== undefined) {
            queryParameters['sort'] = parameters['sort'];
        }

        if (parameters['sortSorted'] !== undefined) {
            queryParameters['sort.sorted'] = parameters['sortSorted'];
        }

        if (parameters['sortUnsorted'] !== undefined) {
            queryParameters['sort.unsorted'] = parameters['sortUnsorted'];
        }

        if (parameters['unpaged'] !== undefined) {
            queryParameters['unpaged'] = parameters['unpaged'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getAllRegisteredUsers
     * @method
     * @name API#getAllRegisteredUsersUsingGET
     * @param {integer} offset - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} page - Page number of the requested page
     * @param {integer} pageNumber - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} pageSize - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} paged - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} size - Size of a page
     * @param {array} sort - Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @param {boolean} sortSorted - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} sortUnsorted - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} unpaged - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     */
    getAllRegisteredUsersUsingGETWithHttpInfo(parameters: {
        'offset' ? : number,
        'page' ? : number,
        'pageNumber' ? : number,
        'pageSize' ? : number,
        'paged' ? : boolean,
        'size' ? : number,
        'sort' ? : Array < string > ,
            'sortSorted' ? : boolean,
            'sortUnsorted' ? : boolean,
            'unpaged' ? : boolean,
            $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/users/registered';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            if (parameters['offset'] !== undefined) {
                queryParameters['offset'] = parameters['offset'];
            }

            if (parameters['page'] !== undefined) {
                queryParameters['page'] = parameters['page'];
            }

            if (parameters['pageNumber'] !== undefined) {
                queryParameters['pageNumber'] = parameters['pageNumber'];
            }

            if (parameters['pageSize'] !== undefined) {
                queryParameters['pageSize'] = parameters['pageSize'];
            }

            if (parameters['paged'] !== undefined) {
                queryParameters['paged'] = parameters['paged'];
            }

            if (parameters['size'] !== undefined) {
                queryParameters['size'] = parameters['size'];
            }

            if (parameters['sort'] !== undefined) {
                queryParameters['sort'] = parameters['sort'];
            }

            if (parameters['sortSorted'] !== undefined) {
                queryParameters['sort.sorted'] = parameters['sortSorted'];
            }

            if (parameters['sortUnsorted'] !== undefined) {
                queryParameters['sort.unsorted'] = parameters['sortUnsorted'];
            }

            if (parameters['unpaged'] !== undefined) {
                queryParameters['unpaged'] = parameters['unpaged'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getAllRegisteredUsers
     * @method
     * @name API#getAllRegisteredUsersUsingGET
     * @param {integer} offset - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} page - Page number of the requested page
     * @param {integer} pageNumber - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} pageSize - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} paged - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {integer} size - Size of a page
     * @param {array} sort - Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @param {boolean} sortSorted - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} sortUnsorted - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     * @param {boolean} unpaged - OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
     */
    getAllRegisteredUsersUsingGET(parameters: {
            'offset' ? : number,
            'page' ? : number,
            'pageNumber' ? : number,
            'pageSize' ? : number,
            'paged' ? : boolean,
            'size' ? : number,
            'sort' ? : Array < string > ,
                'sortSorted' ? : boolean,
                'sortUnsorted' ? : boolean,
                'unpaged' ? : boolean,
                $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < UserDTO >
        > {
            return this.getAllRegisteredUsersUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    getUserUsingGETURL(parameters: {
        'login': string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/users/{login}';

        path = path.replace('{login}', parameters['login'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getUser
     * @method
     * @name API#getUserUsingGET
     * @param {string} login - login
     */
    getUserUsingGETWithHttpInfo(parameters: {
        'login': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/users/{login}';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            path = path.replace('{login}', parameters['login'] + '');

            if (parameters['login'] === undefined) {
                reject(new Error('Missing required  parameter: login'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getUser
     * @method
     * @name API#getUserUsingGET
     * @param {string} login - login
     */
    getUserUsingGET(parameters: {
        'login': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < UserDTO > {
        return this.getUserUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    deleteUserUsingDELETEURL(parameters: {
        'login': string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/users/{login}';

        path = path.replace('{login}', parameters['login'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * deleteUser
     * @method
     * @name API#deleteUserUsingDELETE
     * @param {string} login - login
     */
    deleteUserUsingDELETEWithHttpInfo(parameters: {
        'login': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/users/{login}';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            path = path.replace('{login}', parameters['login'] + '');

            if (parameters['login'] === undefined) {
                reject(new Error('Missing required  parameter: login'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * deleteUser
     * @method
     * @name API#deleteUserUsingDELETE
     * @param {string} login - login
     */
    deleteUserUsingDELETE(parameters: {
        'login': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        return this.deleteUserUsingDELETEWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    getUserTokensUsingGETURL(parameters: {
        'login': string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/api/users/{login}/tokens';

        path = path.replace('{login}', parameters['login'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * getUserTokens
     * @method
     * @name API#getUserTokensUsingGET
     * @param {string} login - login
     */
    getUserTokensUsingGETWithHttpInfo(parameters: {
        'login': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/api/users/{login}/tokens';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';

            path = path.replace('{login}', parameters['login'] + '');

            if (parameters['login'] === undefined) {
                reject(new Error('Missing required  parameter: login'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * getUserTokens
     * @method
     * @name API#getUserTokensUsingGET
     * @param {string} login - login
     */
    getUserTokensUsingGET(parameters: {
            'login': string,
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < Token >
        > {
            return this.getUserTokensUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
}