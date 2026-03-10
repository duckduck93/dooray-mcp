import { describe, it, expect } from "vitest";
import axios from "axios";
import { axiosInstance, handleError } from "../client.js";

describe("client", () => {
  describe("axiosInstance", () => {
    it("should have correct baseURL", () => {
      expect(axiosInstance.defaults.baseURL).toBe("https://api.dooray.com");
    });

    it("should have Authorization header set", () => {
      expect(axiosInstance.defaults.headers["Authorization"]).toMatch(/^dooray-api .+/);
    });

    it("should have correct Content-Type header", () => {
      expect(axiosInstance.defaults.headers["Content-Type"]).toBe("application/json");
    });
  });

  describe("handleError", () => {
    it("should return error content for Axios errors with response data", async () => {
      const axiosError = new axios.AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
        data: { header: { description: "Project not found" } },
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {} as any,
      });

      const result = await handleError(axiosError);
      expect(result).toEqual({
        content: [{ type: "text", text: "Dooray API error: Project not found" }],
        isError: true,
      });
    });

    it("should fallback to error message if no response description", async () => {
      const axiosError = new axios.AxiosError("Network Error");

      const result = await handleError(axiosError);
      expect(result).toEqual({
        content: [{ type: "text", text: "Dooray API error: Network Error" }],
        isError: true,
      });
    });

    it("should re-throw non-Axios errors", async () => {
      const genericError = new Error("Something unexpected");
      await expect(handleError(genericError)).rejects.toThrow("Something unexpected");
    });
  });
});
