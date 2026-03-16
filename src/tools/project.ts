import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { axiosInstance, handleError } from "../client.js";

export function registerProjectTools(server: McpServer) {
  server.registerTool(
    "get_projects",
    {
      description: "List all projects the user is a member of",
      inputSchema: {
        page: z.number().optional().default(0).describe("Page number (0-based)"),
        size: z.number().optional().default(20).describe("Number of items per page (max 100)"),
        state: z.enum(["active", "archived", "deleted"]).optional().describe("Filter by project state"),
        scope: z
          .enum(["private", "public"])
          .optional()
          .describe("Filter by access scope. private: members only, public: all org members"),
        type: z
          .enum(["private", "public"])
          .optional()
          .describe("Filter by project type. private: personal project, public: general project (default)"),
      },
    },
    async ({ page, size, state, scope, type }) => {
      try {
        const response = await axiosInstance.get("/project/v1/projects", {
          params: { member: "me", page, size, state, scope, type },
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
        page: z.number().optional().default(0).describe("Page number (0-based)"),
        size: z.number().optional().default(20).describe("Number of items per page (max 100)"),
      },
    },
    async ({ project_id, page, size }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}/tags`, {
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
    "get_project_milestones",
    {
      description: "List milestones (phases) in a project",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        page: z.number().optional().default(0).describe("Page number (0-based)"),
        size: z.number().optional().default(20).describe("Number of items per page (max 100)"),
        status: z.enum(["open", "closed"]).optional().describe("Filter by milestone status"),
      },
    },
    async ({ project_id, page, size, status }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}/milestones`, {
          params: { page, size, status },
        });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(response.data, null, 2) }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );
}
