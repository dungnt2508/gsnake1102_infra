# Phân tích và Đề xuất Revised Flow: Upload & Publish Sản phẩm Marketplace

## (A) CHECKLIST CÁC VẤN ĐỀ / RỦI RO / THIẾU SÓT HIỆN TẠI

### 1. Schema Database

#### 1.1. Vấn đề về Product Types
- ❌ **Thiếu loại sản phẩm**: Chỉ hỗ trợ `workflow`, `tool`, `integration`. Thiếu `website` và `mobile_app`
- ❌ **Không có bảng con**: Tất cả loại sản phẩm dùng chung bảng `products`, không có bảng con riêng để lưu metadata cụ thể
- ❌ **Metadata chung quá đơn giản**: Trường `metadata JSONB` không có structure rõ ràng, dễ gây lỗi khi query và validate
- ❌ **Thiếu các trường quan trọng**: 
  - Không có `changelog`, `license`, `author_contact`, `support_url`
  - Không có `platform_requirements` cụ thể (OS, SDK version, etc.)
  - Không có `screenshots` array (chỉ có 1 `preview_image_url`)

#### 1.2. Vấn đề về Artefact Storage
- ❌ **Thiếu bảng lưu artefact**: Không có bảng `product_artifacts` để lưu nhiều file (workflow.json, .env.example, README.md, source ZIP, APK/IPA, etc.)
- ❌ **URL-based storage**: Hiện tại chỉ lưu URL, không có cơ chế upload trực tiếp vào storage (S3, local storage)
- ❌ **Versioning**: Không có cơ chế versioning cho artefact (v1.0.0, v1.1.0 có thể download cùng lúc)
- ❌ **File validation**: Không validate format file, size, checksum

#### 1.3. Vấn đề về Review System
- ❌ **Thiếu audit log**: Không có bảng `product_review_audit_log` để track lịch sử review (ai review, khi nào, lý do, etc.)
- ⚠️ **Review process chưa đầy đủ**: Chưa có checklist cụ thể cho admin/moderator khi review
- ❌ **Thiếu automated checks**: Không có automated validation (malware scan, license check, copyright check)

### 2. Backend API & Validation

#### 2.1. Upload & File Handling
- ❌ **Không có endpoint upload file**: Chỉ nhận URL, không có `/api/products/:id/upload-artifact` để upload trực tiếp
- ❌ **Thiếu multipart/form-data support**: Chưa xử lý upload nhiều files cùng lúc
- ❌ **Thiếu file validation**: 
  - Không check file size limits
  - Không check MIME types
  - Không validate workflow JSON structure
  - Không check APK/IPA signature
- ❌ **Thiếu file storage service**: Không có service để lưu file vào S3/local storage

#### 2.2. Product Type-specific Validation
- ❌ **Không có validation riêng theo type**:
  - Workflow: Không validate JSON schema, không check n8n version compatibility
  - Tool: Không validate manifest structure, không check dependencies
  - Integration: Không validate connector schema
  - Website/Mobile App: Chưa có (chưa hỗ trợ)

#### 2.3. Business Logic
- ⚠️ **State machine chưa đầy đủ**: Có `ProductStateMachine` nhưng chưa cover hết các edge cases
- ❌ **Thiếu validation về quyền sở hữu**: Không check seller có quyền phân phối sản phẩm
- ❌ **Thiếu validation pháp lý**: Không check license, không check copyright infringement

### 3. Frontend

#### 3.1. Upload UI
- ❌ **Không có UI upload file**: Form chỉ có input URL, không có drag-and-drop upload
- ❌ **Thiếu progress indicator**: Không hiển thị progress khi upload file lớn
- ❌ **Thiếu preview**: Không preview file trước khi submit (workflow JSON, images, etc.)

#### 3.2. Product Type-specific Forms
- ⚠️ **Form chung cho tất cả types**: Cùng một form cho workflow, tool, integration → thiếu fields cụ thể
- ❌ **Thiếu conditional fields**: Không hiển thị fields riêng theo type (ví dụ: workflow cần `.env.example`, tool cần `manifest.json`)
- ❌ **Thiếu file upload multiple**: Không upload nhiều files (workflow.json + README.md + .env.example)

