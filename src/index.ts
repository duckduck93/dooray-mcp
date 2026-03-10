import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerProjectTools } from "./tools/project.js";
import { registerTaskTools } from "./tools/task.js";
import { registerWikiTools } from "./tools/wiki.js";
import { registerMemberTools } from "./tools/member.js";

class DoorayMcpServer {
  private server: McpServer;

  constructor() {
    this.server = new McpServer({
      name: "dooray-mcp-server",
      version: "1.0.0",
    });

    this.setupTools();

    // Error handling
    this.server.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupTools() {
    registerProjectTools(this.server);
    registerTaskTools(this.server);
    registerWikiTools(this.server);
    registerMemberTools(this.server);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Dooray MCP server running on stdio");
  }
}

const server = new DoorayMcpServer();
server.run().catch(console.error);
