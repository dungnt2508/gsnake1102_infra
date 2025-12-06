# REFACTOR PLAN - PERSONALIZED BOT APPLICATION

> **Mục tiêu**: Cải thiện kiến trúc, maintainability, scalability và code quality của codebase
> 
> **Timeline**: 6 tuần (có thể thực hiện song song một số phases)
> 
> **Nguyên tắc**: Refactor incrementally, không break existing features, test sau mỗi thay đổi

---

## PHASE 0: CHUẨN BỊ (Week 1, Days 1-2)

### 0.1. Setup Testing Infrastructure

**Priority: CRITICAL**

- [ ] Install testing frameworks
  ```bash
  # Backend
  cd backend
  npm install --save-dev @types/jest jest ts-jest supertest @types/supertest
  
  # Frontend  
  cd frontend
  npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
  ```

- [ ] Configure test runners
  - Backend: `jest.config.js` với coverage thresholds
  - Frontend: `vitest.config.ts`

- [ ] Tạo baseline tests cho critical paths
  - Auth flow (login, register)
  - Product CRUD
  - Chat API

**Deliverable**: Test suite với ít nhất 40% coverage

---

### 0.2. Setup Code Quality Tools

- [ ] Install linters và formatters
  ```bash
  npm install --save-dev eslint-plugin-sonarjs eslint-plugin-security
  ```

- [ ] Configure pre-commit hooks (husky)
  - Run linter
  - Run type check
  - Run tests on changed files

- [ ] Setup CI/CD pipeline (GitHub Actions)
  - Run tests
  - Build check
  - Type check

**Deliverable**: `.github/workflows/ci.yml`, `.husky/pre-commit`

---

## PHASE 1: ERROR HANDLING & TYPE SAFETY (Week 1-2)

### 1.1. Standardize Error Handling (Backend)

**Priority: CRITICAL**

#### Step 1.1.1: Define Error Types

- [ ] Tạo `backend/src/shared/errors/`
  
```typescript
// backend/src/shared/errors/base.error.ts
export abstract class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// backend/src/shared/errors/domain.error.ts
export class DomainError extends ApplicationError {
  constructor(code: string, details?: Record<string, any>) {
    super(code, ERROR_MESSAGES[code] || 'Domain error', 400, details);
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(code: string, details?: Record<string, any>) {
    super(code, ERROR_MESSAGES[code] || 'Forbidden', 403, details);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(code: string, details?: Record<string, any>) {
    super(code, ERROR_MESSAGES[code] || 'Not found', 404, details);
  }
}

// backend/src/shared/errors/codes.ts
export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  
  // Product
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  SELLER_NOT_FOUND: 'SELLER_NOT_FOUND',
  PRODUCT_UPDATE_FORBIDDEN: 'PRODUCT_UPDATE_FORBIDDEN',
  PRODUCT_NOT_APPROVED: 'PRODUCT_NOT_APPROVED',
  
  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
} as const;

export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  PRODUCT_NOT_FOUND: 'Product not found',
  SELLER_NOT_FOUND: 'Seller not found',
  PRODUCT_UPDATE_FORBIDDEN: 'You can only update your own products',
  PRODUCT_NOT_APPROVED: 'Product must be approved before publishing',
  INVALID_INPUT: 'Invalid input data',
};
```

#### Step 1.1.2: Update Error Handler Middleware

```typescript
// backend/src/middleware/error.middleware.ts
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ApplicationError } from '../shared/errors/base.error';
import { ZodError } from 'zod';

export async function errorHandler(
  error: Error | FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error với request ID
  request.log.error({
    error,
    requestId: request.id,
    path: request.url,
  });

  // Handle custom application errors
  if (error instanceof ApplicationError) {
    return reply.status(error.statusCode).send({
      error: true,
      code: error.code,
      message: error.message,
      details: error.details,
      requestId: request.id,
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: true,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
      requestId: request.id,
    });
  }

  // Handle Fastify errors
  if ('statusCode' in error) {
    return reply.status(error.statusCode || 500).send({
      error: true,
      code: 'INTERNAL_ERROR',
      message: error.message,
      requestId: request.id,
    });
  }

  // Unknown errors
  return reply.status(500).send({
    error: true,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    requestId: request.id,
  });
}
```

