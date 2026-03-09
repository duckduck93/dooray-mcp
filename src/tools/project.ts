import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { axiosInstance, handleError } from "../client.js";

export function registerProjectTools(server: McpServer) {
  server.registerTool(
    "get_projects",
    {
      description: "List all projects the user is a member of",
      inputSchema: {
        page: z.number().optional().default(0).describe("Page number"),
        size: z.number().optional().default(20).describe("Number of items per page"),
      },
    },
    async ({ page, size }) => {
      try {
        const response = await axiosInstance.get("/project/v1/projects", {
          params: { page, size },
        });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(response.data, null, 2) }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "get_project_by_id",
    {
      description: "Get project information by ID or Name",
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

  server.registerTool(
    "get_project_tags",
    {
      description: "List all tags in a project",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
      },
    },
    async ({ project_id }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}/tags`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(response.data, null, 2) }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );
}
