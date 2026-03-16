import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { axiosInstance, handleError } from "../client.js";

export function registerMemberTools(server: McpServer) {
  server.registerTool(
    "get_current_member",
    {
      description: "Get the current authenticated member's information",
      inputSchema: {},
    },
    async () => {
      try {
        const response = await axiosInstance.get("/common/v1/members/me");
        return {
          content: [{ type: "text" as const, text: JSON.stringify(response.data, null, 2) }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );
}
