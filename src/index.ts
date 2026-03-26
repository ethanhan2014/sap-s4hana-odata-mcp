import "dotenv/config";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./mcp-server.js";
import type { ODataConfig } from "./types.js";
import { buildBaseUrl } from "./types.js";

function loadConfig(): ODataConfig {
  const hostname = process.env.S4HANA_HOSTNAME;
  const sysnr = process.env.S4HANA_SYSNR;
  const username = process.env.S4HANA_USERNAME;
  const password = process.env.S4HANA_PASSWORD;

  if (!hostname || !sysnr || !username || !password) {
    console.error("Missing required env vars: S4HANA_HOSTNAME, S4HANA_SYSNR, S4HANA_USERNAME, S4HANA_PASSWORD");
    console.error("Copy .env.example to .env and fill in your S/4HANA connection details.");
    console.error("Run tcode SMICM in SAP GUI to find your hostname and system number.");
    process.exit(1);
  }

  return {
    hostname,
    sysnr,
    useHttps: (process.env.S4HANA_USE_HTTPS || "true").toLowerCase() === "true",
    username,
    password,
    client: process.env.S4HANA_CLIENT,
    odataPath: process.env.S4HANA_ODATA_PATH || "/sap/opu/odata/sap/API_BUSINESS_PARTNER",
  };
}

async function main() {
  const config = loadConfig();
  const server = createMcpServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`sap-s4hana-odata-mcp started (${buildBaseUrl(config)})`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
