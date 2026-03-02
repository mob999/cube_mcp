# Cube.js TypeScript MCP Server

This is a standalone Model Context Protocol (MCP) server for [Cube.js](https://cube.dev/), written in TypeScript using the official `@cubejs-client/core` SDK. 

It provides advanced AI assistants (like Claude, Cursor, etc.) with semantic layer visibility and multi-dimensional querying capabilities over your data.

## Features
- **`discover_entities`**: Introspects the Cube.js metadata (`/meta`) and explains the available Cubes, Dimensions, and Measures to the LLM.
- **`execute_query`**: Executes semantic queries (`/load`) with precise types, filtering, and result truncation to prevent context window overflow.

## Prerequisites
- Node.js (v18 or higher recommended)
- A running instance of Cube.js

## Quick Start

You can run the published MCP server directly without installing it manually:
```bash
npx -y @mob999/cube_mcp
```

## Local Development & Build

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the TypeScript source:**
   ```bash
   npm run build
   ```
   *This compiles the TypeScript code into the `dist/` directory.*

## Development & Testing
- **Run Tests:** `npm test`
- **Lint Code:** `npm run lint`

## Configuration

By default, the server expects your Cube.js API to be available at `http://localhost:4000/cubejs-api/v1`. 

You can override this by setting the `CUBEJS_API_URL` environment variable.

To integrate this semantic layer into Cursor or any other MCP-compatible IDE/Agent, configure it as a **stdio** tool.

**Example `mcp.json` / Client Configuration:**

```json
{
  "mcpServers": {
    "CubeSemanticLayer": {
      "command": "npx",
      "args": ["-y", "@mob999/cube_mcp"],
      "env": {
        "CUBEJS_API_URL": "http://localhost:4000/cubejs-api/v1"
      }
    }
  }
}
```

*Note: The `-y` flag allows `npx` to automatically download and run the package without prompting for confirmation.*
