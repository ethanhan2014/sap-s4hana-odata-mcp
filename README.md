# sap-s4hana-odata-mcp

An MCP (Model Context Protocol) server for querying SAP S/4HANA Business Partner data via OData V2 API. Connects directly to on-premise S/4HANA systems using Basic Authentication.

## Tools

| Tool | Description |
|------|-------------|
| `list_business_partners` | List business partners with OData filtering, sorting, pagination, and field selection |
| `get_business_partner` | Get a specific business partner by ID with optional `$expand` for addresses, roles, etc. |

## Setup

```bash
npm install
cp .env.example .env   # then edit with your S/4HANA connection details
npm run build
```

## Configuration

All settings are in `.env`:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `S4HANA_HOSTNAME` | Yes | S/4HANA application server hostname | `s4hana.example.com` |
| `S4HANA_SYSNR` | Yes | SAP system number (00-99) | `50` |
| `S4HANA_USE_HTTPS` | No | Use HTTPS (default: `true`) | `true` |
| `S4HANA_USERNAME` | Yes | SAP technical user | `TECH_USER` |
| `S4HANA_PASSWORD` | Yes | Password | `secret123` |
| `S4HANA_CLIENT` | No | SAP client number | `001` |
| `S4HANA_ODATA_PATH` | No | OData service path (default: `/sap/opu/odata/sap/API_BUSINESS_PARTNER`) | `/sap/opu/odata/sap/API_BUSINESS_PARTNER` |

### Port Calculation

The HTTP/HTTPS port is derived from the system number:

- **HTTPS port** = `443` + system number (e.g. sysnr `50` -> port `44350`)
- **HTTP port** = `80` + system number (e.g. sysnr `50` -> port `8050`)

### Finding Your Connection Details

Run transaction **SMICM** in SAP GUI to find the hostname, system number, and active ports:

1. Open SAP GUI and enter tcode `SMICM`
2. Go to **Goto > Services** to see the list of active HTTP/HTTPS services
3. Note the **hostname** and **port numbers** — the system number is the last two digits of the port (e.g. port `44350` means sysnr `50`)

## Usage with Claude Code

Add to `.claude.json`:

```json
{
  "mcpServers": {
    "s4hana-bp": {
      "command": "node",
      "args": ["/path/to/sap-s4hana-odata-mcp/dist/index.js"]
    }
  }
}
```

## Example Queries

**List first 10 business partners:**
> Show me the first 10 business partners

**Search by name:**
> Find business partners with "SAP" in the name

**Filter by category (1=Person, 2=Organization):**
> List all person-type business partners

**Get details with address:**
> Get business partner 21 with their address

## Tech Stack

- TypeScript
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- Axios for OData HTTP calls
- Zod for input validation
- dotenv for configuration

## License

MIT