#### Step 1.1.3: Refactor Services to Use New Errors

**Example**: `product.service.ts`

```typescript
// Before
if (!seller) {
  throw new Error('Không tìm thấy người bán');
}

// After
if (!seller) {
  throw new NotFoundError('SELLER_NOT_FOUND', { sellerId: data.seller_id });
}

// Before
if (product.seller_id !== sellerId) {
  throw new Error('Không có quyền: Bạn chỉ có thể cập nhật sản phẩm của chính mình');
}

// After  
if (product.seller_id !== sellerId) {
  throw new AuthorizationError('PRODUCT_UPDATE_FORBIDDEN', { productId, sellerId });
}
```

**Tasks:**
- [ ] Refactor `auth.service.ts`
- [ ] Refactor `product.service.ts`
- [ ] Refactor `user.service.ts`
- [ ] Refactor all other services

---

### 1.2. Add DTO Layer (Backend)

**Priority: HIGH**

#### Step 1.2.1: Create DTO Structure

```
backend/src/application/
├── dtos/
│   ├── auth/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── auth-response.dto.ts
│   ├── product/
│   │   ├── create-product.dto.ts
│   │   ├── update-product.dto.ts
│   │   └── product-response.dto.ts
│   └── user/
│       └── user-response.dto.ts
└── mappers/
    ├── product.mapper.ts
    └── user.mapper.ts
```

#### Step 1.2.2: Implement DTOs

```typescript
// backend/src/application/dtos/product/product-response.dto.ts
export class ProductResponseDto {
  id: string;
  sellerId: string;  // camelCase cho API response
  title: string;
  description: string;
  type: string;
  tags: string[];
  price?: number;
  isFree: boolean;
  status: string;
  reviewStatus: string;
  downloads: number;
  rating: number;
  createdAt: string;
  updatedAt: string;

  constructor(data: Partial<ProductResponseDto>) {
    Object.assign(this, data);
  }
}

// backend/src/application/mappers/product.mapper.ts
import { Product } from '../../domain/product/product.entity';
import { ProductResponseDto } from '../dtos/product/product-response.dto';

export class ProductMapper {
  static toResponseDto(product: Product): ProductResponseDto {
    return new ProductResponseDto({
      id: product.id,
      sellerId: product.seller_id,  // Convert snake_case to camelCase
      title: product.title,
      description: product.description,
      type: product.type,
      tags: product.tags,
      price: product.price,
      isFree: product.is_free,
      status: product.status,
      reviewStatus: product.review_status,
      downloads: product.downloads,
      rating: product.rating,
      createdAt: product.created_at.toISOString(),
      updatedAt: product.updated_at.toISOString(),
    });
  }

  static toResponseDtoList(products: Product[]): ProductResponseDto[] {
    return products.map(p => this.toResponseDto(p));
  }
}
```

#### Step 1.2.3: Update Routes to Use DTOs

```typescript
// Before
successResponse(reply, { product });

// After
const dto = ProductMapper.toResponseDto(product);
successResponse(reply, { product: dto });
```

**Tasks:**
- [ ] Create DTOs for all entities
- [ ] Create mappers
- [ ] Update all routes to use DTOs
- [ ] Update frontend types to match DTOs

---

### 1.3. Shared Types Between Frontend/Backend

**Priority: HIGH**

#### Option A: Shared Package (Recommended)

```bash
# Create shared package
mkdir packages/shared-types
cd packages/shared-types
npm init -y
```

