# Plan triển khai (với n8n tích hợp):

## Phase 1 – Core:

Login/register + persona per-user

Tóm tắt bài báo theo URL (user submit → Backend lưu → trigger n8n workflow → fetch → LLM → lưu summary)

Lưu metadata, tóm tắt, trạng thái workflow trong DB

## Phase 2 – Scheduler + OAuth:

Fetch tóm tắt theo chu kỳ/tần suất user qua n8n repeatable workflow

Hỗ trợ login bằng Azure OAuth

Cache summary & rate limiting

## Phase 3 – Toolbox + nâng cao UX:

Hộp thư nhận request tạo tool theo user, workflow xử lý tool generation

Streaming token trong chat (WebSocket/SSE)

UI quản lý persona nâng cao (chỉnh tone, style)

Mở rộng tool mới bằng workflow n8n modular