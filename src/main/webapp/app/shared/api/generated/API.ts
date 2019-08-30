import * as request from 'superagent';

type CallbackHandler = (err: any, res?: request.Response) => void;
export type KeyAndPasswordVM = {
  key: string;

  newPassword: string;
};
export type LoginVM = {
  password: string;

  rememberMe: boolean;

  username: string;
};
export type ManagedUserVM = {
  activated: boolean;

  authorities: Array<string>;

  createdBy: string;

  createdDate: string;

  email: string;

  firstName: string;

  id: number;

  imageUrl: string;

  jobTitle: string;

  langKey: string;

  lastModifiedBy: string;

  lastModifiedDate: string;

  lastName: string;

  login: string;

  password: string;
};
export type PasswordChangeDTO = {
  currentPassword: string;

  newPassword: string;
};
export type Token = {
  creation: string;

  expiration: string;

  id: number;

  token: string;

  user: User;
};
export type TokenStats = {
  accessIp: string;

  accessTime: string;

  id: number;

  resource: string;

  token: Token;
};
export type UUIDToken = {
  id_token: string;
};
export type User = {
  activated: boolean;

  email: string;

  firstName: string;

  id: number;

  imageUrl: string;

  langKey: string;

  lastName: string;

  login: string;

  resetDate: string;
};
export type UserDTO = {
  activated: boolean;

  authorities: Array<string>;

  createdBy: string;

  createdDate: string;

  email: string;

  firstName: string;

  id: number;

  imageUrl: string;

  jobTitle: string;

  langKey: string;

  lastModifiedBy: string;

  lastModifiedDate: string;

  lastName: string;

  login: string;
};