```typescript
// packages/shared-types/src/api-responses.ts
export interface ApiResponse<T> {
  error: boolean;
  data?: T;
  message?: string;
  code?: string;
  requestId?: string;
}

export interface ProductDto {
  id: string;
  sellerId: string;
  title: string;
  // ... all fields in camelCase
}

export interface CreateProductDto {
  title: string;
  description: string;
  // ... input fields
}
```

Update `package.json`:
```json
{
  "name": "@gsnake/shared-types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  }
}
```

Backend và Frontend import:
```typescript
import { ProductDto, CreateProductDto } from '@gsnake/shared-types';
```

#### Option B: Code Generation từ OpenAPI

- [ ] Generate OpenAPI spec từ backend types (using `@fastify/swagger`)
- [ ] Use `openapi-typescript` để generate frontend types

**Tasks:**
- [ ] Chọn approach (A hoặc B)
- [ ] Implement shared types
- [ ] Remove duplicate type definitions
- [ ] Update imports across codebase

---

## PHASE 2: DOMAIN LAYER & BUSINESS LOGIC (Week 2-3)

### 2.1. Extract Domain Models

**Priority: HIGH**

#### Step 2.1.1: Create Domain Structure

```
backend/src/domain/
├── product/
│   ├── product.entity.ts
│   ├── product.value-objects.ts
│   ├── product-state-machine.ts
│   ├── product.repository.interface.ts
│   └── product.events.ts
├── user/
│   ├── user.entity.ts
│   ├── user.value-objects.ts
│   └── user.repository.interface.ts
└── shared/
    ├── entity.base.ts
    └── value-object.base.ts
```

#### Step 2.1.2: Implement Domain Entities

```typescript
// backend/src/domain/shared/entity.base.ts
export abstract class Entity<T> {
  protected readonly _id: string;
  protected props: T;

  constructor(props: T, id: string) {
    this._id = id;
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  equals(entity?: Entity<T>): boolean {
    if (!entity) return false;
    if (this === entity) return true;
    return this._id === entity._id;
  }
}

// backend/src/domain/product/product.entity.ts
import { Entity } from '../shared/entity.base';
import { ProductStatus, ProductReviewStatus, ProductType } from './product.value-objects';
import { DomainError } from '../../shared/errors/domain.error';
import { ERROR_CODES } from '../../shared/errors/codes';

interface ProductProps {
  sellerId: string;
  title: string;
  description: string;
  type: ProductType;
  status: ProductStatus;
  reviewStatus: ProductReviewStatus;
  isFree: boolean;
  price?: number;
  // ... other fields
}

export class Product extends Entity<ProductProps> {
  private constructor(props: ProductProps, id: string) {
    super(props, id);
  }

  // Factory method
  static create(props: Omit<ProductProps, 'status' | 'reviewStatus'>, id: string): Product {
    return new Product(
      {
        ...props,
        status: ProductStatus.DRAFT,
        reviewStatus: ProductReviewStatus.PENDING,
      },
      id
    );
  }

  // Getters
  get sellerId(): string {
    return this.props.sellerId;
  }

  get title(): string {
    return this.props.title;
  }

  get status(): ProductStatus {
    return this.props.status;
  }

  get reviewStatus(): ProductReviewStatus {
    return this.props.reviewStatus;
  }

  // Business logic methods
  canBePublished(): boolean {
    return this.props.reviewStatus === ProductReviewStatus.APPROVED;
  }

  publish(): void {
    if (!this.canBePublished()) {
      throw new DomainError(ERROR_CODES.PRODUCT_NOT_APPROVED, {
        productId: this.id,
        reviewStatus: this.props.reviewStatus,
      });
    }

    if (!this.props.workflowFileUrl && this.props.type === ProductType.WORKFLOW) {
      throw new DomainError('WORKFLOW_FILE_REQUIRED', { productId: this.id });
    }

    this.props.status = ProductStatus.PUBLISHED;
  }

  unpublish(): void {
    this.props.status = ProductStatus.DRAFT;
  }

  isOwnedBy(sellerId: string): boolean {
    return this.props.sellerId === sellerId;
  }

  // ... other business methods
}
```

