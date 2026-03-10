import { vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// McpServer를 mock하여 registerTool 호출을 캡쳐하고 핸들러를 직접 호출할 수 있게 함
export function createMockServer() {
  const tools: Record<string, { options: any; handler: Function }> = {};

  const server = {
    registerTool: vi.fn((name: string, options: any, handler: Function) => {
      tools[name] = { options, handler };
    }),
  };

  return { server: server as unknown as McpServer, tools };
}

// 테스트용 환경 변수 가져오기
export function getTestConfig() {
  return {
    projectId: process.env.TEST_PROJECT_ID!,
    wikiId: process.env.TEST_WIKI_ID!,
    wikiPageId: process.env.TEST_WIKI_PAGE_ID!,
  };
}
