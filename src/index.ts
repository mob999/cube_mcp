#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from "@modelcontextprotocol/sdk/types.js";
// Environment variables are typically injected by the MCP client config.
// dotenv.config() is removed to prevent JSON-RPC stdout pollution.
import cubejs from "@cubejs-client/core";
import * as fs from "fs";
import * as path from "path";
// Initialize Cube.js Client
const cubejsApiUrl = process.env.CUBEJS_API_URL || "http://localhost:4000/cubejs-api/v1";
// @ts-ignore: cubejs default export can be tricky with some tsconfig setups, but typically works
const cubejsApi = cubejs.default || cubejs;

const client = cubejsApi("", { apiUrl: cubejsApiUrl });

// Tool Definitions
const DISCOVER_ENTITIES_TOOL: Tool = {
    name: "discover_entities",
    description: "Discover available Data Assets (Entities). Use this tool FIRST to understand the schema (Dimensions and Measures) available for querying. Returns a catalog of Semantic Entities with descriptions of their fields.",
    inputSchema: {
        type: "object",
        properties: {},
    },
};

const EXECUTE_QUERY_TOOL: Tool = {
    name: "execute_query",
    description: "Execute an Analytical Query. Perform multi-dimensional analysis on one of the entities discovered via 'discover_entities'.",
    inputSchema: {
        type: "object",
        properties: {
            entity_name: {
                type: "string",
                description: "The name of the Entity to query (e.g., 'Components')."
            },
            measures: {
                type: "array",
                items: { type: "string" },
                description: "Measures to calculate (e.g., ['Components.area']). MUST use 'Entity.Measure' format."
            },
            dimensions: {
                type: "array",
                items: { type: "string" },
                description: "Dimensions to group/segment by (e.g., ['Components.id']). MUST use 'Entity.Dimension' format."
            },
            filters: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        member: { type: "string", description: "Fully qualified field name (e.g., 'EntityName.FieldName')" },
                        operator: { type: "string", description: "Comparison operator: 'equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'contains', 'notContains', 'set', 'notSet'" },
                        values: {
                            type: "array",
                            items: { type: "string" },
                            description: "List of filter values. Warning: Large identifiers (like scene_id) must be strings to prevent precision loss."
                        }
                    },
                    required: ["member", "operator", "values"]
                },
                description: "Optional filters to apply to the query."
            },
            limit: {
                type: "number",
                description: "Max rows to return (default None)."
            }
        },
        required: ["entity_name", "measures"],
    },
};

const server = new Server(
    {
        name: "cubejs-ts-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [DISCOVER_ENTITIES_TOOL, EXECUTE_QUERY_TOOL],
    };
});

// Call Tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;

        if (name === "discover_entities") {
            const meta = await client.meta();
            const cubes = meta.cubes || [];
            const entities: Record<string, any> = {};

            for (const cube of cubes) {
                const entityName = cube.name;

                const dimensions: Record<string, any> = {};
                for (const dim of cube.dimensions || []) {
                    dimensions[dim.name] = {
                        type: dim.type,
                        description: dim.description || "",
                        title: dim.title || ""
                    };
                }

                const measures: Record<string, any> = {};
                for (const meas of cube.measures || []) {
                    measures[meas.name] = {
                        type: meas.type,
                        description: meas.description || "",
                        title: meas.title || ""
                    };
                }

                entities[entityName] = {
                    title: cube.title || entityName,
                    description: cube.description || "",
                    dimensions,
                    measures
                };
            }

            return {
                content: [{ type: "text", text: JSON.stringify({ entities }, null, 2) }],
            };
        }

        else if (name === "execute_query") {
            const { entity_name, measures, dimensions = [], filters = [], limit } = args as any;

            const query: any = {
                measures,
                dimensions
            };

            if (filters && filters.length > 0) {
                query.filters = filters.map((f: any) => ({
                    member: f.member,
                    operator: f.operator,
                    values: f.values.map((v: any) => String(v))
                }));
            }

            if (limit !== undefined && limit !== null) {
                query.limit = limit;
            }

            const resultSet = await client.load(query);
            const data = resultSet.rawData() || [];

            const is_truncated = data.length > 50;
            const preview_limit = 50;
            const columns = resultSet.tableColumns().map((c: any) => c.key);

            // Save full context to tmp space
            const timestamp = Date.now();
            const tmpFilepath = path.join("/tmp", `cube_query_result_${timestamp}.json`);
            fs.writeFileSync(tmpFilepath, JSON.stringify(data, null, 2), "utf-8");

            const resultPayload = {
                entity: entity_name,
                num_rows: data.length,
                columns: columns,
                preview: data.slice(0, preview_limit),
                is_truncated,
                result_filepath: tmpFilepath,
                message: `Successfully executed query. Received ${data.length} rows. Full context saved at: ${tmpFilepath}`
            };

            return {
                content: [{ type: "text", text: JSON.stringify(resultPayload, null, 2) }],
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
        console.error("Tool execution error:", error);
        return {
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
        };
    }
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Cube.js TypeScript MCP Server running on stdio");
}

run().catch(console.error);