#### Step 2.1.3: Implement State Machine

```typescript
// backend/src/domain/product/product-state-machine.ts
export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ProductReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

interface StateTransition {
  from: ProductStatus;
  to: ProductStatus;
  guard?: (product: Product) => boolean;
}

export class ProductStateMachine {
  private static transitions: StateTransition[] = [
    { 
      from: ProductStatus.DRAFT, 
      to: ProductStatus.PUBLISHED,
      guard: (p) => p.reviewStatus === ProductReviewStatus.APPROVED,
    },
    { from: ProductStatus.PUBLISHED, to: ProductStatus.DRAFT },
    { from: ProductStatus.PUBLISHED, to: ProductStatus.ARCHIVED },
    { from: ProductStatus.DRAFT, to: ProductStatus.ARCHIVED },
  ];

  static canTransition(from: ProductStatus, to: ProductStatus, product?: Product): boolean {
    const transition = this.transitions.find(t => t.from === from && t.to === to);
    if (!transition) return false;
    if (transition.guard && product) {
      return transition.guard(product);
    }
    return true;
  }

  static getAllowedTransitions(from: ProductStatus): ProductStatus[] {
    return this.transitions
      .filter(t => t.from === from)
      .map(t => t.to);
  }
}
```

**Tasks:**
- [ ] Create base classes (Entity, ValueObject)
- [ ] Implement Product entity
- [ ] Implement User entity
- [ ] Implement Persona entity
- [ ] Move business logic from services to entities
- [ ] Write unit tests for domain logic

---

### 2.2. Implement Use Cases (Application Layer)

**Priority: MEDIUM**

```
backend/src/application/
├── use-cases/
│   ├── product/
│   │   ├── create-product.use-case.ts
│   │   ├── publish-product.use-case.ts
│   │   ├── update-product.use-case.ts
│   │   └── delete-product.use-case.ts
│   └── auth/
│       ├── login.use-case.ts
│       └── register.use-case.ts
```

```typescript
// backend/src/application/use-cases/product/publish-product.use-case.ts
import { Product } from '../../../domain/product/product.entity';
import { IProductRepository } from '../../../domain/product/product.repository.interface';
import { AuthorizationError } from '../../../shared/errors/authorization.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ERROR_CODES } from '../../../shared/errors/codes';

export class PublishProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(productId: string, sellerId: string): Promise<Product> {
    // 1. Load product
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError(ERROR_CODES.PRODUCT_NOT_FOUND, { productId });
    }

    // 2. Authorization check
    if (!product.isOwnedBy(sellerId)) {
      throw new AuthorizationError(ERROR_CODES.PRODUCT_UPDATE_FORBIDDEN, {
        productId,
        sellerId,
      });
    }

    // 3. Business logic (in domain)
    product.publish(); // Throws DomainError if can't publish

    // 4. Persist
    const updated = await this.productRepository.update(product);

    // 5. Emit domain event (optional)
    // this.eventBus.publish(new ProductPublishedEvent(product.id));

    return updated;
  }
}
```

**Tasks:**
- [ ] Implement use cases for critical flows
- [ ] Update services to delegate to use cases
- [ ] Remove business logic from services
- [ ] Write tests for use cases

---

## PHASE 3: INFRASTRUCTURE IMPROVEMENTS (Week 3-4)

### 3.1. Fix Auth Middleware N+1 Problem

**Priority: CRITICAL**

