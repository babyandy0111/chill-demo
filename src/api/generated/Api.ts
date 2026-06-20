/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface RequestBatchDeleteBlogPostsRequest {
  ids: number[];
}

export interface RequestBatchDeleteContactSubmissionsRequest {
  ids: number[];
}

export interface RequestBatchDeleteRolesRequest {
  ids: number[];
}

export interface RequestBatchDeleteUserRolesRequest {
  ids: number[];
}

export interface RequestBatchDeleteUsersRequest {
  ids: number[];
}

export interface RequestBatchUpdateBlogPostsItem {
  /**
   * 文章作者 @validate="required"
   * @example "string"
   */
  author?: string;
  /**
   * 文章分類 @validate="required"
   * @example "string"
   */
  category?: string;
  /**
   * 資料建立時間 @type=auto_createdtime
   * @format date-time
   * @example "2025-09-22T15:20:01Z"
   */
  created_at?: string;
  /**
   * 文章描述
   * @example "string"
   */
  description?: string;
  /**
   * 部落格文章流水號
   * @example 0
   */
  id: number;
  /**
   * 圖片 URL @validate="required,url"
   * @example "string"
   */
  image_url?: string;
  /**
   * 文章標題 @validate="required,min=5,max=255"
   * @example "string"
   */
  title?: string;
  /**
   * 資料更新時間 @type=auto_updatedtime
   * @format date-time
   * @example "2025-09-22T15:20:01Z"
   */
  updated_at?: string;
}

export interface RequestBatchUpdateBlogPostsRequest {
  items: RequestBatchUpdateBlogPostsItem[];
}

export interface RequestBatchUpdateContactSubmissionsItem {
  /**
   * 公司名稱
   * @example "string"
   */
  company?: string;
  /**
   * 資料建立時間 @type=auto_createdtime
   * @format date-time
   * @example "2025-09-22T15:20:01Z"
   */
  created_at?: string;
  /**
   * 聯絡人電子郵件 @validate="required,email"
   * @example "string"
   */
  email?: string;
  /**
   * 得知管道
   * @example "string"
   */
  how_did_you_hear?: string;
  /**
   * 聯絡表單流水號
   * @example 0
   */
  id: number;
  /**
   * 訊息內容 @validate="required,min=10,max=1000"
   * @example "string"
   */
  message?: string;
  /**
   * 聯絡人姓名 @validate="required,min=2,max=255"
   * @example "string"
   */
  name?: string;
  /**
   * 請求類型 @validate="required"
   * @example "string"
   */
  request_type?: string;
  /**
   * 預計開始時間
   * @example "string"
   */
  start_time?: string;
  /**
   * 團隊人數
   * @example "string"
   */
  team_size?: string;
  /**
   * 資料更新時間 @type=auto_updatedtime
   * @format date-time
   * @example "2025-09-22T15:20:01Z"
   */
  updated_at?: string;
}

export interface RequestBatchUpdateContactSubmissionsRequest {
  items: RequestBatchUpdateContactSubmissionsItem[];
}

export interface RequestBatchUpdateRolesItem {
  /**
   * 資料新增時間 @type=auto_createdtime
   * @format date-time
   * @example "2025-09-22T15:20:01Z"
   */
  created_at?: string;
  /**
   * 角色描述
   * @example "string"
   */
  description?: string;
  /**
   * 流水號
   * @example 0
   */
  id: number;
  /**
   * 角色名稱
   * @example "string"
   */
  name?: string;
  /**
   * 資料更新時間 @type=auto_updatedtime
   * @format date-time
   * @example "2025-09-22T15:20:01Z"
   */
  updated_at?: string;
}

export interface RequestBatchUpdateRolesRequest {
  items: RequestBatchUpdateRolesItem[];
}

export interface RequestBatchUpdateUserRolesItem {
  /**
   * 資料建立時間 @type=auto_createdtime
   * @format date-time
   * @example "2025-09-22T15:20:01Z"
   */
  created_at?: string;
  /**
   * 流水號
   * @example 0
   */
  id: number;
  /**
   * 角色流水號
   * @example 0
   */
  role_id?: number;
  /**
   * 資料更新時間 @type=auto_updatedtime
   * @format date-time
   * @example "2025-09-22T15:20:01Z"
   */
  updated_at?: string;
  /**
   * 用戶流水號
   * @example 0
   */
  user_id?: number;
}

export interface RequestBatchUpdateUserRolesRequest {
  items: RequestBatchUpdateUserRolesItem[];
}

export interface RequestBatchUpdateUsersItem {
  /**
   * 用戶帳號 (email/phone/google/github/line/etc.) @validate="required,email|e164"
   * @example "string"
   */
  account?: string;
  /**
   * 資料建立時間 @type=auto_createdtime
   * @format date-time
   * @example "2025-09-22T15:20:01Z"
   */
  created_at?: string;
  /**
   * 流水號
   * @example 0
   */
  id: number;
  /**
   * 是否啟用
   * @example false
   */
  is_active?: boolean;
  /**
   * 密碼雜湊 @type=encode @alias=password @rule=hide
   * @example "string"
   */
  password?: string;
  /**
   * 登入提供商 (email/phone/google/github/line/etc.)
   * @example "string"
   */
  provider?: string;
  /**
   * 資料更新時間 @type=auto_updatedtime
   * @format date-time
   * @example "2025-09-22T15:20:01Z"
   */
  updated_at?: string;
}

export interface RequestBatchUpdateUsersRequest {
  items: RequestBatchUpdateUsersItem[];
}

export interface RequestCreateBlogPostsRequest {
  /**
   * 文章作者 @validate="required"
   * @example "string"
   */
  author: string;
  /**
   * 文章分類 @validate="required"
   * @example "string"
   */
  category: string;
  /**
   * 文章描述
   * @example "string"
   */
  description?: string;
  /**
   * 圖片 URL @validate="required,url"
   * @example "string"
   */
  image_url: string;
  /**
   * 文章標題 @validate="required,min=5,max=255"
   * @minLength 5
   * @maxLength 255
   * @example "string"
   */
  title: string;
}

export interface RequestCreateContactSubmissionsRequest {
  /**
   * 公司名稱
   * @example "string"
   */
  company?: string;
  /**
   * 聯絡人電子郵件 @validate="required,email"
   * @example "string"
   */
  email: string;
  /**
   * 得知管道
   * @example "string"
   */
  how_did_you_hear?: string;
  /**
   * 訊息內容 @validate="required,min=10,max=1000"
   * @minLength 10
   * @maxLength 1000
   * @example "string"
   */
  message: string;
  /**
   * 聯絡人姓名 @validate="required,min=2,max=255"
   * @minLength 2
   * @maxLength 255
   * @example "string"
   */
  name: string;
  /**
   * 請求類型 @validate="required"
   * @example "string"
   */
  request_type: string;
  /**
   * 預計開始時間
   * @example "string"
   */
  start_time?: string;
  /**
   * 團隊人數
   * @example "string"
   */
  team_size?: string;
}