#### 3.3. Validation UX
- ⚠️ **Validation message chưa rõ ràng**: Một số error message chưa guide user cách fix
- ❌ **Thiếu inline validation**: Không validate real-time khi user nhập

### 4. Security & Legal

#### 4.1. Quyền Sở Hữu
- ❌ **Không có mechanism verify ownership**: Không yêu cầu seller cung cấp proof of ownership (license, copyright, etc.)
- ❌ **Thiếu declaration**: Không có form để seller declare rằng họ có quyền phân phối

#### 4.2. Malware & Security
- ❌ **Không scan malware**: Không có service để scan APK/IPA, ZIP files cho malware
- ❌ **Không validate code**: Không check code trong tool/workflow có chứa malicious code không

#### 4.3. Pháp lý
- ❌ **Không check license compliance**: Không validate license type (MIT, GPL, proprietary) và compliance
- ❌ **Thiếu terms & conditions**: Không có T&C cho seller khi upload
- ❌ **Thiếu privacy policy check**: Không check sản phẩm có vi phạm privacy policy không (GDPR, etc.)

#### 4.4. Dữ liệu nhạy cảm
- ❌ **Không scan credentials**: Không check `.env` files, config files có chứa API keys, passwords không
- ❌ **Thiếu data sanitization**: Không clean sensitive data trước khi lưu

### 5. Rate Limiting & Performance

#### 5.1. Rate Limiting
- ⚠️ **Chưa có rate limit cho upload**: Chưa limit số lượng upload per user per day
- ❌ **Thiếu rate limit theo file size**: Chưa limit tổng size upload per user

#### 5.2. Caching
- ❌ **Thiếu cache cho product list**: Chưa cache popular products, featured products
- ❌ **Thiếu CDN**: Chưa dùng CDN cho images, thumbnails

#### 5.3. Error Handling
- ⚠️ **Error handling chưa đầy đủ**: Một số error cases chưa được handle (network timeout, storage full, etc.)

### 6. Integration & Workflow

#### 6.1. n8n Integration
- ❌ **Không có workflow để auto-validate**: Không có n8n workflow để validate workflow JSON structure
- ❌ **Thiếu auto-test**: Không có cơ chế auto-test workflow sau khi upload

#### 6.2. External Services
- ❌ **Thiếu integration với antivirus API**: Chưa tích hợp với ClamAV hoặc VirusTotal để scan files
- ❌ **Thiếu integration với license checker**: Chưa có service để check license validity

---

## (B) REVISED FLOW CHI TIẾT - STEP BY STEP

### B.1. Database Schema Revised

#### B.1.1. Update `products` table (core)

```sql
-- Bổ sung các trường mới vào bảng products
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS changelog TEXT,
    ADD COLUMN IF NOT EXISTS license VARCHAR(50), -- 'MIT', 'GPL', 'proprietary', etc.
    ADD COLUMN IF NOT EXISTS author_contact VARCHAR(500), -- email hoặc website
    ADD COLUMN IF NOT EXISTS support_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS screenshots JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    ADD COLUMN IF NOT EXISTS platform_requirements JSONB DEFAULT '{}'::jsonb, -- {os: 'windows', min_version: '10', etc.}
    ADD COLUMN IF NOT EXISTS ownership_declaration BOOLEAN DEFAULT false, -- Seller đã declare ownership
    ADD COLUMN IF NOT EXISTS ownership_proof_url VARCHAR(500), -- URL to proof document (optional)
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP, -- Khi seller accept T&C
    ADD COLUMN IF NOT EXISTS security_scan_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'passed', 'failed'
    ADD COLUMN IF NOT EXISTS security_scan_result JSONB, -- Scan results
    ADD COLUMN IF NOT EXISTS security_scan_at TIMESTAMP;

-- Update product_type enum để thêm website và mobile_app
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'website';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'mobile_app';
```

#### B.1.2. Tạo bảng `product_artifacts` (lưu files/artifacts)

