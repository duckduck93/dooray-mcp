import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { axiosInstance, handleError } from "../client.js";

export function registerWikiTools(server: McpServer) {
  server.registerTool(
    "get_wikis",
    {
      description:
        "List all Dooray wiki spaces accessible to the current user. Returns wiki id, name, and description. A wiki space contains multiple pages — use the wiki id with other wiki tools.",
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
      description: "Get the body content of a Dooray wiki page by its page_id. Returns the page content in Markdown format.",
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
      description:
        "Update the body content of a Dooray wiki page. Requires both wiki_id (wiki space) and page_id (specific page). Replaces the entire page body with new Markdown content.",
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
    "create_wiki",
    {
      description:
        "Create a new page in a Dooray wiki space. Requires wiki_id, subject (title), and body (Markdown). Optionally set parent_page_id to create a subpage under an existing page.",
      inputSchema: {
        wiki_id: z.string().describe("Wiki ID"),
        subject: z.string().describe("Wiki page title"),
        body: z.string().describe("Wiki page body content (markdown)"),
        parent_page_id: z.string().optional().describe("Parent page ID (omit for top-level page)"),
      },
    },
    async ({ wiki_id, subject, body, parent_page_id }) => {
      try {
        const response = await axiosInstance.post(`/wiki/v1/wikis/${wiki_id}/pages`, {
          subject,
          body: {
            mimeType: "text/x-markdown",
            content: body,
          },
          ...(parent_page_id && { parentPageId: parent_page_id }),
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
    "get_wiki_children",
    {
      description:
        "List child (sub) pages under a specific Dooray wiki page. Returns page id, subject, and order. Use this to navigate the wiki page hierarchy.",
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