```typescript
// backend/src/middleware/auth.middleware.ts

// Before: Query DB mỗi request
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const user = await userRepository.findById(request.user.userId);
  if (!user || user.role !== UserRole.ADMIN) {
    return unauthorizedResponse(reply, 'Admin access required');
  }
}

// After: Check role từ JWT
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return unauthorizedResponse(reply, 'Authentication required');
  }

  // Role đã có trong JWT payload
  if (request.user.role !== UserRole.ADMIN) {
    return unauthorizedResponse(reply, 'Admin access required');
  }
}

// Chỉ query DB khi cần check seller_status
export async function requireApprovedSeller(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return unauthorizedResponse(reply, 'Authentication required');
  }

  // Check role từ JWT trước
  if (request.user.role !== UserRole.SELLER) {
    return unauthorizedResponse(reply, 'Seller role required');
  }

  // Chỉ query DB khi cần check seller_status (không cache trong JWT)
  const user = await userRepository.findById(request.user.userId);
  if (!user || user.seller_status !== SellerStatus.APPROVED) {
    return unauthorizedResponse(reply, 'Approved seller status required');
  }
}
```

**Tasks:**
- [ ] Update JWT payload để include role
- [ ] Refactor middleware để check role từ JWT
- [ ] Chỉ query DB khi thực sự cần (seller_status)
- [ ] Benchmark performance improvement

---

### 3.2. Add Caching Layer

**Priority: HIGH**

```typescript
// backend/src/infrastructure/cache/redis-cache.service.ts
import { Redis } from 'ioredis';

export class RedisCacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage in repository
export class ProductRepository {
  constructor(
    private pool: Pool,
    private cache: RedisCacheService
  ) {}

  async findById(id: string): Promise<Product | null> {
    // Try cache first
    const cached = await this.cache.get<Product>(`product:${id}`);
    if (cached) return cached;

    // Query DB
    const result = await this.pool.query('SELECT * FROM products WHERE id = $1', [id]);
    const product = result.rows[0] ? this.mapRowToProduct(result.rows[0]) : null;

    // Cache for 1 hour
    if (product) {
      await this.cache.set(`product:${id}`, product, 3600);
    }

    return product;
  }

  async update(id: string, data: UpdateProductInput): Promise<Product | null> {
    const updated = await this.pool.query(/* ... */);
    
    // Invalidate cache
    await this.cache.del(`product:${id}`);
    await this.cache.invalidatePattern(`products:list:*`);

    return updated.rows[0] ? this.mapRowToProduct(updated.rows[0]) : null;
  }
}
```

**Tasks:**
- [ ] Implement RedisCacheService
- [ ] Add caching to Product queries
- [ ] Add caching to User queries (careful với sensitive data)
- [ ] Add cache invalidation on updates
- [ ] Monitor cache hit rate

---

### 3.3. Add Ports & Adapters for External Services

**Priority: MEDIUM**

```typescript
// backend/src/domain/llm/llm-provider.interface.ts
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  stream?: boolean;
  model?: string;
  temperature?: number;
}

export interface ILLMProvider {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string | AsyncIterable<string>>;
  summarize(text: string, options?: ChatOptions): Promise<string>;
}

// backend/src/infrastructure/llm/openai.adapter.ts
import OpenAI from 'openai';
import { ILLMProvider, ChatMessage, ChatOptions } from '../../domain/llm/llm-provider.interface';

export class OpenAIAdapter implements ILLMProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string | AsyncIterable<string>> {
    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages: messages,
      stream: options.stream || false,
      temperature: options.temperature,
    });

    if (options.stream) {
      return response as AsyncIterable<string>;
    }

    return (response as any).choices[0]?.message?.content || '';
  }

  async summarize(text: string, options: ChatOptions = {}): Promise<string> {
    return this.chat([
      { role: 'system', content: 'You are a helpful summarization assistant.' },
      { role: 'user', content: `Summarize the following text:\n\n${text}` },
    ], options) as Promise<string>;
  }
}

// backend/src/infrastructure/llm/litellm.adapter.ts  
export class LiteLLMAdapter implements ILLMProvider {
  // Similar implementation for LiteLLM
}

// Usage in service
export class LLMService {
  constructor(private llmProvider: ILLMProvider) {}

  async chat(userId: string, messages: ChatMessage[], stream: boolean = false) {
    const messagesWithPersona = await this.injectPersona(userId, messages);
    return this.llmProvider.chat(messagesWithPersona, { stream });
  }
}

// DI in index.ts
const llmProvider = process.env.LLM_PROVIDER === 'litellm' 
  ? new LiteLLMAdapter(env.LITELLM_API_KEY!)
  : new OpenAIAdapter(env.OPENAI_API_KEY!);

const llmService = new LLMService(llmProvider);
```