```sql
-- Bảng lưu các artefact của sản phẩm (workflow.json, README.md, source ZIP, APK, etc.)
CREATE TABLE IF NOT EXISTS product_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    artifact_type VARCHAR(50) NOT NULL, -- 'workflow_json', 'readme', 'env_example', 'source_zip', 'apk', 'ipa', 'manifest', etc.
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL, -- URL to file storage (S3, local, etc.)
    file_size BIGINT, -- bytes
    mime_type VARCHAR(100),
    checksum VARCHAR(64), -- SHA256 checksum
    version VARCHAR(50), -- Version của artifact này
    is_primary BOOLEAN DEFAULT false, -- Artifact chính (workflow.json cho workflow, APK cho mobile app)
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_artifacts_product_id ON product_artifacts(product_id);
CREATE INDEX idx_product_artifacts_type ON product_artifacts(artifact_type);
CREATE INDEX idx_product_artifacts_primary ON product_artifacts(product_id, is_primary) WHERE is_primary = true;
```

#### B.1.3. Tạo bảng con theo Product Type

**a) `product_workflows` table:**

```sql
CREATE TABLE IF NOT EXISTS product_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    n8n_version VARCHAR(50), -- Required n8n version (e.g., "1.0.0")
    workflow_json_url TEXT, -- URL to workflow.json (hoặc reference artifact_id)
    env_example_url TEXT, -- URL to .env.example
    readme_url TEXT, -- URL to README.md
    workflow_file_checksum VARCHAR(64), -- SHA256 của workflow.json
    nodes_count INTEGER, -- Số lượng nodes trong workflow
    triggers JSONB, -- Array of trigger types ['webhook', 'schedule', etc.]
    credentials_required JSONB DEFAULT '[]'::jsonb, -- Array of required credentials ['openai', 'notion', etc.]
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_workflows_product_id ON product_workflows(product_id);
```

**b) `product_tools` table:**

```sql
CREATE TABLE IF NOT EXISTS product_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    manifest_url TEXT, -- URL to manifest.json
    source_code_url TEXT, -- URL to source ZIP
    install_script_url TEXT, -- URL to install.sh/install.ps1
    test_scripts_url TEXT, -- URL to test suite
    programming_language VARCHAR(50), -- 'javascript', 'python', 'go', etc.
    runtime_requirements JSONB, -- {node_version: '18+', python_version: '3.9+', etc.}
    dependencies JSONB DEFAULT '[]'::jsonb, -- Array of dependencies
    entry_point VARCHAR(500), -- Main entry point (index.js, main.py, etc.)
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_tools_product_id ON product_tools(product_id);
```

**c) `product_integrations` table:**

```sql
CREATE TABLE IF NOT EXISTS product_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    connector_schema_url TEXT, -- URL to connector schema JSON
    example_workflows JSONB DEFAULT '[]'::jsonb, -- Array of example workflow URLs/IDs
    api_version VARCHAR(50), -- API version supported
    authentication_method VARCHAR(50), -- 'oauth2', 'api_key', 'basic', etc.
    platforms_supported JSONB DEFAULT '[]'::jsonb, -- ['n8n', 'make', 'zapier', etc.]
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_integrations_product_id ON product_integrations(product_id);
```

**d) `product_websites` table:**

```sql
CREATE TABLE IF NOT EXISTS product_websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    source_code_url TEXT, -- URL to source ZIP
    framework VARCHAR(100), -- 'nextjs', 'react', 'vue', 'plain_html', etc.
    build_command TEXT, -- 'npm run build', 'yarn build', etc.
    deploy_guide_url TEXT, -- URL to deploy guide document
    dependencies JSONB DEFAULT '[]'::jsonb, -- package.json dependencies
    environment_variables JSONB DEFAULT '{}'::jsonb, -- Required env vars
    demo_url VARCHAR(500), -- Live demo URL (optional)
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_websites_product_id ON product_websites(product_id);
```

**e) `product_mobile_apps` table:**

```sql
CREATE TABLE IF NOT EXISTS product_mobile_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    apk_url TEXT, -- For Android
    ipa_url TEXT, -- For iOS
    app_id VARCHAR(200), -- Package name / Bundle ID
    min_sdk_version INTEGER, -- Minimum Android SDK version
    min_ios_version VARCHAR(20), -- Minimum iOS version (e.g., '14.0')
    source_code_url TEXT, -- Optional: source code URL
    screenshots JSONB DEFAULT '[]'::jsonb, -- Array of screenshot URLs
    permissions_required JSONB DEFAULT '[]'::jsonb, -- Android permissions, iOS capabilities
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_mobile_apps_product_id ON product_mobile_apps(product_id);
```

