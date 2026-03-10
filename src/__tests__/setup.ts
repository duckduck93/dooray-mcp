import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// 필수 환경 변수 검증
const required = ["DOORAY_API_TOKEN", "TEST_PROJECT_ID", "TEST_WIKI_ID", "TEST_WIKI_PAGE_ID"];
const missing = required.filter((key) => !process.env[key] || process.env[key]!.startsWith("your-"));

if (missing.length > 0) {
  console.error(`\n❌ .env.test에 다음 환경 변수를 설정하세요: ${missing.join(", ")}\n`);
  process.exit(1);
}
