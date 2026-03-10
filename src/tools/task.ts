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
        parent_post_id: z.string().optional().describe("Parent post ID to filter subtasks"),
        page: z.number().optional().default(0).describe("Page number (0-based)"),
        size: z.number().optional().default(20).describe("Number of items per page (max 100)"),
        order: z.string().optional().describe("Sort field. e.g. createdAt, -createdAt, postUpdatedAt, -postUpdatedAt, postDueAt, -postDueAt (prefix - for descending)"),
        post_workflow_classes: z.string().optional().describe("Filter by workflow class. Comma-separated: backlog, registered, working, closed"),
        tag_ids: z.string().optional().describe("Filter by tag IDs (comma-separated)"),
        milestone_ids: z.string().optional().describe("Filter by milestone IDs (comma-separated)"),
        to_member_ids: z.string().optional().describe("Filter by assignee member IDs (comma-separated)"),
        from_member_ids: z.string().optional().describe("Filter by creator member IDs (comma-separated)"),
        cc_member_ids: z.string().optional().describe("Filter by watcher/CC member IDs (comma-separated)"),
        post_workflow_ids: z.string().optional().describe("Filter by workflow IDs (comma-separated)"),
        created_at: z.string().optional().describe("Filter by creation date. e.g. today, thisweek, prev-7d, next-3d, or ISO8601 range"),
        updated_at: z.string().optional().describe("Filter by update date. Same format as created_at"),
        due_at: z.string().optional().describe("Filter by due date. Same format as created_at"),
      },
    },
    async ({ project_id, parent_post_id, page, size, order, post_workflow_classes, tag_ids, milestone_ids, to_member_ids, from_member_ids, cc_member_ids, post_workflow_ids, created_at, updated_at, due_at }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}/posts`, {
          params: {
            parentPostId: parent_post_id,
            page,
            size,
            order,
            postWorkflowClasses: post_workflow_classes,
            tagIds: tag_ids,
            milestoneIds: milestone_ids,
            toMemberIds: to_member_ids,
            fromMemberIds: from_member_ids,
            ccMemberIds: cc_member_ids,
            postWorkflowIds: post_workflow_ids,
            createdAt: created_at,
            updatedAt: updated_at,
            dueAt: due_at,
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
          content: [{ type: "text" as const, text: response.data.result.body.content }],
        };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  server.registerTool(
    "update_task",
    {
      description: "Update a project task",
      inputSchema: {
        project_id: z.string().describe("Project ID"),
        task_id: z.string().describe("Task ID"),
        subject: z.string().optional().describe("New task subject"),
        body: z.string().optional().describe("New task body content"),
        due_date: z.string().optional().describe("Due date in ISO8601 format"),
        priority: z.enum(["highest", "high", "normal", "low", "lowest", "none"]).optional().describe("Task priority"),
        milestone_id: z.string().optional().describe("Milestone/Phase ID"),
        tag_ids: z.array(z.string()).optional().describe("Array of tag IDs to assign"),
      },
    },
    async ({ project_id, task_id, subject, body, due_date, priority, milestone_id, tag_ids }) => {
      try {
        await axiosInstance.put(`/project/v1/projects/${project_id}/posts/${task_id}`, {
          ...(subject && { subject }),
          ...(body && { body: { mimeType: "text/x-markdown", content: body } }),
          ...(due_date && { dueDate: due_date, dueDateFlag: true }),
          ...(priority && { priority }),
          ...(milestone_id && { milestoneId: milestone_id }),
          ...(tag_ids && { tagIds: tag_ids }),
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
        parent_post_id: z.string().optional().describe("Parent post ID (for creating subtasks)"),
        due_date: z.string().optional().describe("Due date in ISO8601 format"),
        priority: z.enum(["highest", "high", "normal", "low", "lowest", "none"]).optional().describe("Task priority"),
        milestone_id: z.string().optional().describe("Milestone/Phase ID"),
        tag_ids: z.array(z.string()).optional().describe("Array of tag IDs to assign"),
      },
    },
    async ({ project_id, subject, body, parent_post_id, due_date, priority, milestone_id, tag_ids }) => {
      try {
        const response = await axiosInstance.post(`/project/v1/projects/${project_id}/posts`, {
          subject,
          body: {
            content: body,
            mimeType: "text/x-markdown",
          },
          ...(parent_post_id && { parentPostId: parent_post_id }),
          ...(due_date && { dueDate: due_date, dueDateFlag: true }),
          ...(priority && { priority }),
          ...(milestone_id && { milestoneId: milestone_id }),
          ...(tag_ids && { tagIds: tag_ids }),
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
        page: z.number().optional().default(0).describe("Page number (0-based)"),
        size: z.number().optional().default(20).describe("Number of items per page (max 100)"),
        order: z.string().optional().describe("Sort field. createdAt (oldest first, default) or -createdAt (newest first)"),
      },
    },
    async ({ project_id, task_id, page, size, order }) => {
      try {
        const response = await axiosInstance.get(`/project/v1/projects/${project_id}/posts/${task_id}/logs`, {
          params: { page, size, order },
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
          body: { content: body, mimeType: "text/x-markdown" },
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
          body: { content: body, mimeType: "text/x-markdown" },
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
          `/project/v1/projects/${project_id}/posts/${task_id}/files/${file_id}`,
          { params: { media: "raw" }, responseType: "arraybuffer" },
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
          `/project/v1/projects/${project_id}/posts/${task_id}/files`,
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