**Tasks:**
- [ ] Define interfaces for external services
- [ ] Implement adapters (OpenAI, LiteLLM, n8n)
- [ ] Update services to use interfaces
- [ ] Add mock implementations for testing

---

## PHASE 4: FRONTEND IMPROVEMENTS (Week 4-5)

### 4.1. Feature-Based Organization

**Priority: MEDIUM**

```
frontend/src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useLogin.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductList.tsx
│   │   │   └── ProductForm.tsx
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   ├── useProduct.ts
│   │   │   └── useCreateProduct.ts
│   │   ├── services/
│   │   │   └── product.service.ts
│   │   └── types.ts
│   └── dashboard/
├── shared/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── hooks/
│   │   ├── useApi.ts
│   │   └── useDebounce.ts
│   ├── api/
│   │   ├── client.ts
│   │   └── query-client.ts
│   └── utils/
└── lib/
```

**Tasks:**
- [ ] Reorganize components by feature
- [ ] Extract shared components
- [ ] Create feature-specific hooks

---

### 4.2. Add React Query for Data Fetching

**Priority: HIGH**

```bash
npm install @tanstack/react-query
```

```typescript
// frontend/src/shared/api/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// frontend/src/features/products/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import productService from '../services/product.service';
import type { ProductFilters } from '../types';

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Usage in component
function ProductList() {
  const { data, isLoading, error } = useProducts({ limit: 10 });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Tasks:**
- [ ] Install React Query
- [ ] Create query hooks for all resources
- [ ] Replace manual fetch logic with hooks
- [ ] Add optimistic updates
- [ ] Remove duplicate loading/error states

---

### 4.3. Fix Dashboard Performance

**Priority: HIGH**

```typescript
// Before: Sequential requests
const articlesRes = await apiClient.get('/articles?limit=100');
const toolsRes = await apiClient.get('/tools?limit=100');
const schedulesRes = await apiClient.get('/schedules');
const personaRes = await apiClient.get('/personas');

// After: Parallel with React Query
function useDashboardStats() {
  const articles = useQuery({
    queryKey: ['articles', { limit: 100 }],
    queryFn: () => articleService.getArticles({ limit: 100 }),
  });

  const tools = useQuery({
    queryKey: ['tools', { limit: 100 }],
    queryFn: () => toolService.getTools({ limit: 100 }),
  });

  const schedules = useQuery({
    queryKey: ['schedules'],
    queryFn: () => scheduleService.getSchedules(),
  });

  const persona = useQuery({
    queryKey: ['persona'],
    queryFn: () => personaService.getPersona(),
  });

  return {
    articles: articles.data,
    tools: tools.data,
    schedules: schedules.data,
    persona: persona.data,
    isLoading: articles.isLoading || tools.isLoading || schedules.isLoading || persona.isLoading,
  };
}
```

**Tasks:**
- [ ] Refactor dashboard to use parallel queries
- [ ] Add caching with React Query
- [ ] Optimize re-renders with React.memo
- [ ] Add suspense boundaries

---

### 4.4. Improve API Client

**Priority: MEDIUM**

```typescript
// frontend/src/shared/api/client.ts
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@gsnake/shared-types';

class ApiClient {
  private client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private refreshingToken: Promise<string> | null = null;

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse<any>>) => {
        const originalRequest = error.config;

        // Handle 401 with token refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          // Implement token refresh logic here if you have refresh tokens
          // For now, just redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Format error response
        const errorResponse = {
          code: error.response?.data?.code || 'UNKNOWN_ERROR',
          message: error.response?.data?.message || 'An error occurred',
          details: error.response?.data?.details,
        };

        return Promise.reject(errorResponse);
      }
    );
  }

  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

