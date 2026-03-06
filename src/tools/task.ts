import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import FormData from "form-data";
import { axiosInstance, handleError } from "../client.js";

export function registerTaskTools(server: McpServer) {
  server.registerTool(
    "task_get_body",
    {
      description: "Get the body content of a project task",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        task_id: z.string().describe("Task ID"),
      },
    },
    async ({ project_id, task_id }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}/posts/${task_id}`);
        return {
          content: [{ type: "text" as const, text: response.data.result.content.body.content }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "task_update_body",
    {
      description: "Update the body content of a project task",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        task_id: z.string().describe("Task ID"),
        body: z.string().describe("New task body content"),
      },
    },
    async ({ project_id, task_id, body }) => {
      try {
        await axiosInstance.put(`/project/v1/projects/${project_id}/posts/${task_id}/body`, {
          content: body,
        });
        return {
          content: [{ type: "text" as const, text: "Successfully updated task body" }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "task_get_comments",
    {
      description: "Get comments of a project task",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        task_id: z.string().describe("Task ID"),
      },
    },
    async ({ project_id, task_id }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}/posts/${task_id}/comments`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(response.data, null, 2) }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "task_update_comment",
    {
      description: "Update a comment in a project task",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        task_id: z.string().describe("Task ID"),
        comment_id: z.string().describe("Comment ID"),
        body: z.string().describe("New comment body content"),
      },
    },
    async ({ project_id, task_id, comment_id, body }) => {
      try {
        await axiosInstance.put(`/project/v1/projects/${project_id}/posts/${task_id}/comments/${comment_id}`, {
          content: { body: { content: body, mimeType: "text/markdown" } },
        });
        return {
          content: [{ type: "text" as const, text: "Successfully updated comment" }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "task_download_attachment",
    {
      description: "Download an attachment from a project task",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        task_id: z.string().describe("Task ID"),
        file_id: z.string().describe("Attachment File ID"),
      },
    },
    async ({ project_id, task_id, file_id }) => {
      try {
        const response = await axiosInstance.get(
          `/project/v1/projects/${project_id}/posts/${task_id}/attachments/${file_id}`,
          { responseType: "arraybuffer" },
        );
        const base64Content = Buffer.from(response.data).toString("base64");
        return {
          content: [{ type: "text" as const, text: base64Content }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "task_upload_attachment",
    {
      description: "Upload an attachment to a project task",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        task_id: z.string().describe("Task ID"),
        file_content_base64: z.string().describe("Base64 encoded file content"),
        file_name: z.string().describe("Name of the file"),
      },
    },
    async ({ project_id, task_id, file_content_base64, file_name }) => {
      try {
        const fileBuffer = Buffer.from(file_content_base64, "base64");
        const formData = new FormData();
        formData.append("file", fileBuffer, { filename: file_name });

        const response = await axiosInstance.post(
          `/project/v1/projects/${project_id}/posts/${task_id}/attachments`,
          formData,
          { headers: formData.getHeaders() },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(response.data, null, 2) }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );
}