export interface RequestCreateRolesRequest {
  /**
   * 角色描述
   * @example "string"
   */
  description?: string;
  /**
   * 角色名稱
   * @example "string"
   */
  name: string;
}

export interface RequestCreateUserRolesRequest {
  /**
   * 角色流水號
   * @example 0
   */
  role_id: number;
  /**
   * 用戶流水號
   * @example 0
   */
  user_id: number;
}

export interface RequestCreateUsersRequest {
  /**
   * 用戶帳號 (email/phone/google/github/line/etc.) @validate="required,email|e164"
   * @example "string"
   */
  account: string;
  /**
   * 是否啟用
   * @example false
   */
  is_active?: boolean;
  /**
   * 密碼雜湊 @type=encode @alias=password @rule=hide
   * @example "string"
   */
  password: string;
  /**
   * 登入提供商 (email/phone/google/github/line/etc.)
   * @example "string"
   */
  provider: string;
}

export interface RequestForgotPasswordRequest {
  /** @example "user@example.com" */
  account: string;
}

export interface RequestGithubRequest {
  action: string;
  payload?: Record<string, any>;
}

export interface RequestLoginRequest {
  /** @example "user@example.com" */
  account: string;
  /** @example "12345" */
  password: string;
}

export interface RequestRefreshTokenRequest {
  refresh_token: string;
}

export interface RequestRegisterRequest {
  /** @example "new@example.com || +886912345678" */
  account: string;
  /**
   * @minLength 8
   * @example "password123"
   */
  password: string;
}

export interface RequestSqlPreviewRequest {
  sql: string;
}

export interface RequestUpdateBlogPostsRequest {
  /**
   * 文章作者 @validate="required"
   * @example "string"
   */
  author?: string;
  /**
   * 文章分類 @validate="required"
   * @example "string"
   */
  category?: string;
  /**
   * 文章描述
   * @example "string"
   */
  description?: string;
  /**
   * 圖片 URL @validate="required,url"
   * @example "string"
   */
  image_url?: string;
  /**
   * 文章標題 @validate="required,min=5,max=255"
   * @example "string"
   */
  title?: string;
}

export interface RequestUpdateContactSubmissionsRequest {
  /**
   * 公司名稱
   * @example "string"
   */
  company?: string;
  /**
   * 聯絡人電子郵件 @validate="required,email"
   * @example "string"
   */
  email?: string;
  /**
   * 得知管道
   * @example "string"
   */
  how_did_you_hear?: string;
  /**
   * 訊息內容 @validate="required,min=10,max=1000"
   * @example "string"
   */
  message?: string;
  /**
   * 聯絡人姓名 @validate="required,min=2,max=255"
   * @example "string"
   */
  name?: string;
  /**
   * 請求類型 @validate="required"
   * @example "string"
   */
  request_type?: string;
  /**
   * 預計開始時間
   * @example "string"
   */
  start_time?: string;
  /**
   * 團隊人數
   * @example "string"
   */
  team_size?: string;
}

export interface RequestUpdateRolesRequest {
  /**
   * 角色描述
   * @example "string"
   */
  description?: string;
  /**
   * 角色名稱
   * @example "string"
   */
  name?: string;
}

export interface RequestUpdateUserRolesRequest {
  /**
   * 角色流水號
   * @example 0
   */
  role_id?: number;
  /**
   * 用戶流水號
   * @example 0
   */
  user_id?: number;
}

export interface RequestUpdateUsersRequest {
  /**
   * 用戶帳號 (email/phone/google/github/line/etc.) @validate="required,email|e164"
   * @example "string"
   */
  account?: string;
  /**
   * 是否啟用
   * @example false
   */
  is_active?: boolean;
  /**
   * 密碼雜湊 @type=encode @alias=password @rule=hide
   * @example "string"
   */
  password?: string;
  /**
   * 登入提供商 (email/phone/google/github/line/etc.)
   * @example "string"
   */
  provider?: string;
}

export interface ResponseBlogPostsResponse {
  /**
   * 文章作者 @validate="required"
   * @example "string"
   */
  author?: string;
  /**
   * 文章分類 @validate="required"
   * @example "string"
   */
  category?: string;
  /**
   * 資料建立時間 @type=auto_createdtime
   * @format date-time
   * @example "2025-09-17T16:30:00Z"
   */
  created_at?: string;
  /**
   * 文章描述
   * @example "string"
   */
  description?: string;
  /**
   * 部落格文章流水號
   * @example 0
   */
  id?: number;
  /**
   * 圖片 URL @validate="required,url"
   * @example "string"
   */
  image_url?: string;
  /**
   * 文章標題 @validate="required,min=5,max=255"
   * @example "string"
   */
  title?: string;
  /**
   * 資料更新時間 @type=auto_updatedtime
   * @format date-time
   * @example "2025-09-17T16:30:00Z"
   */
  updated_at?: string;
}

export interface ResponseContactSubmissionsResponse {
  /**
   * 公司名稱
   * @example "string"
   */
  company?: string;
  /**
   * 資料建立時間 @type=auto_createdtime
   * @format date-time
   * @example "2025-09-17T16:30:00Z"
   */
  created_at?: string;
  /**
   * 聯絡人電子郵件 @validate="required,email"
   * @example "string"
   */
  email?: string;
  /**
   * 得知管道
   * @example "string"
   */
  how_did_you_hear?: string;
  /**
   * 聯絡表單流水號
   * @example 0
   */
  id?: number;
  /**
   * 訊息內容 @validate="required,min=10,max=1000"
   * @example "string"
   */
  message?: string;
  /**
   * 聯絡人姓名 @validate="required,min=2,max=255"
   * @example "string"
   */
  name?: string;
  /**
   * 請求類型 @validate="required"
   * @example "string"
   */
  request_type?: string;
  /**
   * 預計開始時間
   * @example "string"
   */
  start_time?: string;
  /**
   * 團隊人數
   * @example "string"
   */
  team_size?: string;
  /**
   * 資料更新時間 @type=auto_updatedtime
   * @format date-time
   * @example "2025-09-17T16:30:00Z"
   */
  updated_at?: string;
}

export interface ResponseErrResponse {
  code?: number;
  message?: string;
}

export interface ResponseLoginResponse {
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
  access_token?: string;
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
  refresh_token?: string;
}

export interface ResponsePaginatedResponseWithMeta {
  code?: number;
  data?: any;
  message?: string;
  meta?: any;
  pagination?: ResponsePagination;
}