#### B.1.4. Tạo bảng `product_review_audit_log`

```sql
CREATE TABLE IF NOT EXISTS product_review_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'approved', 'rejected', 'requested_changes', 'flagged'
    review_status_before VARCHAR(20), -- Status trước khi review
    review_status_after VARCHAR(20), -- Status sau khi review
    reason TEXT, -- Lý do approve/reject
    checklist_items JSONB, -- Checklist items checked: {ownership_verified: true, security_scan_passed: true, etc.}
    notes TEXT, -- Additional notes
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_review_audit_log_product_id ON product_review_audit_log(product_id);
CREATE INDEX idx_product_review_audit_log_reviewer_id ON product_review_audit_log(reviewer_id);
CREATE INDEX idx_product_review_audit_log_created_at ON product_review_audit_log(created_at DESC);
```

### B.2. Backend API Revised

#### B.2.1. File Upload Endpoints

```typescript
// POST /api/products/:id/artifacts/upload
// Upload một hoặc nhiều artifacts (multipart/form-data)
// Request:
//   - files: File[] (workflow.json, README.md, .env.example, etc.)
//   - artifact_type: string ('workflow_json', 'readme', 'env_example', etc.)
//   - version: string (optional)
//   - is_primary: boolean (optional)

// GET /api/products/:id/artifacts
// List tất cả artifacts của product

// DELETE /api/products/:id/artifacts/:artifactId
// Xóa một artifact

// POST /api/products/:id/artifacts/:artifactId/download
// Download artifact (với permission check)
```

#### B.2.2. Product Type-specific Endpoints

```typescript
// Workflow
// POST /api/products/:id/workflow-details
// Body: { n8n_version, workflow_json_url, env_example_url, etc. }

// Tool
// POST /api/products/:id/tool-details
// Body: { manifest_url, source_code_url, programming_language, etc. }

// Integration
// POST /api/products/:id/integration-details
// Body: { connector_schema_url, platforms_supported, etc. }

// Website
// POST /api/products/:id/website-details
// Body: { source_code_url, framework, deploy_guide_url, etc. }

// Mobile App
// POST /api/products/:id/mobile-app-details
// Body: { apk_url, ipa_url, app_id, min_sdk_version, etc. }
```

#### B.2.3. Review & Security Endpoints

```typescript
// POST /api/admin/products/:id/review
// Body: {
//   action: 'approve' | 'reject' | 'request_changes',
//   checklist: { ownership_verified: boolean, security_scan_passed: boolean, ... },
//   reason: string
// }

// POST /api/products/:id/security-scan
// Trigger security scan (malware, credentials, etc.)

// GET /api/products/:id/security-scan-status
// Get security scan status and results
```

#### B.2.4. Validation Middleware

```typescript
// validateProductTypeSpecific(data, type)
// Validate dữ liệu theo từng product type

// validateWorkflowJson(file)
// Validate workflow.json structure, n8n version compatibility

// validateMobileApp(file, platform)
// Validate APK/IPA signature, permissions, etc.

// scanForMalware(file)
// Scan file for malware using VirusTotal/ClamAV

// scanForCredentials(file)
// Scan for hardcoded API keys, passwords, etc.
```

### B.3. Frontend Revised

#### B.3.1. Upload Flow UI

1. **Product Type Selection Page**
   - User chọn loại sản phẩm: Workflow / Tool / Integration / Website / Mobile App
   - Mỗi type có mô tả và requirements

2. **Multi-step Form**

   **Step 1: Basic Information**
   - Title, Description, Long Description
   - Tags, Category
   - Pricing (Free/Paid)

   **Step 2: Type-specific Information** (conditional rendering)
   - **Workflow**: n8n version, workflow file, .env.example, README.md
   - **Tool**: Programming language, manifest, source code, install script
   - **Integration**: Connector schema, platforms supported
   - **Website**: Framework, source code, deploy guide
   - **Mobile App**: Platform (Android/iOS), APK/IPA, screenshots, permissions

   **Step 3: Media & Assets**
   - Thumbnail (required)
   - Preview images/video
   - Screenshots (multiple)
   - Demo URL (optional)

   **Step 4: Legal & Ownership**
   - License selection (MIT, GPL, Proprietary, etc.)
   - Ownership declaration checkbox
   - Terms & Conditions acceptance
   - Optional: Upload proof of ownership

   **Step 5: Review & Submit**
   - Preview all information
   - Checklist validation
   - Submit button → Creates product as DRAFT

