import https from "https";
import axios, { AxiosInstance } from "axios";
import type {
  ODataConfig,
  ODataCollectionResponse,
  ODataEntityResponse,
  BusinessPartner,
} from "./types.js";
import { buildBaseUrl } from "./types.js";

export class ODataClient {
  private http: AxiosInstance;
  private odataPath: string;

  constructor(config: ODataConfig) {
    this.odataPath = config.odataPath;
    const baseURL = buildBaseUrl(config);

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (config.client) {
      headers["sap-client"] = config.client;
    }

    this.http = axios.create({
      baseURL,
      headers,
      auth: {
        username: config.username,
        password: config.password,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
  }

  async listBusinessPartners(options: {
    top?: number;
    skip?: number;
    filter?: string;
    select?: string;
    orderby?: string;
    expand?: string;
  } = {}): Promise<BusinessPartner[]> {
    const params: Record<string, string | number> = {
      $format: "json",
    };

    if (options.top) params.$top = options.top;
    if (options.skip) params.$skip = options.skip;
    if (options.filter) params.$filter = options.filter;
    if (options.orderby) params.$orderby = options.orderby;
    if (options.select) {
      params.$select = options.select;
    } else {
      params.$select = [
        "BusinessPartner",
        "BusinessPartnerCategory",
        "BusinessPartnerFullName",
        "BusinessPartnerGrouping",
        "FirstName",
        "LastName",
        "OrganizationBPName1",
        "SearchTerm1",
        "BusinessPartnerIsBlocked",
        "CreationDate",
        "LastChangeDate",
      ].join(",");
    }
    if (options.expand) params.$expand = options.expand;

    const response = await this.http.get<ODataCollectionResponse<BusinessPartner>>(
      `${this.odataPath}/A_BusinessPartner`,
      { params },
    );

    return response.data.d.results;
  }

  async getBusinessPartner(id: string, options: {
    select?: string;
    expand?: string;
  } = {}): Promise<BusinessPartner> {
    const params: Record<string, string> = {
      $format: "json",
    };

    if (options.select) {
      params.$select = options.select;
    }
    if (options.expand) {
      params.$expand = options.expand;
    }

    const response = await this.http.get<ODataEntityResponse<BusinessPartner>>(
      `${this.odataPath}/A_BusinessPartner('${id}')`,
      { params },
    );

    return response.data.d;
  }
}
