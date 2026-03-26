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
| `S4HANA_BASE_URL` | Yes | S/4HANA host with protocol and port | `https://s4hana.example.com:44350` |
| `S4HANA_USERNAME` | Yes | SAP technical user | `TECH_USER` |
| `S4HANA_PASSWORD` | Yes | Password | `secret123` |
| `S4HANA_CLIENT` | No | SAP client number | `001` |
| `S4HANA_ODATA_PATH` | No | OData service path (default: `/sap/opu/odata/sap/API_BUSINESS_PARTNER`) | `/sap/opu/odata/sap/API_BUSINESS_PARTNER` |

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
