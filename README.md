# Dooray MCP Server

Dooray! API를 통해 프로젝트, 업무(Task), 위키(Wiki) 정보를 관리할 수 있는 Model Context Protocol (MCP) 서버입니다.

## 설치 방법

### 필수 요구 사항
- Node.js (v18 이상 권장)
- npm

### 설치 및 빌드
```bash
# 의존성 설치
npm install

# 프로젝트 빌드
npm run build
```

## 설정

Dooray! API 토큰이 필요합니다. 환경 변수로 `DOORAY_API_TOKEN`을 설정해야 합니다.

### 환경 변수 설정
```bash
export DOORAY_API_TOKEN='your-api-token-here'
```

### Claude Desktop 설정 (MacOS 기준)
`~/Library/Application Support/Claude/claude_desktop_config.json` 파일에 다음 설정을 추가합니다:

```json
{
  "mcpServers": {
    "dooray": {
      "command": "node",
      "args": ["/path/to/dooray-mcp/dist/index.js"],
      "env": {
        "DOORAY_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

## 제공되는 도구 (Tools)

### 프로젝트 (Project)
- `project_get_info`: 프로젝트의 태그, 상태, 멤버, ID 등 정보를 가져옵니다.
  - `project_id`: 프로젝트 ID 또는 이름

### 업무 (Task)
- `task_get_body`: 특정 업무의 본문 내용을 가져옵니다.
  - `project_id`, `task_id`
- `task_update_body`: 특정 업무의 본문 내용을 수정합니다.
  - `project_id`, `task_id`, `body`
- `task_get_comments`: 업무에 달린 댓글(로그) 목록을 가져옵니다.
  - `project_id`, `task_id`
- `task_get_comment`: 특정 댓글(로그)의 정보를 가져옵니다.
  - `project_id`, `task_id`, `log_id`
- `task_create_comment`: 업무에 댓글(로그)을 작성합니다.
  - `project_id`, `task_id`, `body`
- `task_update_comment`: 특정 댓글(로그)의 내용을 수정합니다.
  - `project_id`, `task_id`, `log_id`, `body`
- `task_download_attachment`: 업무의 첨부파일을 다운로드합니다 (Base64 인코딩).
  - `project_id`, `task_id`, `file_id`
- `task_upload_attachment`: 업무에 첨부파일을 업로드합니다.
  - `project_id`, `task_id`, `file_content_base64`, `file_name`

### 위키 (Wiki)
- `wiki_get_body`: 특정 위키의 본문 내용을 가져옵니다.
  - `project_id`, `wiki_id`
- `wiki_update_body`: 특정 위키의 본문 내용을 수정합니다.
  - `project_id`, `wiki_id`, `body`

## 개발 스크립트
- `npm run build`: TypeScript 코드를 dist 폴더로 컴파일합니다.
- `npm run dev`: `ts-node`를 사용하여 개발 모드로 실행합니다.
- `npm run lint`: ESLint를 사용하여 코드 스타일을 검사합니다.
