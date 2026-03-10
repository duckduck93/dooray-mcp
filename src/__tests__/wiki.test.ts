import { describe, it, expect } from "vitest";
import { createMockServer, getTestConfig } from "./helpers.js";
import { registerWikiTools } from "../tools/wiki.js";

describe("wiki tools (integration)", () => {
  const { server, tools } = createMockServer();
  const config = getTestConfig();

  registerWikiTools(server);

  // 원본 내용을 저장해두고 테스트 후 복원
  let originalContent: string;

  describe("get_wikis", () => {
    it("should return wiki list", async () => {
      const result = await tools["get_wikis"]!.handler({ page: 0, size: 5 });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
      expect(Array.isArray(data.result)).toBe(true);
    });
  });

  describe("get_wiki_by_id", () => {
    it("should return wiki page content", async () => {
      const result = await tools["get_wiki_by_id"]!.handler({
        page_id: config.wikiPageId,
      });

      expect(result.isError).toBeUndefined();
      expect(typeof result.content[0].text).toBe("string");
      originalContent = result.content[0].text;
    });
  });

  describe("update_wiki", () => {
    it("should update wiki page content", async () => {
      const testContent = `${originalContent}\n\n<!-- integration test: ${Date.now()} -->`;
      const result = await tools["update_wiki"]!.handler({
        wiki_id: config.wikiId,
        page_id: config.wikiPageId,
        body: testContent,
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toBe("Successfully updated wiki body");
    });

    it("should restore original content", async () => {
      const result = await tools["update_wiki"]!.handler({
        wiki_id: config.wikiId,
        page_id: config.wikiPageId,
        body: originalContent,
      });

      expect(result.isError).toBeUndefined();
    });
  });

  describe("create_wiki", () => {
    it("should create a new wiki page", async () => {
      const result = await tools["create_wiki"]!.handler({
        wiki_id: config.wikiId,
        subject: `[테스트] 통합 테스트 위키 ${Date.now()}`,
        body: "이 위키는 통합 테스트에서 자동 생성되었습니다.",
        parent_page_id: config.wikiPageId,
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
      expect(data.result.id).toBeDefined();
    });
  });

  describe("get_wiki_children", () => {
    it("should return child pages", async () => {
      const result = await tools["get_wiki_children"]!.handler({
        wiki_id: config.wikiId,
        page_id: config.wikiPageId,
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
    });
  });
});
