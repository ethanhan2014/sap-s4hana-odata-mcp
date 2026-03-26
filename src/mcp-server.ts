import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { ODataClient } from "./odata-client.js";
import type { ODataConfig, BusinessPartner } from "./types.js";

const ListBPSchema = z.object({
  top: z.number().optional().default(20).describe("Max number of results (default: 20, max: 100)"),
  skip: z.number().optional().describe("Number of records to skip (for pagination)"),
  filter: z.string().optional().describe("OData $filter expression (e.g. \"BusinessPartnerCategory eq '1'\" for persons, \"substringof('SAP',BusinessPartnerFullName)\" for name search)"),
  select: z.string().optional().describe("Comma-separated fields to return (default: key BP fields)"),
  orderby: z.string().optional().describe("OData $orderby expression (e.g. \"BusinessPartnerFullName asc\")"),
  expand: z.string().optional().describe("OData $expand for related entities (e.g. \"to_BusinessPartnerAddress\")"),
});

const GetBPSchema = z.object({
  id: z.string().describe("Business Partner ID (e.g. '1000001')"),
  select: z.string().optional().describe("Comma-separated fields to return"),
  expand: z.string().optional().describe("OData $expand for related entities (e.g. \"to_BusinessPartnerAddress,to_BusinessPartnerRole\")"),
});

function formatBPList(partners: BusinessPartner[]): string {
  if (partners.length === 0) {
    return "No business partners found.";
  }

  const lines = [`Found ${partners.length} business partner(s)\n`];

  for (const bp of partners) {
    const category = bp.BusinessPartnerCategory === "1" ? "Person"
      : bp.BusinessPartnerCategory === "2" ? "Organization"
      : bp.BusinessPartnerCategory;

    lines.push(`BP ${bp.BusinessPartner} | ${bp.BusinessPartnerFullName} | ${category} | Group: ${bp.BusinessPartnerGrouping || "-"}`);

    if (bp.FirstName || bp.LastName) {
      lines.push(`  Name: ${bp.FirstName || ""} ${bp.LastName || ""}`.trimEnd());
    }
    if (bp.OrganizationBPName1) {
      lines.push(`  Org: ${bp.OrganizationBPName1}`);
    }
    if (bp.SearchTerm1) {
      lines.push(`  Search Term: ${bp.SearchTerm1}`);
    }
    if (bp.BusinessPartnerIsBlocked) {
      lines.push(`  ** BLOCKED **`);
    }
  }

  return lines.join("\n");
}

function formatBPDetail(bp: BusinessPartner): string {
  const category = bp.BusinessPartnerCategory === "1" ? "Person"
    : bp.BusinessPartnerCategory === "2" ? "Organization"
    : bp.BusinessPartnerCategory;

  const lines = [
    `Business Partner: ${bp.BusinessPartner}`,
    `Full Name: ${bp.BusinessPartnerFullName}`,
    `Category: ${category}`,
    `Grouping: ${bp.BusinessPartnerGrouping || "-"}`,
  ];

  if (bp.FirstName || bp.LastName) {
    lines.push(`First Name: ${bp.FirstName || "-"}`);
    lines.push(`Last Name: ${bp.LastName || "-"}`);
  }
  if (bp.OrganizationBPName1) {
    lines.push(`Organization Name 1: ${bp.OrganizationBPName1}`);
  }
  if (bp.OrganizationBPName2) {
    lines.push(`Organization Name 2: ${bp.OrganizationBPName2}`);
  }
  if (bp.SearchTerm1) lines.push(`Search Term 1: ${bp.SearchTerm1}`);
  if (bp.SearchTerm2) lines.push(`Search Term 2: ${bp.SearchTerm2}`);
  if (bp.CreationDate) lines.push(`Created: ${bp.CreationDate}`);
  if (bp.LastChangeDate) lines.push(`Last Changed: ${bp.LastChangeDate}`);
  if (bp.BusinessPartnerIsBlocked) lines.push(`Status: BLOCKED`);

  // Include any extra fields from $expand as raw JSON
  const knownKeys = new Set([
    "BusinessPartner", "BusinessPartnerCategory", "BusinessPartnerFullName",
    "BusinessPartnerGrouping", "FirstName", "LastName", "OrganizationBPName1",
    "OrganizationBPName2", "SearchTerm1", "SearchTerm2", "BusinessPartnerIsBlocked",
    "CreationDate", "LastChangeDate", "__metadata",
  ]);

  for (const [key, value] of Object.entries(bp)) {
    if (!knownKeys.has(key) && value !== null && value !== undefined) {
      if (typeof value === "object") {
        const results = (value as { results?: unknown[] }).results;
        if (Array.isArray(results)) {
          lines.push(`\n${key} (${results.length} entries):`);
          lines.push(JSON.stringify(results, null, 2));
        } else {
          lines.push(`\n${key}:`);
          lines.push(JSON.stringify(value, null, 2));
        }
      }
    }
  }

  return lines.join("\n");
}

