import { describe, it, expect } from "vitest";
import { createMockServer, getTestConfig } from "./helpers.js";
import { registerProjectTools } from "../tools/project.js";

describe("project tools (integration)", () => {
  const { server, tools } = createMockServer();
  const config = getTestConfig();

  registerProjectTools(server);

  describe("get_projects", () => {
    it("should return project list", async () => {
      const result = await tools["get_projects"]!.handler({ page: 0, size: 5 });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
      expect(Array.isArray(data.result)).toBe(true);
    });
  });

  describe("get_project_by_id", () => {
    it("should return project info", async () => {
      const result = await tools["get_project_by_id"]!.handler({
        project_id: config.projectId,
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
      expect(data.result.id).toBe(config.projectId);
    });

    it("should return error for invalid project ID", async () => {
      const result = await tools["get_project_by_id"]!.handler({
        project_id: "invalid-project-id-12345",
      });

      expect(result.isError).toBe(true);
    });
  });

  describe("get_project_tags", () => {
    it("should return tags list", async () => {
      const result = await tools["get_project_tags"]!.handler({
        project_id: config.projectId,
        page: 0,
        size: 20,
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
    });
  });

  describe("get_project_milestones", () => {
    it("should return milestones list", async () => {
      const result = await tools["get_project_milestones"]!.handler({
        project_id: config.projectId,
        page: 0,
        size: 20,
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
    });
  });
});
