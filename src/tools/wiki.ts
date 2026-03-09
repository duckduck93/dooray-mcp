import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { axiosInstance, handleError } from "../client.js";

export function registerWikiTools(server: McpServer) {
  server.registerTool(
    "get_wikis",
    {
      description: "List accessible wikis",
      inputSchema: {
        page: z.number().optional().describe("Page number (default: 0)"),
        size: z.number().optional().describe("Page size (default: 20)"),
      },
    },
    async ({ page, size }) => {
      try {
        const response = await axiosInstance.get("/wiki/v1/wikis", {
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
    "get_wiki_by_id",
    {
      description: "Get the body content of a project wiki page",
      inputSchema: {
        page_id: z.string().describe("Wiki Page ID"),
      },
    },
    async ({ page_id }) => {
      try {
        const response = await axiosInstance.get(`/wiki/v1/pages/${page_id}`);
        return {
          content: [{ type: "text" as const, text: response.data.result.body.content }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "update_wiki",
    {
      description: "Update the body content of a project wiki page",
      inputSchema: {
        wiki_id: z.string().describe("Wiki ID"),
        page_id: z.string().describe("Wiki Page ID"),
        body: z.string().describe("New wiki body content"),
      },
    },
    async ({ wiki_id, page_id, body }) => {
      try {
        await axiosInstance.put(`/wiki/v1/wikis/${wiki_id}/pages/${page_id}/content`, {
          body: {
            mimeType: "text/x-markdown",
            content: body,
          },
        });
        return {
          content: [{ type: "text" as const, text: "Successfully updated wiki body" }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "get_wiki_children",
    {
      description: "Get child pages of a specific wiki page",
      inputSchema: {
        wiki_id: z.string().describe("Wiki ID"),
        page_id: z.string().describe("Parent Wiki Page ID"),
      },
    },
    async ({ wiki_id, page_id }) => {
      try {
        const response = await axiosInstance.get(`/wiki/v1/wikis/${wiki_id}/pages`, {
          params: { parentPageId: page_id },
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
