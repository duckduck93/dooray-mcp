import axios, { type AxiosInstance } from "axios";

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
