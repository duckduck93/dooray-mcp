import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { axiosInstance, handleError } from "../client.js";

export function registerWikiTools(server: McpServer) {
  server.registerTool(
    "wiki_get_body",
    {
      description: "Get the body content of a project wiki",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        wiki_id: z.string().describe("Wiki ID"),
      },
    },
    async ({ project_id, wiki_id }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}/wikis/${wiki_id}`);
        return {
          content: [{ type: "text" as const, text: response.data.result.content.body.content }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "wiki_update_body",
    {
      description: "Update the body content of a project wiki",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        wiki_id: z.string().describe("Wiki ID"),
        body: z.string().describe("New wiki body content"),
      },
    },
    async ({ project_id, wiki_id, body }) => {
      try {
        await axiosInstance.put(`/project/v1/projects/${project_id}/wikis/${wiki_id}/body`, {
          content: body,
        });
        return {
          content: [{ type: "text" as const, text: "Successfully updated wiki body" }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );
}
