export interface ODataConfig {
  hostname: string;
  sysnr: string;
  useHttps: boolean;
  username: string;
  password: string;
  client?: string;
  odataPath: string;
}

export function buildBaseUrl(config: ODataConfig): string {
  const protocol = config.useHttps ? "https" : "http";
  const port = config.useHttps ? `443${config.sysnr}` : `80${config.sysnr}`;
  return `${protocol}://${config.hostname}:${port}`;
}

export interface BusinessPartner {
  BusinessPartner: string;
  BusinessPartnerCategory: string;
  BusinessPartnerFullName: string;
  BusinessPartnerGrouping: string;
  FirstName?: string;
  LastName?: string;
  OrganizationBPName1?: string;
  OrganizationBPName2?: string;
  SearchTerm1?: string;
  SearchTerm2?: string;
  BusinessPartnerIsBlocked?: boolean;
  CreationDate?: string;
  LastChangeDate?: string;
}

export interface BusinessPartnerAddress {
  BusinessPartner: string;
  AddressID: string;
  CityName?: string;
  Country?: string;
  PostalCode?: string;
  StreetName?: string;
  Region?: string;
}

export interface ODataCollectionResponse<T> {
  d: {
    results: T[];
    __next?: string;
  };
}

export interface ODataEntityResponse<T> {
  d: T;
}