#### B.3.2. File Upload Component

```typescript
// FileUpload component với drag-and-drop
// Features:
//   - Multiple file upload
//   - Progress indicator per file
//   - File preview (JSON viewer, image preview, etc.)
//   - File type validation
//   - Size limit check
//   - Remove file before upload
```

#### B.3.3. Review Status UI

- Seller dashboard: Hiển thị review status, security scan status
- Admin dashboard: Review checklist, approve/reject interface
- Audit log viewer: Xem lịch sử review

### B.4. Flow Step-by-Step

#### B.4.1. Seller Upload Flow

```
1. Seller đăng nhập → Seller dashboard
2. Click "Create New Product" → Chọn product type
3. Điền form multi-step:
   a. Basic info (title, description, tags, pricing)
   b. Type-specific info (upload files, fill metadata)
   c. Media (thumbnail, screenshots)
   d. Legal (license, ownership declaration, T&C)
   e. Review & Submit
4. Backend validation:
   - Validate required fields
   - Upload files → Storage (S3/local)
   - Create product record (status=DRAFT, review_status=PENDING)
   - Create type-specific record (product_workflows, product_tools, etc.)
   - Create artifact records
   - Trigger security scan (async)
5. Response: Product created, pending review
6. Seller có thể edit product (status vẫn là DRAFT)
```

#### B.4.2. Security Scan Flow (Async)

```
1. After product created → Queue security scan job
2. Scan process:
   a. Scan artifacts for malware (VirusTotal API hoặc ClamAV)
   b. Scan for hardcoded credentials (regex patterns, .env files)
   c. Scan for copyright violations (optional: image recognition, code similarity)
   d. Validate license compliance
3. Update product.security_scan_status = 'passed' | 'failed'
4. Update product.security_scan_result = { malware: false, credentials_found: [], ... }
5. Notify admin if scan failed
```

#### B.4.3. Admin Review Flow

```
1. Admin xem list products pending review
2. Click vào product → Review page
3. Review checklist:
   a. ✅ Basic info đầy đủ và chính xác
   b. ✅ Files uploaded và valid
   c. ✅ Security scan passed
   d. ✅ Ownership declaration checked
   e. ✅ License valid và compatible
   f. ✅ No credentials in code
   g. ✅ Demo/tested working (optional)
4. Admin chọn action:
   - APPROVE → review_status=APPROVED, có thể auto-publish nếu đủ điều kiện
   - REJECT → review_status=REJECTED, nhập reason
   - REQUEST CHANGES → review_status=PENDING, gửi feedback cho seller
5. Audit log được tạo với tất cả thông tin
6. Seller được notify (email/in-app)
```

#### B.4.4. Publish Flow

```
1. Seller click "Publish" (chỉ khi review_status=APPROVED)
2. Backend check:
   - review_status === APPROVED
   - security_scan_status === 'passed'
   - Required fields filled (title, description, thumbnail, primary artifact)
3. Update status = PUBLISHED
4. Product hiển thị trên public marketplace
5. Notify seller: Product published successfully
```

#### B.4.5. Download Flow

```
1. User browse marketplace → Click product
2. Click "Download" button
3. Backend check:
   - Product status === PUBLISHED
   - review_status === APPROVED
   - User có quyền download (free hoặc đã mua)
4. Log download:
   - Create download_logs record
   - Increment product.downloads
   - Increment product.sales_count (nếu paid)
5. Return download URL (signed URL nếu S3, hoặc direct link)
6. User download file
```

### B.5. Validation Rules

#### B.5.1. Workflow Validation

```typescript
// Required fields:
//   - workflow_json (valid n8n JSON structure)
//   - n8n_version
//   - .env.example (recommended)

// Validation:
//   1. workflow_json phải là valid JSON
//   2. workflow_json phải có structure: { nodes: [...], connections: {...} }
//   3. n8n_version phải match với n8n version hiện tại (hoặc compatible)
//   4. .env.example không được chứa real credentials
```

