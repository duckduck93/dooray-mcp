import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { axiosInstance, handleError } from "../client.js";

export function registerProjectTools(server: McpServer) {
  server.registerTool(
    "project_get_info",
    {
      description: "Get project information including tags, status, members, and ID",
      inputSchema: { project_id: z.string().describe("Project ID or Name") },
    },
    async ({ project_id }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(response.data, null, 2) }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );
}