export function createMcpServer(config: ODataConfig): Server {
  const client = new ODataClient(config);

  const server = new Server(
    { name: "sap-s4hana-odata-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "list_business_partners",
        description:
          "List business partners from SAP S/4HANA. " +
          "Supports OData filtering, sorting, pagination, and field selection. " +
          "Category '1' = Person, '2' = Organization. " +
          "Use $filter for search, e.g. substringof('keyword',BusinessPartnerFullName).",
        inputSchema: {
          type: "object" as const,
          properties: {
            top: { type: "number", description: "Max results (default: 20, max: 100)", default: 20 },
            skip: { type: "number", description: "Records to skip (pagination)" },
            filter: { type: "string", description: "OData $filter (e.g. \"BusinessPartnerCategory eq '1'\", \"substringof('SAP',BusinessPartnerFullName)\")" },
            select: { type: "string", description: "Comma-separated fields to return" },
            orderby: { type: "string", description: "OData $orderby (e.g. \"BusinessPartnerFullName asc\")" },
            expand: { type: "string", description: "OData $expand (e.g. \"to_BusinessPartnerAddress\")" },
          },
        },
      },
      {
        name: "get_business_partner",
        description:
          "Get a specific business partner by ID from SAP S/4HANA. " +
          "Returns full details. Use $expand to include related data like addresses or roles.",
        inputSchema: {
          type: "object" as const,
          properties: {
            id: { type: "string", description: "Business Partner ID (e.g. '1000001')" },
            select: { type: "string", description: "Comma-separated fields to return" },
            expand: { type: "string", description: "OData $expand (e.g. \"to_BusinessPartnerAddress,to_BusinessPartnerRole\")" },
          },
          required: ["id"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "list_business_partners": {
          const parsed = ListBPSchema.parse(args);
          const top = Math.min(Math.max(1, parsed.top || 20), 100);
          const results = await client.listBusinessPartners({
            top,
            skip: parsed.skip,
            filter: parsed.filter,
            select: parsed.select,
            orderby: parsed.orderby,
            expand: parsed.expand,
          });
          return {
            content: [{ type: "text", text: formatBPList(results) }],
          };
        }

        case "get_business_partner": {
          const parsed = GetBPSchema.parse(args);
          const bp = await client.getBusinessPartner(parsed.id, {
            select: parsed.select,
            expand: parsed.expand,
          });
          return {
            content: [{ type: "text", text: formatBPDetail(bp) }],
          };
        }

        default:
          return {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Tool ${name} error:`, message);

      if (message.includes("401") || message.includes("Unauthorized")) {
        return {
          content: [{ type: "text", text: "AUTH_ERROR: Invalid credentials or insufficient permissions. Check S4HANA_USERNAME and S4HANA_PASSWORD in .env" }],
          isError: true,
        };
      }

      if (message.includes("404")) {
        return {
          content: [{ type: "text", text: `NOT_FOUND: Resource not found. Check the OData service path and entity key. Error: ${message}` }],
          isError: true,
        };
      }

      if (message.includes("ECONNREFUSED") || message.includes("ETIMEDOUT")) {
        return {
          content: [{ type: "text", text: `NETWORK_ERROR: Cannot connect to S/4HANA. Check S4HANA_BASE_URL in .env. Error: ${message}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: `ERROR: ${message}` }],
        isError: true,
      };
    }
  });

  return server;
}