#### B.5.2. Tool Validation

```typescript
// Required fields:
//   - manifest.json (valid structure)
//   - source_code (ZIP file)

// Validation:
//   1. manifest.json phải có: name, version, entry_point, dependencies
//   2. Source code ZIP không được quá 100MB
//   3. Không có node_modules trong source ZIP (nếu có thì warn)
//   4. install_script phải tồn tại và executable
```

#### B.5.3. Mobile App Validation

```typescript
// Required fields:
//   - APK (Android) hoặc IPA (iOS)
//   - app_id (package name / bundle ID)
//   - min_sdk_version / min_ios_version

// Validation:
//   1. APK/IPA phải có valid signature
//   2. File size không quá 500MB
//   3. Permissions không quá invasive (cảnh báo nếu có sensitive permissions)
//   4. Screenshots tối thiểu 3 images
```

### B.6. Rate Limiting & Caching

#### B.6.1. Rate Limiting

```typescript
// Upload limits:
//   - Max 10 products per day per seller
//   - Max 100MB total file size per product
//   - Max 50MB per single file

// API rate limits:
//   - GET /api/products: 100 requests/minute (public)
//   - POST /api/products: 10 requests/hour (seller)
//   - POST /api/products/:id/artifacts/upload: 20 requests/hour (seller)
```

#### B.6.2. Caching Strategy

```typescript
// Cache:
//   - Featured products: 1 hour
//   - Product list (filtered): 5 minutes
//   - Product details: 15 minutes
//   - Product artifacts: 24 hours (invalidation on update)

// CDN:
//   - All images (thumbnails, screenshots): CDN
//   - Artifact files: CDN (nếu public) hoặc signed URL (nếu private)
```

### B.7. Error Handling

```typescript
// Error codes và messages:
//   - PRODUCT_UPLOAD_LIMIT_EXCEEDED: "Bạn đã upload quá 10 sản phẩm trong ngày"
//   - FILE_TOO_LARGE: "File quá lớn. Tối đa 50MB"
//   - INVALID_WORKFLOW_JSON: "Workflow JSON không hợp lệ"
//   - SECURITY_SCAN_FAILED: "Security scan thất bại. Vui lòng kiểm tra lại file"
//   - OWNERSHIP_NOT_DECLARED: "Bạn cần xác nhận quyền sở hữu sản phẩm"
//   - LICENSE_REQUIRED: "Vui lòng chọn license cho sản phẩm"
```

---

## TÓM TẮT

### Những gì cần implement:

1. **Database Migrations**:
   - Update `products` table (thêm fields: changelog, license, screenshots, etc.)
   - Tạo `product_artifacts` table
   - Tạo 5 bảng con: `product_workflows`, `product_tools`, `product_integrations`, `product_websites`, `product_mobile_apps`
   - Tạo `product_review_audit_log` table
   - Update `product_type` enum (thêm 'website', 'mobile_app')

2. **Backend Services**:
   - File upload service (multipart, S3/local storage)
   - File validation service (type, size, structure)
   - Security scan service (malware, credentials)
   - Type-specific validation services (5 types)
   - Audit log service

3. **Backend APIs**:
   - `/api/products/:id/artifacts/*` endpoints
   - Type-specific endpoints (`/api/products/:id/workflow-details`, etc.)
   - Security scan endpoints
   - Enhanced review endpoints với checklist

4. **Frontend**:
   - Multi-step upload form với conditional fields
   - File upload component (drag-and-drop, progress)
   - Type-specific forms
   - Review status UI
   - Admin review interface với checklist

5. **Integration**:
   - VirusTotal/ClamAV API integration
   - Storage service (S3 hoặc local)
   - CDN integration cho images

6. **Testing**:
   - Unit tests cho validation
   - Integration tests cho upload flow
   - Security scan tests

---

**Ưu tiên triển khai:**
1. **Phase 1** (Critical): Database schema, basic upload, workflow type
2. **Phase 2** (Important): Security scan, audit log, type-specific tables
3. **Phase 3** (Enhancement): Website & Mobile App types, advanced validation, CDN

