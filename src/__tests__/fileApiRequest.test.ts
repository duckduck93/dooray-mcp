import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import FormData from "form-data";
import { axiosInstance, fileApiRequest } from "../client.js";

// axios.request와 axiosInstance.request를 spy
vi.spyOn(axiosInstance, "request");
vi.spyOn(axios, "request");

beforeEach(() => {
  vi.mocked(axiosInstance.request).mockReset();
  vi.mocked(axios.request).mockReset();
});

describe("fileApiRequest", () => {
  const REDIRECT_URL = "https://file-api.dooray.com/uploads/project/v1/projects/123/posts/456/files";

  describe("307 리다이렉트 처리 (업로드)", () => {
    it("1단계 요청에 body를 포함하지 않아야 한다", async () => {
      const formData = new FormData();
      formData.append("file", Buffer.from("test"), { filename: "test.txt" });

      vi.mocked(axiosInstance.request).mockResolvedValueOnce({
        status: 307,
        headers: { location: REDIRECT_URL },
        data: null,
      });
      vi.mocked(axios.request).mockResolvedValueOnce({
        status: 200,
        data: { header: { isSuccessful: true }, result: { id: "789" } },
      });

      await fileApiRequest("post", "/project/v1/projects/123/posts/456/files", { headers: formData.getHeaders() }, formData);

      // 1단계: body 없이 요청
      const firstCall = vi.mocked(axiosInstance.request).mock.calls[0]![0]!;
      expect(firstCall).not.toHaveProperty("data");
      expect(firstCall.maxRedirects).toBe(0);
      expect(firstCall.method).toBe("post");
    });

    it("2단계 요청에 리다이렉트 URL + Authorization + body를 포함해야 한다", async () => {
      const formData = new FormData();
      formData.append("file", Buffer.from("test-content"), { filename: "image.png" });

      vi.mocked(axiosInstance.request).mockResolvedValueOnce({
        status: 307,
        headers: { location: REDIRECT_URL },
        data: null,
      });
      vi.mocked(axios.request).mockResolvedValueOnce({
        status: 200,
        data: { header: { isSuccessful: true }, result: { id: "789" } },
      });

      await fileApiRequest("post", "/project/v1/projects/123/posts/456/files", { headers: formData.getHeaders() }, formData);

      // 2단계: 리다이렉트 URL로 재요청
      const secondCall = vi.mocked(axios.request).mock.calls[0]![0]!;
      expect(secondCall.url).toBe(REDIRECT_URL);
      expect(secondCall.method).toBe("post");
      expect(secondCall.data).toBe(formData); // FormData body 포함
      expect(secondCall.headers).toHaveProperty("Authorization");
      expect(secondCall.headers!["Authorization"]).toMatch(/^dooray-api .+/);
    });

    it("2단계 요청에 multipart Content-Type 헤더가 포함되어야 한다", async () => {
      const formData = new FormData();
      formData.append("file", Buffer.from("data"), { filename: "doc.pdf" });

      vi.mocked(axiosInstance.request).mockResolvedValueOnce({
        status: 307,
        headers: { location: REDIRECT_URL },
        data: null,
      });
      vi.mocked(axios.request).mockResolvedValueOnce({
        status: 200,
        data: { header: { isSuccessful: true } },
      });

      await fileApiRequest("post", "/project/v1/projects/123/posts/456/files", { headers: formData.getHeaders() }, formData);

      const secondCall = vi.mocked(axios.request).mock.calls[0]![0]!;
      expect(secondCall.headers!["content-type"]).toMatch(/multipart\/form-data/);
    });
  });

  describe("307 리다이렉트 처리 (다운로드)", () => {
    it("GET 요청도 307 리다이렉트를 정상 처리해야 한다", async () => {
      const fileBuffer = Buffer.from("file-binary-content");

      vi.mocked(axiosInstance.request).mockResolvedValueOnce({
        status: 307,
        headers: { location: REDIRECT_URL },
        data: null,
      });
      vi.mocked(axios.request).mockResolvedValueOnce({
        status: 200,
        data: fileBuffer,
      });

      const result = await fileApiRequest("get", "/project/v1/projects/123/posts/456/files/789", {
        params: { media: "raw" },
        responseType: "arraybuffer",
      });

      expect(result.data).toBe(fileBuffer);

      const secondCall = vi.mocked(axios.request).mock.calls[0]![0]!;
      expect(secondCall.url).toBe(REDIRECT_URL);
      expect(secondCall.method).toBe("get");
      expect(secondCall.responseType).toBe("arraybuffer");
      expect(secondCall.headers).toHaveProperty("Authorization");
    });
  });

  describe("307이 아닌 경우", () => {
    it("정상 응답(200)은 그대로 반환해야 한다", async () => {
      vi.mocked(axiosInstance.request).mockResolvedValueOnce({
        status: 200,
        data: { result: "ok" },
      });

      const result = await fileApiRequest("get", "/some/path");

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ result: "ok" });
      // axios.request (2단계)는 호출되지 않아야 함
      expect(axios.request).not.toHaveBeenCalled();
    });
  });

  describe("에러 케이스", () => {
    it("307 응답에 location 헤더가 없으면 에러를 던져야 한다", async () => {
      vi.mocked(axiosInstance.request).mockResolvedValueOnce({
        status: 307,
        headers: {},
        data: null,
      });

      await expect(
        fileApiRequest("post", "/project/v1/projects/123/posts/456/files", {}, new FormData()),
      ).rejects.toThrow("307 redirect received but no location header found");
    });
  });

  describe("FormData 스트림 보존 검증", () => {
    it("FormData가 1단계에서 소비되지 않고 2단계에서만 전달되어야 한다", async () => {
      const formData = new FormData();
      const testContent = "stream-preservation-test";
      formData.append("file", Buffer.from(testContent), { filename: "test.txt" });

      vi.mocked(axiosInstance.request).mockResolvedValueOnce({
        status: 307,
        headers: { location: REDIRECT_URL },
        data: null,
      });
      vi.mocked(axios.request).mockResolvedValueOnce({
        status: 200,
        data: { header: { isSuccessful: true } },
      });

      await fileApiRequest("post", "/project/v1/projects/123/posts/456/files", { headers: formData.getHeaders() }, formData);

      // 1단계: data 프로퍼티 자체가 없어야 함
      const firstCallConfig = vi.mocked(axiosInstance.request).mock.calls[0]![0]!;
      expect("data" in firstCallConfig).toBe(false);

      // 2단계: 동일한 FormData 객체가 전달되어야 함
      const secondCallConfig = vi.mocked(axios.request).mock.calls[0]![0]!;
      expect(secondCallConfig.data).toBe(formData);
    });
  });
});
