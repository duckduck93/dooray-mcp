import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

const DOORAY_API_TOKEN = process.env.DOORAY_API_TOKEN;
const DOORAY_API_BASE_URL = "https://api.dooray.com";

if (!DOORAY_API_TOKEN) {
  console.error("DOORAY_API_TOKEN environment variable is required");
  process.exit(1);
}

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: DOORAY_API_BASE_URL,
  headers: {
    Authorization: `dooray-api ${DOORAY_API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

/**
 * Dooray 파일 API는 307 리다이렉트를 반환하며,
 * 리다이렉트된 URL로 Authorization 헤더와 body를 포함하여 재요청해야 합니다.
 */
export async function fileApiRequest(
  method: "get" | "post" | "put",
  path: string,
  config?: AxiosRequestConfig,
  data?: any,
) {
  const authHeader = `dooray-api ${DOORAY_API_TOKEN}`;

  // 1단계: body(data) 없이 요청하여 307 리다이렉트 URL 획득
  // params 등 config는 포함하되, FormData(body)는 제외 (스트림 소비 방지)
  const { headers: _headers, ...configWithoutHeaders } = config ?? {};
  const initialResponse = await axiosInstance.request({
    method,
    url: path,
    ...configWithoutHeaders,
    maxRedirects: 0,
    validateStatus: (status) => (status >= 200 && status < 400) || status === 307,
  });

  // 307이 아니면 정상 응답 반환
  if (initialResponse.status !== 307) {
    return initialResponse;
  }

  // 2단계: location 헤더로 Authorization + body 포함하여 재요청
  const redirectUrl = initialResponse.headers.location;
  if (!redirectUrl) {
    throw new Error("307 redirect received but no location header found");
  }

  const response = await axios.request({
    method,
    url: redirectUrl,
    data,
    ...config,
    headers: {
      Authorization: authHeader,
      ...config?.headers,
    },
  });
  return response;
}

export async function handleError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Dooray API error: ${error.response?.data?.header?.description || error.message}`,
        },
      ],
      isError: true,
    };
  }
  throw error;
}