export interface ResponsePagination {
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface ResponseRefreshTokenResponse {
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
  access_token?: string;
}

export interface ResponseRolesResponse {
  /**
   * 資料新增時間 @type=auto_createdtime
   * @format date-time
   * @example "2025-09-17T16:30:00Z"
   */
  created_at?: string;
  /**
   * 角色描述
   * @example "string"
   */
  description?: string;
  /**
   * 流水號
   * @example 0
   */
  id?: number;
  /**
   * 角色名稱
   * @example "string"
   */
  name?: string;
  /**
   * 資料更新時間 @type=auto_updatedtime
   * @format date-time
   * @example "2025-09-17T16:30:00Z"
   */
  updated_at?: string;
}

export interface ResponseStdResponse {
  code?: number;
  data?: any;
  message?: string;
}

export interface ResponseUserRolesResponse {
  /**
   * 資料建立時間 @type=auto_createdtime
   * @format date-time
   * @example "2025-09-17T16:30:00Z"
   */
  created_at?: string;
  /**
   * 流水號
   * @example 0
   */
  id?: number;
  /**
   * 角色流水號
   * @example 0
   */
  role_id?: number;
  /** Roles represents the associated roles. */
  roles?: ResponseRolesResponse;
  /**
   * 資料更新時間 @type=auto_updatedtime
   * @format date-time
   * @example "2025-09-17T16:30:00Z"
   */
  updated_at?: string;
  /**
   * 用戶流水號
   * @example 0
   */
  user_id?: number;
  /** Users represents the associated users. */
  users?: ResponseUsersResponse;
}

export interface ResponseUsersResponse {
  /**
   * 用戶帳號 (email/phone/google/github/line/etc.) @validate="required,email|e164"
   * @example "string"
   */
  account?: string;
  /**
   * 資料建立時間 @type=auto_createdtime
   * @format date-time
   * @example "2025-09-17T16:30:00Z"
   */
  created_at?: string;
  /**
   * 流水號
   * @example 0
   */
  id?: number;
  /**
   * 是否啟用
   * @example false
   */
  is_active?: boolean;
  /**
   * 登入提供商 (email/phone/google/github/line/etc.)
   * @example "string"
   */
  provider?: string;
  /**
   * 資料更新時間 @type=auto_updatedtime
   * @format date-time
   * @example "2025-09-17T16:30:00Z"
   */
  updated_at?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance
      .request({
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type ? { "Content-Type": type } : {}),
        },
        params: query,
        responseType: responseFormat,
        data: body,
        url: path,
      })
      .then((response) => response.data);
  };
}