**Tasks:**
- [ ] Implement better error handling
- [ ] Add request/response logging
- [ ] Add retry logic
- [ ] Add request deduplication

---

## PHASE 5: LOGGING & MONITORING (Week 5)

### 5.1. Structured Logging

**Priority: MEDIUM**

```bash
npm install pino pino-pretty
```

```typescript
// backend/src/shared/logger/logger.service.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

// Usage
logger.info({ userId, productId }, 'Product created');
logger.error({ error, requestId }, 'Failed to process request');
```

**Tasks:**
- [ ] Replace console.log with structured logger
- [ ] Add request ID tracking
- [ ] Log performance metrics
- [ ] Setup log aggregation (optional)

---

### 5.2. Health Checks & Metrics

```typescript
// backend/src/routes/health.routes.ts
export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async () => {
    const dbHealthy = await checkDatabaseHealth();
    const redisHealthy = await checkRedisHealth();
    
    const status = dbHealthy && redisHealthy ? 'healthy' : 'degraded';
    
    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealthy ? 'up' : 'down',
        redis: redisHealthy ? 'up' : 'down',
      },
    };
  });

  fastify.get('/metrics', async () => {
    // Integrate with Prometheus if needed
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      // ... other metrics
    };
  });
}
```

---

## PHASE 6: API VERSIONING & DOCUMENTATION (Week 6)

### 6.1. Add API Versioning

```typescript
// backend/src/index.ts
await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
await fastify.register(productRoutes, { prefix: '/api/v1/products' });
// ...

// Keep old routes for backward compatibility
await fastify.register(authRoutes, { prefix: '/api/auth' });
```

### 6.2. Generate OpenAPI Docs

```bash
npm install @fastify/swagger @fastify/swagger-ui
```

```typescript
// backend/src/index.ts
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Personalized Bot API',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development' },
    ],
  },
});

await fastify.register(swaggerUi, {
  routePrefix: '/docs',
});
```

---

## CHECKLIST TỔNG HỢP

### Critical (Phải làm ngay)
- [ ] Error handling standardization
- [ ] Fix auth middleware N+1
- [ ] Add caching layer
- [ ] React Query integration
- [ ] Shared types/DTOs

### High Priority
- [ ] Domain layer extraction
- [ ] Use cases implementation
- [ ] Ports & adapters for external services
- [ ] Frontend reorganization
- [ ] Testing infrastructure

### Medium Priority
- [ ] State machines
- [ ] Structured logging
- [ ] Health checks
- [ ] Performance optimization

### Low Priority (Nice to have)
- [ ] API versioning
- [ ] OpenAPI docs
- [ ] Monitoring dashboards
- [ ] E2E tests

---

## MEASUREMENT METRICS

Track these before and after refactor:

- **Code Quality**
  - Test coverage: Target 70%+
  - Cyclomatic complexity: Keep under 10
  - Code duplication: Reduce by 50%

- **Performance**
  - API response time: Target <100ms for 95th percentile
  - Cache hit rate: Target 80%+
  - Database queries: Reduce N+1 to 0

- **Developer Experience**
  - Build time: Keep under 30s
  - Type safety: 100% (no `any` types)
  - Linting errors: 0

---

## RISK MITIGATION

1. **Breaking Changes**: Always maintain backward compatibility, deprecate gradually
2. **Testing**: Write tests BEFORE refactoring
3. **Rollback Plan**: Use feature flags, deploy incrementally
4. **Documentation**: Update docs as you refactor
5. **Team Communication**: Share progress weekly

---

## NEXT STEPS

1. Review and approve this plan
2. Create GitHub issues for each phase
3. Start with Phase 0 (Testing + Tooling)
4. Tackle Phase 1 (Error Handling) immediately
5. Weekly review of progress and blockers
