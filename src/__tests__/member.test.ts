import { describe, it, expect } from "vitest";
import { createMockServer } from "./helpers.js";
import { registerMemberTools } from "../tools/member.js";

describe("member tools (integration)", () => {
  const { server, tools } = createMockServer();

  registerMemberTools(server);

  describe("get_current_member", () => {
    it("should return current member info", async () => {
      const result = await tools["get_current_member"]!.handler({});

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
      expect(data.result.id).toBeDefined();
      expect(data.result.name).toBeDefined();
    });
  });
});
