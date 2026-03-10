import { describe, it, expect } from "vitest";
import { createMockServer, getTestConfig } from "./helpers.js";
import { registerTaskTools } from "../tools/task.js";

describe("task tools (integration)", () => {
  const { server, tools } = createMockServer();
  const config = getTestConfig();

  registerTaskTools(server);

  // 생성된 task/comment ID를 후속 테스트에서 사용
  let createdTaskId: string;
  let createdCommentId: string;

  describe("get_tasks", () => {
    it("should return task list", async () => {
      const result = await tools["get_tasks"]!.handler({
        project_id: config.projectId,
        page: 0,
        size: 5,
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
      expect(Array.isArray(data.result)).toBe(true);
    });
  });

  describe("create_task", () => {
    it("should create a new task", async () => {
      const result = await tools["create_task"]!.handler({
        project_id: config.projectId,
        subject: `[테스트] 통합 테스트 태스크 ${Date.now()}`,
        body: "이 태스크는 통합 테스트에서 자동 생성되었습니다.",
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
      createdTaskId = data.result.id;
      expect(createdTaskId).toBeDefined();
    });
  });

  describe("get_task_by_id", () => {
    it("should return task body content", async () => {
      const result = await tools["get_task_by_id"]!.handler({
        project_id: config.projectId,
        task_id: createdTaskId,
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain("통합 테스트에서 자동 생성");
    });
  });

  describe("update_task", () => {
    it("should update task body", async () => {
      const result = await tools["update_task"]!.handler({
        project_id: config.projectId,
        task_id: createdTaskId,
        body: "업데이트된 본문 내용입니다.",
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toBe("Successfully updated task body");
    });

    it("should verify updated content", async () => {
      const result = await tools["get_task_by_id"]!.handler({
        project_id: config.projectId,
        task_id: createdTaskId,
      });

      expect(result.content[0].text).toContain("업데이트된 본문");
    });
  });

  describe("create_task_comment", () => {
    it("should create a comment on the task", async () => {
      const result = await tools["create_task_comment"]!.handler({
        project_id: config.projectId,
        task_id: createdTaskId,
        body: "통합 테스트 코멘트입니다.",
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
      createdCommentId = data.result.id;
      expect(createdCommentId).toBeDefined();
    });
  });

  describe("get_task_comments", () => {
    it("should return comments list", async () => {
      const result = await tools["get_task_comments"]!.handler({
        project_id: config.projectId,
        task_id: createdTaskId,
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
      expect(Array.isArray(data.result)).toBe(true);
      expect(data.result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("get_task_comment_by_id", () => {
    it("should return a specific comment", async () => {
      const result = await tools["get_task_comment_by_id"]!.handler({
        project_id: config.projectId,
        task_id: createdTaskId,
        log_id: createdCommentId,
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
    });
  });

  describe("update_task_comment", () => {
    it("should update the comment", async () => {
      const result = await tools["update_task_comment"]!.handler({
        project_id: config.projectId,
        task_id: createdTaskId,
        log_id: createdCommentId,
        body: "업데이트된 코멘트입니다.",
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toBe("Successfully updated comment");
    });
  });

  describe("upload_task_attachment (307 리다이렉트 파일 업로드)", () => {
    let uploadedFileId: string;

    it("should upload a file via 307 redirect", async () => {
      // 간단한 텍스트 파일을 base64로 인코딩
      const testContent = "Hello, Dooray! 파일 업로드 통합 테스트입니다.";
      const base64Content = Buffer.from(testContent).toString("base64");

      const result = await tools["upload_task_attachment"]!.handler({
        project_id: config.projectId,
        task_id: createdTaskId,
        file_content_base64: base64Content,
        file_name: "integration-test.txt",
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.header.isSuccessful).toBe(true);
      uploadedFileId = data.result.id;
      expect(uploadedFileId).toBeDefined();
    });

    it("should download the uploaded file", async () => {
      const result = await tools["download_task_attachment"]!.handler({
        project_id: config.projectId,
        task_id: createdTaskId,
        file_id: uploadedFileId,
      });

      expect(result.isError).toBeUndefined();
      const decoded = Buffer.from(result.content[0].text, "base64").toString("utf-8");
      expect(decoded).toContain("파일 업로드 통합 테스트");
    });
  });
});