/**
 * @title scaffold API
 * @version 1.0
 * @license CGA (https://www.codegenapps.com)
 * @termsOfService https://codegenapps.com
 * @contact API Support <service@codegenapps.com> (https://codegenapps.com)
 *
 * This is the API documentation for the scaffold service.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Initiates the password reset process by generating a new temporary password and sending it to the user's email or phone.
   *
   * @tags auth
   * @name PostAuthForgotPassword
   * @summary Initiate Password Reset
   * @request POST:/auth/forgot-password
   */
  postAuthForgotPassword = (
    request: RequestForgotPasswordRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseStdResponse, ResponseErrResponse>({
      path: `/auth/forgot-password`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Logs in a user and returns both an access and a refresh JWT token. **Requires API Key in `X-API-KEY` header.**
   *
   * @tags auth
   * @name PostAuthLogin
   * @summary User Login
   * @request POST:/auth/login
   */
  postAuthLogin = (request: RequestLoginRequest, params: RequestParams = {}) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseLoginResponse;
      },
      ResponseErrResponse
    >({
      path: `/auth/login`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Logs out a user by clearing the access token cookie.
   *
   * @tags auth
   * @name PostAuthLogout
   * @summary User Logout
   * @request POST:/auth/logout
   */
  postAuthLogout = (params: RequestParams = {}) =>
    this.request<ResponseStdResponse, any>({
      path: `/auth/logout`,
      method: "POST",
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Provides a new access token using a valid refresh token.
   *
   * @tags auth
   * @name PostAuthRefresh
   * @summary Refresh Access Token
   * @request POST:/auth/refresh
   */
  postAuthRefresh = (
    request: RequestRefreshTokenRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseRefreshTokenResponse;
      },
      ResponseErrResponse
    >({
      path: `/auth/refresh`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Registers a new user account. **Requires API Key in `X-API-KEY` header.**
   *
   * @tags auth
   * @name PostAuthRegister
   * @summary User Registration
   * @request POST:/auth/register
   */
  postAuthRegister = (
    request: RequestRegisterRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUsersResponse;
      },
      ResponseErrResponse
    >({
      path: `/auth/register`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Processes the callback from the OAuth provider, logs in/registers the user, and redirects back to the frontend with tokens.
   *
   * @tags auth
   * @name GetAuthProviderCallback
   * @summary OAuth Callback
   * @request GET:/auth/{provider}/callback
   */
  getAuthProviderCallback = (provider: string, params: RequestParams = {}) =>
    this.request<any, void | ResponseErrResponse>({
      path: `/auth/${provider}/callback`,
      method: "GET",
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Redirects the user to the OAuth provider's login page.
   *
   * @tags auth
   * @name GetAuthProviderLogin
   * @summary Initiate OAuth Login
   * @request GET:/auth/{provider}/login
   */
  getAuthProviderLogin = (provider: string, params: RequestParams = {}) =>
    this.request<any, void | ResponseErrResponse>({
      path: `/auth/${provider}/login`,
      method: "GET",
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description **Validation Rules:** **Validation Rules:** `image_url`:  required,url **Validation Rules:** `category`:  required **Validation Rules:** `title`:  required,min=5,max=255 **Validation Rules:** `author`:  required **Validation Rules:** `created_at`: **Validation Rules:** `updated_at`: **Validation Rules:** `description`:
   *
   * @tags blog_posts
   * @name PostBlogPosts
   * @summary Create a new blog_posts
   * @request POST:/blog_posts
   * @secure
   */
  postBlogPosts = (
    request: RequestCreateBlogPostsRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseBlogPostsResponse;
      },
      ResponseErrResponse
    >({
      path: `/blog_posts`,
      method: "POST",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Replaces multiple blog_posts resources with new data. **Required Fields (for each item in the array):** * `id` (The ID of the item to update) * `id`  option * `image_url`  require * `category`  require * `title`  require * `author`  require * `created_at`  require * `updated_at`  require * `description`  require
   *
   * @tags blog_posts
   * @name PutBlogPostsBatch
   * @summary Batch update existing blog_posts (PUT)
   * @request PUT:/blog_posts/batch
   * @secure
   */
  putBlogPostsBatch = (
    request: RequestBatchUpdateBlogPostsRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseStdResponse, ResponseErrResponse>({
      path: `/blog_posts/batch`,
      method: "PUT",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Adds multiple new blog_posts resources to the database.
   *
   * @tags blog_posts
   * @name PostBlogPostsBatch
   * @summary Batch create new blog_posts
   * @request POST:/blog_posts/batch
   * @secure
   */
  postBlogPostsBatch = (
    request: RequestCreateBlogPostsRequest[],
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseBlogPostsResponse[];
      },
      ResponseErrResponse
    >({
      path: `/blog_posts/batch`,
      method: "POST",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Removes multiple blog_posts resources from the database. The `ids` field is a required array of IDs to be deleted.
   *
   * @tags blog_posts
   * @name DeleteBlogPostsBatch
   * @summary Batch delete blog_posts
   * @request DELETE:/blog_posts/batch
   * @secure
   */
  deleteBlogPostsBatch = (
    request: RequestBatchDeleteBlogPostsRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, ResponseErrResponse>({
      path: `/blog_posts/batch`,
      method: "DELETE",
      body: request,
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 部落格文章表 @public_methods=["GET"] **Required Fields:** * `id`  option * `image_url`  require * `category`  require * `title`  require * `author`  require * `created_at`  require * `updated_at`  option * `description`  option
   *
   * @tags blog_posts
   * @name PutBlogPostsId
   * @summary Update an existing blog_posts (PUT)
   * @request PUT:/blog_posts/{id}
   * @secure
   */
  putBlogPostsId = (
    id: number,
    request: RequestUpdateBlogPostsRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseBlogPostsResponse;
      },
      ResponseErrResponse
    >({
      path: `/blog_posts/${id}`,
      method: "PUT",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 部落格文章表 @public_methods=["GET"]
   *
   * @tags blog_posts
   * @name DeleteBlogPostsId
   * @summary Delete a blog_posts
   * @request DELETE:/blog_posts/{id}
   * @secure
   */
  deleteBlogPostsId = (id: number, params: RequestParams = {}) =>
    this.request<void, ResponseErrResponse>({
      path: `/blog_posts/${id}`,
      method: "DELETE",
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 部落格文章表 @public_methods=["GET"]
   *
   * @tags blog_posts
   * @name PatchBlogPostsId
   * @summary Partially update an existing blog_posts (PATCH)
   * @request PATCH:/blog_posts/{id}
   * @secure
   */
  patchBlogPostsId = (
    id: number,
    fields: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseBlogPostsResponse;
      },
      ResponseErrResponse
    >({
      path: `/blog_posts/${id}`,
      method: "PATCH",
      body: fields,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 聯絡我們表 @public_methods=["POST"] **進階過濾 (Advanced Filtering):** 此端點支援 `filter=[欄位],[運算子],[值]` 的格式進行過濾。 * **AND 結合**: 若需多個條件同時成立，可重複使用 `filter` 參數 (例如 `?filter=A,eq,v1&filter=B,eq,v2`)。 * **OR 結合**: 在同一個 `filter` 參數內使用 `|` 分隔多個條件 (例如 `?filter=A,eq,v1|B,eq,v2`)。// @Description * **可用的 `filter` 欄位**: `id, name, email, company, team_size, request_type, start_time, how_did_you_hear, message, created_at, updated_at` **聚合查詢 (Meta Aggregation):** 使用 `meta=[函式]([欄位])` 來獲取關於整個結果集的統計數據。可用的函式有 `count`, `sum`, `avg`, `max`, `min`。 * **可用的 `meta` 欄位**: (通常為數字類型欄位) **分組查詢 (Grouping):** 使用 `groupBy=[欄位],[欄位]` 來對結果進行分組。分組查詢的回應結構將只包含分組欄位和 `meta` 中要求的聚合欄位。 **可用運算子:** * `eq`: 等於 (Equal) * `neq`: 不等於 (Not Equal) * `gt`: 大於 (Greater Than) * `gte`: 大於或等於 (Greater Than or Equal To) * `lt`: 小於 (Less Than) * `lte`: 小於或等於 (Less Than or Equal To) * `like`: 模糊查詢 (Substring search) * `in`: 包含於 (值為逗號分隔的列表, e.g., `1,2,3`) **預設過濾條件 (Default Filters):** **查詢範例:** `?filter=name,like,value`
   *
   * @tags contact_submissions
   * @name GetContactSubmissions
   * @summary List contact_submissions
   * @request GET:/contact_submissions
   * @secure
   */
  getContactSubmissions = (
    query?: {
      /** Page number */
      page?: number;
      /** Number of items per page */
      pageSize?: number;
      /** 欄位: `id, name, email, company, team_size, request_type, start_time, how_did_you_hear, message, created_at, updated_at` */
      filter?: string;
      /** Sort order (e.g., updated_at_asc). 可用的 `sort` 欄位: `id, name, email, company, team_size, request_type, start_time, how_did_you_hear, message, created_at, updated_at` */
      sort?: string;
      /** Aggregation queries (e.g., count(id),sum(price)) */
      meta?: string;
      /** Fields to group by (e.g., status,user_id) */
      groupBy?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      ResponsePaginatedResponseWithMeta & {
        data?: ResponseContactSubmissionsResponse[];
      },
      ResponseErrResponse
    >({
      path: `/contact_submissions`,
      method: "GET",
      query: query,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Replaces multiple contact_submissions resources with new data. **Required Fields (for each item in the array):** * `id` (The ID of the item to update) * `id`  option * `name`  require * `email`  require * `company`  require * `team_size`  require * `request_type`  require * `start_time`  require * `how_did_you_hear`  require * `message`  require * `created_at`  require * `updated_at`  require
   *
   * @tags contact_submissions
   * @name PutContactSubmissionsBatch
   * @summary Batch update existing contact_submissions (PUT)
   * @request PUT:/contact_submissions/batch
   * @secure
   */
  putContactSubmissionsBatch = (
    request: RequestBatchUpdateContactSubmissionsRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseStdResponse, ResponseErrResponse>({
      path: `/contact_submissions/batch`,
      method: "PUT",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Removes multiple contact_submissions resources from the database. The `ids` field is a required array of IDs to be deleted.
   *
   * @tags contact_submissions
   * @name DeleteContactSubmissionsBatch
   * @summary Batch delete contact_submissions
   * @request DELETE:/contact_submissions/batch
   * @secure
   */
  deleteContactSubmissionsBatch = (
    request: RequestBatchDeleteContactSubmissionsRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, ResponseErrResponse>({
      path: `/contact_submissions/batch`,
      method: "DELETE",
      body: request,
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 聯絡我們表 @public_methods=["POST"]
   *
   * @tags contact_submissions
   * @name GetContactSubmissionsId
   * @summary Get a contact_submissions by ID
   * @request GET:/contact_submissions/{id}
   * @secure
   */
  getContactSubmissionsId = (id: number, params: RequestParams = {}) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseContactSubmissionsResponse;
      },
      ResponseErrResponse
    >({
      path: `/contact_submissions/${id}`,
      method: "GET",
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 聯絡我們表 @public_methods=["POST"] **Required Fields:** * `id`  option * `name`  require * `email`  require * `company`  option * `team_size`  option * `request_type`  require * `start_time`  option * `how_did_you_hear`  option * `message`  require * `created_at`  require * `updated_at`  option
   *
   * @tags contact_submissions
   * @name PutContactSubmissionsId
   * @summary Update an existing contact_submissions (PUT)
   * @request PUT:/contact_submissions/{id}
   * @secure
   */
  putContactSubmissionsId = (
    id: number,
    request: RequestUpdateContactSubmissionsRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseContactSubmissionsResponse;
      },
      ResponseErrResponse
    >({
      path: `/contact_submissions/${id}`,
      method: "PUT",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 聯絡我們表 @public_methods=["POST"]
   *
   * @tags contact_submissions
   * @name DeleteContactSubmissionsId
   * @summary Delete a contact_submissions
   * @request DELETE:/contact_submissions/{id}
   * @secure
   */
  deleteContactSubmissionsId = (id: number, params: RequestParams = {}) =>
    this.request<void, ResponseErrResponse>({
      path: `/contact_submissions/${id}`,
      method: "DELETE",
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 聯絡我們表 @public_methods=["POST"]
   *
   * @tags contact_submissions
   * @name PatchContactSubmissionsId
   * @summary Partially update an existing contact_submissions (PATCH)
   * @request PATCH:/contact_submissions/{id}
   * @secure
   */
  patchContactSubmissionsId = (
    id: number,
    fields: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseContactSubmissionsResponse;
      },
      ResponseErrResponse
    >({
      path: `/contact_submissions/${id}`,
      method: "PATCH",
      body: fields,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Interacts with GitHub via configured intermediary API. - action: The action to perform (e.g., 'create_issue'). - payload: The dynamic payload for the specific action.
   *
   * @tags ThirdParty
   * @name PostGithub
   * @summary Send GitHub Request
   * @request POST:/github
   * @secure
   */
  postGithub = (request: RequestGithubRequest, params: RequestParams = {}) =>
    this.request<
      ResponseStdResponse & {
        data?: object;
      },
      ResponseErrResponse
    >({
      path: `/github`,
      method: "POST",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 部落格文章表 @public_methods=["GET"] **進階過濾 (Advanced Filtering):** 此端點支援 `filter=[欄位],[運算子],[值]` 的格式進行過濾。 * **AND 結合**: 若需多個條件同時成立，可重複使用 `filter` 參數 (例如 `?filter=A,eq,v1&filter=B,eq,v2`)。 * **OR 結合**: 在同一個 `filter` 參數內使用 `|` 分隔多個條件 (例如 `?filter=A,eq,v1|B,eq,v2`)。// @Description * **可用的 `filter` 欄位**: `id, image_url, category, title, author, created_at, updated_at, description` **聚合查詢 (Meta Aggregation):** 使用 `meta=[函式]([欄位])` 來獲取關於整個結果集的統計數據。可用的函式有 `count`, `sum`, `avg`, `max`, `min`。 * **可用的 `meta` 欄位**: (通常為數字類型欄位) **分組查詢 (Grouping):** 使用 `groupBy=[欄位],[欄位]` 來對結果進行分組。分組查詢的回應結構將只包含分組欄位和 `meta` 中要求的聚合欄位。 **可用運算子:** * `eq`: 等於 (Equal) * `neq`: 不等於 (Not Equal) * `gt`: 大於 (Greater Than) * `gte`: 大於或等於 (Greater Than or Equal To) * `lt`: 小於 (Less Than) * `lte`: 小於或等於 (Less Than or Equal To) * `like`: 模糊查詢 (Substring search) * `in`: 包含於 (值為逗號分隔的列表, e.g., `1,2,3`) **預設過濾條件 (Default Filters):** **查詢範例:** `?filter=image_url,like,value`
   *
   * @tags blog_posts
   * @name GetPublicBlogPosts
   * @summary List blog_posts
   * @request GET:/public/blog_posts
   */
  getPublicBlogPosts = (
    query?: {
      /** Page number */
      page?: number;
      /** Number of items per page */
      pageSize?: number;
      /** 欄位: `id, image_url, category, title, author, created_at, updated_at, description` */
      filter?: string;
      /** Sort order (e.g., description_asc). 可用的 `sort` 欄位: `id, image_url, category, title, author, created_at, updated_at, description` */
      sort?: string;
      /** Aggregation queries (e.g., count(id),sum(price)) */
      meta?: string;
      /** Fields to group by (e.g., status,user_id) */
      groupBy?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      ResponsePaginatedResponseWithMeta & {
        data?: ResponseBlogPostsResponse[];
      },
      ResponseErrResponse
    >({
      path: `/public/blog_posts`,
      method: "GET",
      query: query,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 部落格文章表 @public_methods=["GET"]
   *
   * @tags blog_posts
   * @name GetPublicBlogPostsId
   * @summary Get a blog_posts by ID
   * @request GET:/public/blog_posts/{id}
   */
  getPublicBlogPostsId = (id: number, params: RequestParams = {}) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseBlogPostsResponse;
      },
      ResponseErrResponse
    >({
      path: `/public/blog_posts/${id}`,
      method: "GET",
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description **Validation Rules:** **Validation Rules:** `name`:  required,min=2,max=255 **Validation Rules:** `email`:  required,email **Validation Rules:** `company`: **Validation Rules:** `team_size`: **Validation Rules:** `request_type`:  required **Validation Rules:** `start_time`: **Validation Rules:** `how_did_you_hear`: **Validation Rules:** `message`:  required,min=10,max=1000 **Validation Rules:** `created_at`: **Validation Rules:** `updated_at`:
   *
   * @tags contact_submissions
   * @name PostPublicContactSubmissions
   * @summary Create a new contact_submissions
   * @request POST:/public/contact_submissions
   */
  postPublicContactSubmissions = (
    request: RequestCreateContactSubmissionsRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseContactSubmissionsResponse;
      },
      ResponseErrResponse
    >({
      path: `/public/contact_submissions`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Adds multiple new contact_submissions resources to the database.
   *
   * @tags contact_submissions
   * @name PostPublicContactSubmissionsBatch
   * @summary Batch create new contact_submissions
   * @request POST:/public/contact_submissions/batch
   */
  postPublicContactSubmissionsBatch = (
    request: RequestCreateContactSubmissionsRequest[],
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseContactSubmissionsResponse[];
      },
      ResponseErrResponse
    >({
      path: `/public/contact_submissions/batch`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 角色定義表 **進階過濾 (Advanced Filtering):** 此端點支援 `filter=[欄位],[運算子],[值]` 的格式進行過濾。 * **AND 結合**: 若需多個條件同時成立，可重複使用 `filter` 參數 (例如 `?filter=A,eq,v1&filter=B,eq,v2`)。 * **OR 結合**: 在同一個 `filter` 參數內使用 `|` 分隔多個條件 (例如 `?filter=A,eq,v1|B,eq,v2`)。// @Description * **可用的 `filter` 欄位**: `id, name, description, created_at, updated_at` **聚合查詢 (Meta Aggregation):** 使用 `meta=[函式]([欄位])` 來獲取關於整個結果集的統計數據。可用的函式有 `count`, `sum`, `avg`, `max`, `min`。 * **可用的 `meta` 欄位**: (通常為數字類型欄位) **分組查詢 (Grouping):** 使用 `groupBy=[欄位],[欄位]` 來對結果進行分組。分組查詢的回應結構將只包含分組欄位和 `meta` 中要求的聚合欄位。 **可用運算子:** * `eq`: 等於 (Equal) * `neq`: 不等於 (Not Equal) * `gt`: 大於 (Greater Than) * `gte`: 大於或等於 (Greater Than or Equal To) * `lt`: 小於 (Less Than) * `lte`: 小於或等於 (Less Than or Equal To) * `like`: 模糊查詢 (Substring search) * `in`: 包含於 (值為逗號分隔的列表, e.g., `1,2,3`) **預設過濾條件 (Default Filters):** **查詢範例:** `?filter=name,like,value`
   *
   * @tags roles
   * @name GetRoles
   * @summary List roles
   * @request GET:/roles
   * @secure
   */
  getRoles = (
    query?: {
      /** Page number */
      page?: number;
      /** Number of items per page */
      pageSize?: number;
      /** 欄位: `id, name, description, created_at, updated_at` */
      filter?: string;
      /** Sort order (e.g., updated_at_asc). 可用的 `sort` 欄位: `id, name, description, created_at, updated_at` */
      sort?: string;
      /** Aggregation queries (e.g., count(id),sum(price)) */
      meta?: string;
      /** Fields to group by (e.g., status,user_id) */
      groupBy?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      ResponsePaginatedResponseWithMeta & {
        data?: ResponseRolesResponse[];
      },
      ResponseErrResponse
    >({
      path: `/roles`,
      method: "GET",
      query: query,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description **Validation Rules:** **Validation Rules:** `name`: **Validation Rules:** `description`: **Validation Rules:** `created_at`: **Validation Rules:** `updated_at`:
   *
   * @tags roles
   * @name PostRoles
   * @summary Create a new roles
   * @request POST:/roles
   * @secure
   */
  postRoles = (
    request: RequestCreateRolesRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseRolesResponse;
      },
      ResponseErrResponse
    >({
      path: `/roles`,
      method: "POST",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Replaces multiple roles resources with new data. **Required Fields (for each item in the array):** * `id` (The ID of the item to update) * `id`  option * `name`  require * `description`  require * `created_at`  require * `updated_at`  require
   *
   * @tags roles
   * @name PutRolesBatch
   * @summary Batch update existing roles (PUT)
   * @request PUT:/roles/batch
   * @secure
   */
  putRolesBatch = (
    request: RequestBatchUpdateRolesRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseStdResponse, ResponseErrResponse>({
      path: `/roles/batch`,
      method: "PUT",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Adds multiple new roles resources to the database.
   *
   * @tags roles
   * @name PostRolesBatch
   * @summary Batch create new roles
   * @request POST:/roles/batch
   * @secure
   */
  postRolesBatch = (
    request: RequestCreateRolesRequest[],
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseRolesResponse[];
      },
      ResponseErrResponse
    >({
      path: `/roles/batch`,
      method: "POST",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Removes multiple roles resources from the database. The `ids` field is a required array of IDs to be deleted.
   *
   * @tags roles
   * @name DeleteRolesBatch
   * @summary Batch delete roles
   * @request DELETE:/roles/batch
   * @secure
   */
  deleteRolesBatch = (
    request: RequestBatchDeleteRolesRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, ResponseErrResponse>({
      path: `/roles/batch`,
      method: "DELETE",
      body: request,
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieves a single roles resource based on its unique name.
   *
   * @tags roles
   * @name GetRolesByNameName
   * @summary Get a roles by name
   * @request GET:/roles/by_name/{name}
   * @secure
   */
  getRolesByNameName = (name: string, params: RequestParams = {}) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseRolesResponse[];
      },
      ResponseErrResponse
    >({
      path: `/roles/by_name/${name}`,
      method: "GET",
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 角色定義表
   *
   * @tags roles
   * @name GetRolesId
   * @summary Get a roles by ID
   * @request GET:/roles/{id}
   * @secure
   */
  getRolesId = (id: number, params: RequestParams = {}) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseRolesResponse;
      },
      ResponseErrResponse
    >({
      path: `/roles/${id}`,
      method: "GET",
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 角色定義表 **Required Fields:** * `id`  option * `name`  require * `description`  option * `created_at`  require * `updated_at`  option
   *
   * @tags roles
   * @name PutRolesId
   * @summary Update an existing roles (PUT)
   * @request PUT:/roles/{id}
   * @secure
   */
  putRolesId = (
    id: number,
    request: RequestUpdateRolesRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseRolesResponse;
      },
      ResponseErrResponse
    >({
      path: `/roles/${id}`,
      method: "PUT",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 角色定義表
   *
   * @tags roles
   * @name DeleteRolesId
   * @summary Delete a roles
   * @request DELETE:/roles/{id}
   * @secure
   */
  deleteRolesId = (id: number, params: RequestParams = {}) =>
    this.request<void, ResponseErrResponse>({
      path: `/roles/${id}`,
      method: "DELETE",
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 角色定義表
   *
   * @tags roles
   * @name PatchRolesId
   * @summary Partially update an existing roles (PATCH)
   * @request PATCH:/roles/{id}
   * @secure
   */
  patchRolesId = (
    id: number,
    fields: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseRolesResponse;
      },
      ResponseErrResponse
    >({
      path: `/roles/${id}`,
      method: "PATCH",
      body: fields,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 執行唯讀的 SQL SELECT 查詢，並回傳結果。此 API 僅限管理者使用。強制 LIMIT 20，禁止使用 '*' 和 ';'.
   *
   * @tags System
   * @name PostSystemSqlPreview
   * @summary [Admin] 預覽 SQL 查詢結果
   * @request POST:/system/sql/preview
   * @secure
   */
  postSystemSqlPreview = (
    request: RequestSqlPreviewRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: Record<string, any>[];
      },
      ResponseErrResponse
    >({
      path: `/system/sql/preview`,
      method: "POST",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 使用者與角色的關聯表 **進階過濾 (Advanced Filtering):** 此端點支援 `filter=[欄位],[運算子],[值]` 的格式進行過濾。 * **AND 結合**: 若需多個條件同時成立，可重複使用 `filter` 參數 (例如 `?filter=A,eq,v1&filter=B,eq,v2`)。 * **OR 結合**: 在同一個 `filter` 參數內使用 `|` 分隔多個條件 (例如 `?filter=A,eq,v1|B,eq,v2`)。// @Description * **可用的 `filter` 欄位**: `id, user_id, role_id, created_at, updated_at` **聚合查詢 (Meta Aggregation):** 使用 `meta=[函式]([欄位])` 來獲取關於整個結果集的統計數據。可用的函式有 `count`, `sum`, `avg`, `max`, `min`。 * **可用的 `meta` 欄位**: (通常為數字類型欄位) **分組查詢 (Grouping):** 使用 `groupBy=[欄位],[欄位]` 來對結果進行分組。分組查詢的回應結構將只包含分組欄位和 `meta` 中要求的聚合欄位。 **可用運算子:** * `eq`: 等於 (Equal) * `neq`: 不等於 (Not Equal) * `gt`: 大於 (Greater Than) * `gte`: 大於或等於 (Greater Than or Equal To) * `lt`: 小於 (Less Than) * `lte`: 小於或等於 (Less Than or Equal To) * `like`: 模糊查詢 (Substring search) * `in`: 包含於 (值為逗號分隔的列表, e.g., `1,2,3`) **預設過濾條件 (Default Filters):** **查詢範例:** `?filter=user_id,gte,10`
   *
   * @tags user_roles
   * @name GetUserRoles
   * @summary List user_roles
   * @request GET:/user_roles
   * @secure
   */
  getUserRoles = (
    query?: {
      /** Page number */
      page?: number;
      /** Number of items per page */
      pageSize?: number;
      /** 欄位: `id, user_id, role_id, created_at, updated_at` */
      filter?: string;
      /** Sort order (e.g., updated_at_asc). 可用的 `sort` 欄位: `id, user_id, role_id, created_at, updated_at` */
      sort?: string;
      /** Aggregation queries (e.g., count(id),sum(price)) */
      meta?: string;
      /** Fields to group by (e.g., status,user_id) */
      groupBy?: string;
      /** Relations to expand (e.g., users, roles) */
      expand?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      ResponsePaginatedResponseWithMeta & {
        data?: ResponseUserRolesResponse[];
      },
      ResponseErrResponse
    >({
      path: `/user_roles`,
      method: "GET",
      query: query,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description **Validation Rules:** **Validation Rules:** `user_id`: **Validation Rules:** `role_id`: **Validation Rules:** `created_at`: **Validation Rules:** `updated_at`:
   *
   * @tags user_roles
   * @name PostUserRoles
   * @summary Create a new user_roles
   * @request POST:/user_roles
   * @secure
   */
  postUserRoles = (
    request: RequestCreateUserRolesRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUserRolesResponse;
      },
      ResponseErrResponse
    >({
      path: `/user_roles`,
      method: "POST",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Replaces multiple user_roles resources with new data. **Required Fields (for each item in the array):** * `id` (The ID of the item to update) * `id`  option * `user_id`  require * `role_id`  require * `created_at`  require * `updated_at`  require
   *
   * @tags user_roles
   * @name PutUserRolesBatch
   * @summary Batch update existing user_roles (PUT)
   * @request PUT:/user_roles/batch
   * @secure
   */
  putUserRolesBatch = (
    request: RequestBatchUpdateUserRolesRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseStdResponse, ResponseErrResponse>({
      path: `/user_roles/batch`,
      method: "PUT",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Adds multiple new user_roles resources to the database.
   *
   * @tags user_roles
   * @name PostUserRolesBatch
   * @summary Batch create new user_roles
   * @request POST:/user_roles/batch
   * @secure
   */
  postUserRolesBatch = (
    request: RequestCreateUserRolesRequest[],
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUserRolesResponse[];
      },
      ResponseErrResponse
    >({
      path: `/user_roles/batch`,
      method: "POST",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Removes multiple user_roles resources from the database. The `ids` field is a required array of IDs to be deleted.
   *
   * @tags user_roles
   * @name DeleteUserRolesBatch
   * @summary Batch delete user_roles
   * @request DELETE:/user_roles/batch
   * @secure
   */
  deleteUserRolesBatch = (
    request: RequestBatchDeleteUserRolesRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, ResponseErrResponse>({
      path: `/user_roles/batch`,
      method: "DELETE",
      body: request,
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 使用者與角色的關聯表
   *
   * @tags user_roles
   * @name GetUserRolesId
   * @summary Get a user_roles by ID
   * @request GET:/user_roles/{id}
   * @secure
   */
  getUserRolesId = (
    id: number,
    query?: {
      /** Relations to expand (e.g., users, roles) */
      expand?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUserRolesResponse;
      },
      ResponseErrResponse
    >({
      path: `/user_roles/${id}`,
      method: "GET",
      query: query,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 使用者與角色的關聯表 **Required Fields:** * `id`  option * `user_id`  require * `role_id`  require * `created_at`  require * `updated_at`  option
   *
   * @tags user_roles
   * @name PutUserRolesId
   * @summary Update an existing user_roles (PUT)
   * @request PUT:/user_roles/{id}
   * @secure
   */
  putUserRolesId = (
    id: number,
    request: RequestUpdateUserRolesRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUserRolesResponse;
      },
      ResponseErrResponse
    >({
      path: `/user_roles/${id}`,
      method: "PUT",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 使用者與角色的關聯表
   *
   * @tags user_roles
   * @name DeleteUserRolesId
   * @summary Delete a user_roles
   * @request DELETE:/user_roles/{id}
   * @secure
   */
  deleteUserRolesId = (id: number, params: RequestParams = {}) =>
    this.request<void, ResponseErrResponse>({
      path: `/user_roles/${id}`,
      method: "DELETE",
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 使用者與角色的關聯表
   *
   * @tags user_roles
   * @name PatchUserRolesId
   * @summary Partially update an existing user_roles (PATCH)
   * @request PATCH:/user_roles/{id}
   * @secure
   */
  patchUserRolesId = (
    id: number,
    fields: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUserRolesResponse;
      },
      ResponseErrResponse
    >({
      path: `/user_roles/${id}`,
      method: "PATCH",
      body: fields,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 使用者核心資料表 **進階過濾 (Advanced Filtering):** 此端點支援 `filter=[欄位],[運算子],[值]` 的格式進行過濾。 * **AND 結合**: 若需多個條件同時成立，可重複使用 `filter` 參數 (例如 `?filter=A,eq,v1&filter=B,eq,v2`)。 * **OR 結合**: 在同一個 `filter` 參數內使用 `|` 分隔多個條件 (例如 `?filter=A,eq,v1|B,eq,v2`)。 * **可用的 `filter` 欄位**: `id, account, provider, password, is_active, created_at, updated_at` **聚合查詢 (Meta Aggregation):** 使用 `meta=[函式]([欄位])` 來獲取關於整個結果集的統計數據。可用的函式有 `count`, `sum`, `avg`, `max`, `min`。 * **可用的 `meta` 欄位**: (通常為數字類型欄位) **分組查詢 (Grouping):** 使用 `groupBy=[欄位],[欄位]` 來對結果進行分組。分組查詢的回應結構將只包含分組欄位和 `meta` 中要求的聚合欄位。 **可用運算子:** * `eq`: 等於 (Equal) * `neq`: 不等於 (Not Equal) * `gt`: 大於 (Greater Than) * `gte`: 大於或等於 (Greater Than or Equal To) * `lt`: 小於 (Less Than) * `lte`: 小於或等於 (Less Than or Equal To) * `like`: 模糊查詢 (Substring search) * `in`: 包含於 (值為逗號分隔的列表, e.g., `1,2,3`) **預設過濾條件 (Default Filters):** **查詢範例:** `?filter=account,like,value`
   *
   * @tags users
   * @name GetUsers
   * @summary List users
   * @request GET:/users
   * @secure
   */
  getUsers = (
    query?: {
      /** Page number */
      page?: number;
      /** Number of items per page */
      pageSize?: number;
      /** 欄位: `id, account, provider, password, is_active, created_at, updated_at` */
      filter?: string;
      /** Sort order (e.g., updated_at_asc). 可用的 `sort` 欄位: `id, account, provider, password, is_active, created_at, updated_at` */
      sort?: string;
      /** Aggregation queries (e.g., count(id),sum(price)) */
      meta?: string;
      /** Fields to group by (e.g., status,user_id) */
      groupBy?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      ResponsePaginatedResponseWithMeta & {
        data?: ResponseUsersResponse[];
      },
      ResponseErrResponse
    >({
      path: `/users`,
      method: "GET",
      query: query,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description **Validation Rules:** * `id`: * `account`:  required,email|e164 * `provider`: * `password_hash`: * `is_active`: * `created_at`: * `updated_at`:
   *
   * @tags users
   * @name PostUsers
   * @summary Create a new users
   * @request POST:/users
   * @secure
   */
  postUsers = (
    request: RequestCreateUsersRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUsersResponse;
      },
      ResponseErrResponse
    >({
      path: `/users`,
      method: "POST",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Replaces multiple users resources with new data. **Required Fields (for each item in the array):** * `id` (The ID of the item to update) * `id`  option * `account`  require * `provider`  require * `password_hash`  require * `is_active`  require * `created_at`  require * `updated_at`  require
   *
   * @tags users
   * @name PutUsersBatch
   * @summary Batch update existing users (PUT)
   * @request PUT:/users/batch
   * @secure
   */
  putUsersBatch = (
    request: RequestBatchUpdateUsersRequest,
    params: RequestParams = {},
  ) =>
    this.request<ResponseStdResponse, ResponseErrResponse>({
      path: `/users/batch`,
      method: "PUT",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Adds multiple new users resources to the database.
   *
   * @tags users
   * @name PostUsersBatch
   * @summary Batch create new users
   * @request POST:/users/batch
   * @secure
   */
  postUsersBatch = (
    request: RequestCreateUsersRequest[],
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUsersResponse[];
      },
      ResponseErrResponse
    >({
      path: `/users/batch`,
      method: "POST",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Removes multiple users resources from the database. The `ids` field is a required array of IDs to be deleted.
   *
   * @tags users
   * @name DeleteUsersBatch
   * @summary Batch delete users
   * @request DELETE:/users/batch
   * @secure
   */
  deleteUsersBatch = (
    request: RequestBatchDeleteUsersRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, ResponseErrResponse>({
      path: `/users/batch`,
      method: "DELETE",
      body: request,
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieves information about the currently authenticated user.
   *
   * @tags users
   * @name GetUsersMe
   * @summary Get current user info
   * @request GET:/users/me
   * @secure
   */
  getUsersMe = (params: RequestParams = {}) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUsersResponse;
      },
      ResponseErrResponse
    >({
      path: `/users/me`,
      method: "GET",
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 使用者核心資料表
   *
   * @tags users
   * @name GetUsersId
   * @summary Get a users by ID
   * @request GET:/users/{id}
   * @secure
   */
  getUsersId = (id: number, params: RequestParams = {}) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUsersResponse;
      },
      ResponseErrResponse
    >({
      path: `/users/${id}`,
      method: "GET",
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 使用者核心資料表 **Required Fields:** * `id`  option * `account`  require * `provider`  require * `password_hash`  require * `is_active`  require * `created_at`  require * `updated_at`  option
   *
   * @tags users
   * @name PutUsersId
   * @summary Update an existing users (PUT)
   * @request PUT:/users/{id}
   * @secure
   */
  putUsersId = (
    id: number,
    request: RequestUpdateUsersRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUsersResponse;
      },
      ResponseErrResponse
    >({
      path: `/users/${id}`,
      method: "PUT",
      body: request,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description 使用者核心資料表
   *
   * @tags users
   * @name DeleteUsersId
   * @summary Delete a users
   * @request DELETE:/users/{id}
   * @secure
   */
  deleteUsersId = (id: number, params: RequestParams = {}) =>
    this.request<void, ResponseErrResponse>({
      path: `/users/${id}`,
      method: "DELETE",
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description 使用者核心資料表
   *
   * @tags users
   * @name PatchUsersId
   * @summary Partially update an existing users (PATCH)
   * @request PATCH:/users/{id}
   * @secure
   */
  patchUsersId = (
    id: number,
    fields: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<
      ResponseStdResponse & {
        data?: ResponseUsersResponse;
      },
      ResponseErrResponse
    >({
      path: `/users/${id}`,
      method: "PATCH",
      body: fields,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description Retrieves a list of role names for a specific user.
   *
   * @tags users
   * @name GetUsersIdRoles
   * @summary Get roles for a user
   * @request GET:/users/{id}/roles
   * @secure
   */
  getUsersIdRoles = (id: number, params: RequestParams = {}) =>
    this.request<
      ResponseStdResponse & {
        data?: string[];
      },
      ResponseErrResponse
    >({
      path: `/users/${id}/roles`,
      method: "GET",
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });

  /**
   * @description The workflow can define a `triggerNode` to specify expected request body and headers, and a `responseNode` to customize the HTTP response (status code, headers, body). If a `responseNode` is defined, the API will return the custom response. Otherwise, it will return the full execution context.
   *
   * @tags workflow
   * @name PostWorkflowWorkflowIdExecute
   * @summary Execute a workflow
   * @request POST:/workflow/{workflow_id}/execute
   */
  postWorkflowWorkflowIdExecute = (
    workflowId: string,
    request: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<ResponseStdResponse, ResponseErrResponse>({
      path: `/workflow/${workflowId}/execute`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