/**
 * oncokb API documentation
 * @class API
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export default class API {
  private domain: string = '';
  private errorHandlers: CallbackHandler[] = [];

  constructor(domain?: string) {
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

  private request(
    method: string,
    url: string,
    body: any,
    headers: any,
    queryParameters: any,
    form: any,
    reject: CallbackHandler,
    resolve: CallbackHandler,
    errorHandlers: CallbackHandler[]
  ) {
    let req = (new (request as any).Request(method, url) as request.Request).query(queryParameters);
    Object.keys(headers).forEach(key => {
      req.set(key, headers[key]);
    });

    if (body) {
      req.send(body);
    }

    if (typeof body === 'object' && !(body.constructor.name === 'Buffer')) {
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

  proxyUsingGETURL(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
  }): string {
    let queryParameters: any = {};
    let path = '/api/**';

    if (parameters['method'] !== undefined) {
      queryParameters['method'] = parameters['method'];
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingGET
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingGETWithHttpInfo(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/**';
    let body: any;
    let queryParameters: any = {};
    let headers: any = {};
    let form: any = {};
    return new Promise(function(resolve, reject) {
      headers['Accept'] = '*/*';

      if (parameters['body'] !== undefined) {
        body = parameters['body'];
      }

      if (parameters['method'] !== undefined) {
        queryParameters['method'] = parameters['method'];
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          var parameter = parameters.$queryParameters[parameterName];
          queryParameters[parameterName] = parameter;
        });
      }

      request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);
    });
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingGET
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingGET(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<string> {
    return this.proxyUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  proxyUsingHEADURL(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
  }): string {
    let queryParameters: any = {};
    let path = '/api/**';

    if (parameters['method'] !== undefined) {
      queryParameters['method'] = parameters['method'];
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingHEAD
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingHEADWithHttpInfo(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/**';
    let body: any;
    let queryParameters: any = {};
    let headers: any = {};
    let form: any = {};
    return new Promise(function(resolve, reject) {
      headers['Accept'] = '*/*';
      headers['Content-Type'] = 'application/json';

      if (parameters['body'] !== undefined) {
        body = parameters['body'];
      }

      if (parameters['method'] !== undefined) {
        queryParameters['method'] = parameters['method'];
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          var parameter = parameters.$queryParameters[parameterName];
          queryParameters[parameterName] = parameter;
        });
      }

      request('HEAD', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);
    });
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingHEAD
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingHEAD(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<string> {
    return this.proxyUsingHEADWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  proxyUsingPOSTURL(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
  }): string {
    let queryParameters: any = {};
    let path = '/api/**';

    if (parameters['method'] !== undefined) {
      queryParameters['method'] = parameters['method'];
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingPOST
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingPOSTWithHttpInfo(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/**';
    let body: any;
    let queryParameters: any = {};
    let headers: any = {};
    let form: any = {};
    return new Promise(function(resolve, reject) {
      headers['Accept'] = '*/*';
      headers['Content-Type'] = 'application/json';

      if (parameters['body'] !== undefined) {
        body = parameters['body'];
      }

      if (parameters['method'] !== undefined) {
        queryParameters['method'] = parameters['method'];
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          var parameter = parameters.$queryParameters[parameterName];
          queryParameters[parameterName] = parameter;
        });
      }

      request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);
    });
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingPOST
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingPOST(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<string> {
    return this.proxyUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  proxyUsingPUTURL(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
  }): string {
    let queryParameters: any = {};
    let path = '/api/**';

    if (parameters['method'] !== undefined) {
      queryParameters['method'] = parameters['method'];
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingPUT
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingPUTWithHttpInfo(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/**';
    let body: any;
    let queryParameters: any = {};
    let headers: any = {};
    let form: any = {};
    return new Promise(function(resolve, reject) {
      headers['Accept'] = '*/*';
      headers['Content-Type'] = 'application/json';

      if (parameters['body'] !== undefined) {
        body = parameters['body'];
      }

      if (parameters['method'] !== undefined) {
        queryParameters['method'] = parameters['method'];
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          var parameter = parameters.$queryParameters[parameterName];
          queryParameters[parameterName] = parameter;
        });
      }

      request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);
    });
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingPUT
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingPUT(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<string> {
    return this.proxyUsingPUTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  proxyUsingDELETEURL(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
  }): string {
    let queryParameters: any = {};
    let path = '/api/**';

    if (parameters['method'] !== undefined) {
      queryParameters['method'] = parameters['method'];
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingDELETE
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingDELETEWithHttpInfo(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/**';
    let body: any;
    let queryParameters: any = {};
    let headers: any = {};
    let form: any = {};
    return new Promise(function(resolve, reject) {
      headers['Accept'] = '*/*';

      if (parameters['body'] !== undefined) {
        body = parameters['body'];
      }

      if (parameters['method'] !== undefined) {
        queryParameters['method'] = parameters['method'];
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          var parameter = parameters.$queryParameters[parameterName];
          queryParameters[parameterName] = parameter;
        });
      }

      request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);
    });
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingDELETE
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingDELETE(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<string> {
    return this.proxyUsingDELETEWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  proxyUsingOPTIONSURL(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
  }): string {
    let queryParameters: any = {};
    let path = '/api/**';

    if (parameters['method'] !== undefined) {
      queryParameters['method'] = parameters['method'];
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingOPTIONS
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingOPTIONSWithHttpInfo(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/**';
    let body: any;
    let queryParameters: any = {};
    let headers: any = {};
    let form: any = {};
    return new Promise(function(resolve, reject) {
      headers['Accept'] = '*/*';
      headers['Content-Type'] = 'application/json';

      if (parameters['body'] !== undefined) {
        body = parameters['body'];
      }

      if (parameters['method'] !== undefined) {
        queryParameters['method'] = parameters['method'];
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          var parameter = parameters.$queryParameters[parameterName];
          queryParameters[parameterName] = parameter;
        });
      }

      request('OPTIONS', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);
    });
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingOPTIONS
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingOPTIONS(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<string> {
    return this.proxyUsingOPTIONSWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  proxyUsingPATCHURL(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
  }): string {
    let queryParameters: any = {};
    let path = '/api/**';

    if (parameters['method'] !== undefined) {
      queryParameters['method'] = parameters['method'];
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingPATCH
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingPATCHWithHttpInfo(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/**';
    let body: any;
    let queryParameters: any = {};
    let headers: any = {};
    let form: any = {};
    return new Promise(function(resolve, reject) {
      headers['Accept'] = '*/*';
      headers['Content-Type'] = 'application/json';

      if (parameters['body'] !== undefined) {
        body = parameters['body'];
      }

      if (parameters['method'] !== undefined) {
        queryParameters['method'] = parameters['method'];
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          var parameter = parameters.$queryParameters[parameterName];
          queryParameters[parameterName] = parameter;
        });
      }

      request('PATCH', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);
    });
  }

  /**
   * proxy
   * @method
   * @name API#proxyUsingPATCH
   * @param {} body - body
   * @param {string} method - method
   */
  proxyUsingPATCH(parameters: {
    body?: string;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'TRACE';
    $queryParameters?: any;
    $domain?: string;
  }): Promise<string> {
    return this.proxyUsingPATCHWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  getAccountUsingGETURL(parameters: { $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/account';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * getAccount
   * @method
   * @name API#getAccountUsingGET
   */
  getAccountUsingGETWithHttpInfo(parameters: { $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * getAccount
   * @method
   * @name API#getAccountUsingGET
   */
  getAccountUsingGET(parameters: { $queryParameters?: any; $domain?: string }): Promise<UserDTO> {
    return this.getAccountUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  saveAccountUsingPOSTURL(parameters: { userDto: UserDTO; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/account';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * saveAccount
   * @method
   * @name API#saveAccountUsingPOST
   * @param {} userDto - userDTO
   */
  saveAccountUsingPOSTWithHttpInfo(parameters: { userDto: UserDTO; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * saveAccount
   * @method
   * @name API#saveAccountUsingPOST
   * @param {} userDto - userDTO
   */
  saveAccountUsingPOST(parameters: { userDto: UserDTO; $queryParameters?: any; $domain?: string }): Promise<any> {
    return this.saveAccountUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  changePasswordUsingPOSTURL(parameters: { passwordChangeDto: PasswordChangeDTO; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/account/change-password';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * changePassword
   * @method
   * @name API#changePasswordUsingPOST
   * @param {} passwordChangeDto - passwordChangeDto
   */
  changePasswordUsingPOSTWithHttpInfo(parameters: {
    passwordChangeDto: PasswordChangeDTO;
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
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
  }

  /**
   * changePassword
   * @method
   * @name API#changePasswordUsingPOST
   * @param {} passwordChangeDto - passwordChangeDto
   */
  changePasswordUsingPOST(parameters: { passwordChangeDto: PasswordChangeDTO; $queryParameters?: any; $domain?: string }): Promise<any> {
    return this.changePasswordUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  finishPasswordResetUsingPOSTURL(parameters: { keyAndPassword: KeyAndPasswordVM; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/account/reset-password/finish';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * finishPasswordReset
   * @method
   * @name API#finishPasswordResetUsingPOST
   * @param {} keyAndPassword - keyAndPassword
   */
  finishPasswordResetUsingPOSTWithHttpInfo(parameters: {
    keyAndPassword: KeyAndPasswordVM;
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
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
  }

  /**
   * finishPasswordReset
   * @method
   * @name API#finishPasswordResetUsingPOST
   * @param {} keyAndPassword - keyAndPassword
   */
  finishPasswordResetUsingPOST(parameters: { keyAndPassword: KeyAndPasswordVM; $queryParameters?: any; $domain?: string }): Promise<any> {
    return this.finishPasswordResetUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  requestPasswordResetUsingPOSTURL(parameters: { mail: string; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/account/reset-password/init';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * requestPasswordReset
   * @method
   * @name API#requestPasswordResetUsingPOST
   * @param {} mail - mail
   */
  requestPasswordResetUsingPOSTWithHttpInfo(parameters: {
    mail: string;
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
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
  }

  /**
   * requestPasswordReset
   * @method
   * @name API#requestPasswordResetUsingPOST
   * @param {} mail - mail
   */
  requestPasswordResetUsingPOST(parameters: { mail: string; $queryParameters?: any; $domain?: string }): Promise<any> {
    return this.requestPasswordResetUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  activateAccountUsingGETURL(parameters: { key: string; $queryParameters?: any }): string {
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
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * activateAccount
   * @method
   * @name API#activateAccountUsingGET
   * @param {string} key - key
   */
  activateAccountUsingGETWithHttpInfo(parameters: { key: string; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * activateAccount
   * @method
   * @name API#activateAccountUsingGET
   * @param {string} key - key
   */
  activateAccountUsingGET(parameters: { key: string; $queryParameters?: any; $domain?: string }): Promise<any> {
    return this.activateAccountUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  isAuthenticatedUsingGETURL(parameters: { $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/authenticate';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * isAuthenticated
   * @method
   * @name API#isAuthenticatedUsingGET
   */
  isAuthenticatedUsingGETWithHttpInfo(parameters: { $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * isAuthenticated
   * @method
   * @name API#isAuthenticatedUsingGET
   */
  isAuthenticatedUsingGET(parameters: { $queryParameters?: any; $domain?: string }): Promise<string> {
    return this.isAuthenticatedUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  authorizeUsingPOSTURL(parameters: { loginVm: LoginVM; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/authenticate';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * authorize
   * @method
   * @name API#authorizeUsingPOST
   * @param {} loginVm - loginVM
   */
  authorizeUsingPOSTWithHttpInfo(parameters: { loginVm: LoginVM; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * authorize
   * @method
   * @name API#authorizeUsingPOST
   * @param {} loginVm - loginVM
   */
  authorizeUsingPOST(parameters: { loginVm: LoginVM; $queryParameters?: any; $domain?: string }): Promise<UUIDToken> {
    return this.authorizeUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  registerAccountUsingPOSTURL(parameters: { managedUserVm: ManagedUserVM; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/register';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * registerAccount
   * @method
   * @name API#registerAccountUsingPOST
   * @param {} managedUserVm - managedUserVM
   */
  registerAccountUsingPOSTWithHttpInfo(parameters: {
    managedUserVm: ManagedUserVM;
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
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
  }

  /**
   * registerAccount
   * @method
   * @name API#registerAccountUsingPOST
   * @param {} managedUserVm - managedUserVM
   */
  registerAccountUsingPOST(parameters: { managedUserVm: ManagedUserVM; $queryParameters?: any; $domain?: string }): Promise<any> {
    return this.registerAccountUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  getAllTokenStatsUsingGETURL(parameters: { $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/token-stats';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * getAllTokenStats
   * @method
   * @name API#getAllTokenStatsUsingGET
   */
  getAllTokenStatsUsingGETWithHttpInfo(parameters: { $queryParameters?: any; $domain?: string }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/token-stats';
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
  }

  /**
   * getAllTokenStats
   * @method
   * @name API#getAllTokenStatsUsingGET
   */
  getAllTokenStatsUsingGET(parameters: { $queryParameters?: any; $domain?: string }): Promise<Array<TokenStats>> {
    return this.getAllTokenStatsUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  createTokenStatsUsingPOSTURL(parameters: { tokenStats: TokenStats; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/token-stats';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * createTokenStats
   * @method
   * @name API#createTokenStatsUsingPOST
   * @param {} tokenStats - tokenStats
   */
  createTokenStatsUsingPOSTWithHttpInfo(parameters: {
    tokenStats: TokenStats;
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/token-stats';
    let body: any;
    let queryParameters: any = {};
    let headers: any = {};
    let form: any = {};
    return new Promise(function(resolve, reject) {
      headers['Accept'] = '*/*';
      headers['Content-Type'] = 'application/json';

      if (parameters['tokenStats'] !== undefined) {
        body = parameters['tokenStats'];
      }

      if (parameters['tokenStats'] === undefined) {
        reject(new Error('Missing required  parameter: tokenStats'));
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
  }

  /**
   * createTokenStats
   * @method
   * @name API#createTokenStatsUsingPOST
   * @param {} tokenStats - tokenStats
   */
  createTokenStatsUsingPOST(parameters: { tokenStats: TokenStats; $queryParameters?: any; $domain?: string }): Promise<TokenStats> {
    return this.createTokenStatsUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  updateTokenStatsUsingPUTURL(parameters: { tokenStats: TokenStats; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/token-stats';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * updateTokenStats
   * @method
   * @name API#updateTokenStatsUsingPUT
   * @param {} tokenStats - tokenStats
   */
  updateTokenStatsUsingPUTWithHttpInfo(parameters: {
    tokenStats: TokenStats;
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/token-stats';
    let body: any;
    let queryParameters: any = {};
    let headers: any = {};
    let form: any = {};
    return new Promise(function(resolve, reject) {
      headers['Accept'] = '*/*';
      headers['Content-Type'] = 'application/json';

      if (parameters['tokenStats'] !== undefined) {
        body = parameters['tokenStats'];
      }

      if (parameters['tokenStats'] === undefined) {
        reject(new Error('Missing required  parameter: tokenStats'));
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
  }

  /**
   * updateTokenStats
   * @method
   * @name API#updateTokenStatsUsingPUT
   * @param {} tokenStats - tokenStats
   */
  updateTokenStatsUsingPUT(parameters: { tokenStats: TokenStats; $queryParameters?: any; $domain?: string }): Promise<TokenStats> {
    return this.updateTokenStatsUsingPUTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  getTokenStatsUsingGETURL(parameters: { id: number; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/token-stats/{id}';

    path = path.replace('{id}', parameters['id'] + '');

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * getTokenStats
   * @method
   * @name API#getTokenStatsUsingGET
   * @param {integer} id - id
   */
  getTokenStatsUsingGETWithHttpInfo(parameters: { id: number; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/token-stats/{id}';
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
  }

  /**
   * getTokenStats
   * @method
   * @name API#getTokenStatsUsingGET
   * @param {integer} id - id
   */
  getTokenStatsUsingGET(parameters: { id: number; $queryParameters?: any; $domain?: string }): Promise<TokenStats> {
    return this.getTokenStatsUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  deleteTokenStatsUsingDELETEURL(parameters: { id: number; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/token-stats/{id}';

    path = path.replace('{id}', parameters['id'] + '');

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * deleteTokenStats
   * @method
   * @name API#deleteTokenStatsUsingDELETE
   * @param {integer} id - id
   */
  deleteTokenStatsUsingDELETEWithHttpInfo(parameters: { id: number; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = '/api/token-stats/{id}';
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
  }

  /**
   * deleteTokenStats
   * @method
   * @name API#deleteTokenStatsUsingDELETE
   * @param {integer} id - id
   */
  deleteTokenStatsUsingDELETE(parameters: { id: number; $queryParameters?: any; $domain?: string }): Promise<any> {
    return this.deleteTokenStatsUsingDELETEWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  getAllTokensUsingGETURL(parameters: { $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/tokens';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * getAllTokens
   * @method
   * @name API#getAllTokensUsingGET
   */
  getAllTokensUsingGETWithHttpInfo(parameters: { $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * getAllTokens
   * @method
   * @name API#getAllTokensUsingGET
   */
  getAllTokensUsingGET(parameters: { $queryParameters?: any; $domain?: string }): Promise<Array<Token>> {
    return this.getAllTokensUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  createTokenUsingPOSTURL(parameters: { token: Token; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/tokens';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * createToken
   * @method
   * @name API#createTokenUsingPOST
   * @param {} token - token
   */
  createTokenUsingPOSTWithHttpInfo(parameters: { token: Token; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * createToken
   * @method
   * @name API#createTokenUsingPOST
   * @param {} token - token
   */
  createTokenUsingPOST(parameters: { token: Token; $queryParameters?: any; $domain?: string }): Promise<Token> {
    return this.createTokenUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  updateTokenUsingPUTURL(parameters: { token: Token; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/tokens';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * updateToken
   * @method
   * @name API#updateTokenUsingPUT
   * @param {} token - token
   */
  updateTokenUsingPUTWithHttpInfo(parameters: { token: Token; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * updateToken
   * @method
   * @name API#updateTokenUsingPUT
   * @param {} token - token
   */
  updateTokenUsingPUT(parameters: { token: Token; $queryParameters?: any; $domain?: string }): Promise<Token> {
    return this.updateTokenUsingPUTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  getTokenUsingGETURL(parameters: { id: number; $queryParameters?: any }): string {
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
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * getToken
   * @method
   * @name API#getTokenUsingGET
   * @param {integer} id - id
   */
  getTokenUsingGETWithHttpInfo(parameters: { id: number; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * getToken
   * @method
   * @name API#getTokenUsingGET
   * @param {integer} id - id
   */
  getTokenUsingGET(parameters: { id: number; $queryParameters?: any; $domain?: string }): Promise<Token> {
    return this.getTokenUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  deleteTokenUsingDELETEURL(parameters: { id: number; $queryParameters?: any }): string {
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
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * deleteToken
   * @method
   * @name API#deleteTokenUsingDELETE
   * @param {integer} id - id
   */
  deleteTokenUsingDELETEWithHttpInfo(parameters: { id: number; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * deleteToken
   * @method
   * @name API#deleteTokenUsingDELETE
   * @param {integer} id - id
   */
  deleteTokenUsingDELETE(parameters: { id: number; $queryParameters?: any; $domain?: string }): Promise<any> {
    return this.deleteTokenUsingDELETEWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  getAllUsersUsingGETURL(parameters: { page?: number; size?: number; sort?: Array<string>; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/users';
    if (parameters['page'] !== undefined) {
      queryParameters['page'] = parameters['page'];
    }

    if (parameters['size'] !== undefined) {
      queryParameters['size'] = parameters['size'];
    }

    if (parameters['sort'] !== undefined) {
      queryParameters['sort'] = parameters['sort'];
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * getAllUsers
   * @method
   * @name API#getAllUsersUsingGET
   * @param {integer} page - Page number of the requested page
   * @param {integer} size - Size of a page
   * @param {array} sort - Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
   */
  getAllUsersUsingGETWithHttpInfo(parameters: {
    page?: number;
    size?: number;
    sort?: Array<string>;
    $queryParameters?: any;
    $domain?: string;
  }): Promise<request.Response> {
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

      if (parameters['page'] !== undefined) {
        queryParameters['page'] = parameters['page'];
      }

      if (parameters['size'] !== undefined) {
        queryParameters['size'] = parameters['size'];
      }

      if (parameters['sort'] !== undefined) {
        queryParameters['sort'] = parameters['sort'];
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          var parameter = parameters.$queryParameters[parameterName];
          queryParameters[parameterName] = parameter;
        });
      }

      request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);
    });
  }

  /**
   * getAllUsers
   * @method
   * @name API#getAllUsersUsingGET
   * @param {integer} page - Page number of the requested page
   * @param {integer} size - Size of a page
   * @param {array} sort - Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
   */
  getAllUsersUsingGET(parameters: {
    page?: number;
    size?: number;
    sort?: Array<string>;
    $queryParameters?: any;
    $domain?: string;
  }): Promise<Array<UserDTO>> {
    return this.getAllUsersUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  createUserUsingPOSTURL(parameters: { userDto: UserDTO; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/users';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * createUser
   * @method
   * @name API#createUserUsingPOST
   * @param {} userDto - userDTO
   */
  createUserUsingPOSTWithHttpInfo(parameters: { userDto: UserDTO; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * createUser
   * @method
   * @name API#createUserUsingPOST
   * @param {} userDto - userDTO
   */
  createUserUsingPOST(parameters: { userDto: UserDTO; $queryParameters?: any; $domain?: string }): Promise<User> {
    return this.createUserUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  updateUserUsingPUTURL(parameters: { userDto: UserDTO; $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/users';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * updateUser
   * @method
   * @name API#updateUserUsingPUT
   * @param {} userDto - userDTO
   */
  updateUserUsingPUTWithHttpInfo(parameters: { userDto: UserDTO; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * updateUser
   * @method
   * @name API#updateUserUsingPUT
   * @param {} userDto - userDTO
   */
  updateUserUsingPUT(parameters: { userDto: UserDTO; $queryParameters?: any; $domain?: string }): Promise<UserDTO> {
    return this.updateUserUsingPUTWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  getAuthoritiesUsingGETURL(parameters: { $queryParameters?: any }): string {
    let queryParameters: any = {};
    let path = '/api/users/authorities';

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        var parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    let keys = Object.keys(queryParameters);
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * getAuthorities
   * @method
   * @name API#getAuthoritiesUsingGET
   */
  getAuthoritiesUsingGETWithHttpInfo(parameters: { $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * getAuthorities
   * @method
   * @name API#getAuthoritiesUsingGET
   */
  getAuthoritiesUsingGET(parameters: { $queryParameters?: any; $domain?: string }): Promise<Array<string>> {
    return this.getAuthoritiesUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  getUserUsingGETURL(parameters: { login: string; $queryParameters?: any }): string {
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
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * getUser
   * @method
   * @name API#getUserUsingGET
   * @param {string} login - login
   */
  getUserUsingGETWithHttpInfo(parameters: { login: string; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * getUser
   * @method
   * @name API#getUserUsingGET
   * @param {string} login - login
   */
  getUserUsingGET(parameters: { login: string; $queryParameters?: any; $domain?: string }): Promise<UserDTO> {
    return this.getUserUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
  deleteUserUsingDELETEURL(parameters: { login: string; $queryParameters?: any }): string {
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
    return (
      this.domain + path + (keys.length > 0 ? '?' + keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&') : '')
    );
  }

  /**
   * deleteUser
   * @method
   * @name API#deleteUserUsingDELETE
   * @param {string} login - login
   */
  deleteUserUsingDELETEWithHttpInfo(parameters: { login: string; $queryParameters?: any; $domain?: string }): Promise<request.Response> {
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
  }

  /**
   * deleteUser
   * @method
   * @name API#deleteUserUsingDELETE
   * @param {string} login - login
   */
  deleteUserUsingDELETE(parameters: { login: string; $queryParameters?: any; $domain?: string }): Promise<any> {
    return this.deleteUserUsingDELETEWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  }
}
