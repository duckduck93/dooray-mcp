import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import FormData from "form-data";
import { axiosInstance, handleError } from "../client.js";

export function registerTaskTools(server: McpServer) {
  server.registerTool(
    "get_tasks",
    {
      description: "List tasks in a project",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        parent_post_id: z.string().optional().describe("Parent post ID to filter by"),
        page: z.number().optional().default(0).describe("Page number"),
        size: z.number().optional().default(20).describe("Number of items per page"),
      },
    },
    async ({ project_id, parent_post_id, page, size }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}/posts`, {
          params: { parentPostId: parent_post_id, page, size },
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
    "get_task_by_id",
    {
      description: "Get the content of a project task",
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
    "update_task",
    {
      description: "Update the content of a project task",
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
    "create_task",
    {
      description: "Create a new task in a project",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        subject: z.string().describe("Task subject"),
        body: z.string().describe("Task body content"),
      },
    },
    async ({ project_id, subject, body }) => {
      try {
        const response = await axiosInstance.post(`/project/v1/projects/${project_id}/posts`, {
          subject,
          body: {
            content: body,
            mimeType: "text/markdown",
          },
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
    "get_task_comments",
    {
      description: "Get comments (logs) of a project task",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        task_id: z.string().describe("Task ID"),
      },
    },
    async ({ project_id, task_id }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}/posts/${task_id}/logs`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(response.data, null, 2) }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "get_task_comment_by_id",
    {
      description: "Get a specific comment (log) of a project task",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        task_id: z.string().describe("Task ID"),
        log_id: z.string().describe("Log (Comment) ID"),
      },
    },
    async ({ project_id, task_id, log_id }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}/posts/${task_id}/logs/${log_id}`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(response.data, null, 2) }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "create_task_comment",
    {
      description: "Create a comment (log) in a project task",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        task_id: z.string().describe("Task ID"),
        body: z.string().describe("Comment body content"),
      },
    },
    async ({ project_id, task_id, body }) => {
      try {
        const response = await axiosInstance.post(`/project/v1/projects/${project_id}/posts/${task_id}/logs`, {
          body: { content: body, mimeType: "text/markdown" },
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
    "update_task_comment",
    {
      description: "Update a comment (log) in a project task",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        task_id: z.string().describe("Task ID"),
        log_id: z.string().describe("Log (Comment) ID"),
        body: z.string().describe("New comment body content"),
      },
    },
    async ({ project_id, task_id, log_id, body }) => {
      try {
        await axiosInstance.put(`/project/v1/projects/${project_id}/posts/${task_id}/logs/${log_id}`, {
          body: { content: body, mimeType: "text/markdown" },
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
    "download_task_attachment",
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
    "upload_task_attachment",
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
