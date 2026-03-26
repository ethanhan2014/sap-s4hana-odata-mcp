import "dotenv/config";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./mcp-server.js";
import type { ODataConfig } from "./types.js";

function loadConfig(): ODataConfig {
  const baseUrl = process.env.S4HANA_BASE_URL;
  const username = process.env.S4HANA_USERNAME;
  const password = process.env.S4HANA_PASSWORD;

  if (!baseUrl || !username || !password) {
    console.error("Missing required env vars: S4HANA_BASE_URL, S4HANA_USERNAME, S4HANA_PASSWORD");
    console.error("Copy .env.example to .env and fill in your S/4HANA connection details.");
    process.exit(1);
  }

  return {
    baseUrl,
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
  console.error(`sap-s4hana-odata-mcp started (${config.baseUrl})`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
