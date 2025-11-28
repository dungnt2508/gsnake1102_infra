# postgresql
- users, personas, articles, fetch_schedule, tool_requests

1. users
| Column        | Type      | Notes                             |
| ------------- | --------- | --------------------------------- |
| id            | UUID PK   |                                   |
| email         | VARCHAR   | unique                            |
| password_hash | VARCHAR   | nullable (OAuth user có thể null) |
| azure_id      | VARCHAR   | nullable                          |
| created_at    | TIMESTAMP |                                   |
| updated_at    | TIMESTAMP |                                   |

2. personas
| Column          | Type                | Notes                |
| --------------- | ------------------- | -------------------- |
| id              | UUID PK             |                      |
| user_id         | UUID FK → users(id) |                      |
| language_style  | VARCHAR             | formal, casual, etc. |
| tone            | VARCHAR             | witty, neutral, etc. |
| topics_interest | JSONB               | list of topics       |
| created_at      | TIMESTAMP           |                      |
| updated_at      | TIMESTAMP           |                      |

3. articles
| Column      | Type                | Notes                               |
| ----------- | ------------------- | ----------------------------------- |
| id          | UUID PK             |                                     |
| url         | VARCHAR             | unique                              |
| title       | VARCHAR             |                                     |
| fetched_at  | TIMESTAMP           |                                     |
| summary     | TEXT                | optional, cached summary            |
| source      | VARCHAR             | domain                              |
| user_id     | UUID FK → users(id) | owner of request                    |
| workflow_id | UUID                | n8n workflow instance id (optional) |
| status      | ENUM                | pending, processing, done, failed   |

4. fetch_schedule
| Column       | Type                | Notes                               |
| ------------ | ------------------- | ----------------------------------- |
| id           | UUID PK             |                                     |
| user_id      | UUID FK → users(id) |                                     |
| article_url  | VARCHAR             |                                     |
| frequency    | INTERVAL            | daily, weekly, etc.                 |
| last_fetched | TIMESTAMP           |                                     |
| next_fetch   | TIMESTAMP           | calculated                          |
| workflow_id  | UUID                | n8n workflow instance id (optional) |

5. tool_requests
| Column          | Type                | Notes                             |
| --------------- | ------------------- | --------------------------------- |
| id              | UUID PK             |                                   |
| user_id         | UUID FK → users(id) |                                   |
| request_payload | JSONB               | input to generate tool            |
| status          | ENUM                | pending, processing, done, failed |
| result          | JSONB               | output tool or link               |
| workflow_id     | UUID                | n8n workflow instance id          |
| created_at      | TIMESTAMP           |                                   |
| updated_at      | TIMESTAMP           |                                   |


## Lưu ý:

- Trường workflow_id giúp tracking trạng thái job do n8n xử lý.
- status dùng để UI hiển thị trạng thái thực thi workflow.
- Giữ lịch sử và metadata đủ để audit và mở rộng modular tool sau này.


## Redis: cache, session, rate limit, queue support

- Redis dùng để lưu các thông tin tạm thời
    - cache: lưu metadata, lịch sử tóm tắt, tool request
    - session: lưu session user
    - rate limit: lưu rate limit user
    - queue support: lưu queue job