import { ProductType, ProductStatus, ProductReviewStatus } from './enums';

/**
 * Product model (internal - snake_case for database)
 * Used by backend repositories and services
 */
export interface Product {
    id: string;
    seller_id: string;
    title: string;
    description: string;
    long_description?: string;
    type: ProductType;
    tags: string[];
    workflow_file_url?: string;
    thumbnail_url?: string;
    preview_image_url?: string;
    is_free: boolean;
    price?: number;
    status: ProductStatus;
    review_status: ProductReviewStatus;
    reviewed_at?: Date | null;
    reviewed_by?: string | null;
    rejection_reason?: string | null;
    downloads: number;
    rating: number;
    reviews_count: number;
    version?: string;
    requirements: string[];
    features: string[];
    install_guide?: string;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

/**
 * Create product input (internal - snake_case)
 */
export interface CreateProductInput {
    seller_id: string;
    title: string;
    description: string;
    long_description?: string;
    type: ProductType;
    tags?: string[];
    workflow_file_url?: string;
    thumbnail_url?: string;
    preview_image_url?: string;
    is_free: boolean;
    price?: number;
    status?: ProductStatus;
    version?: string;
    requirements?: string[];
    features?: string[];
    install_guide?: string;
    metadata?: Record<string, any>;
}

/**
 * Update product input (internal - snake_case)
 */
export interface UpdateProductInput {
    title?: string;
    description?: string;
    long_description?: string;
    type?: ProductType;
    tags?: string[];
    workflow_file_url?: string;
    thumbnail_url?: string;
    preview_image_url?: string;
    is_free?: boolean;
    price?: number;
    status?: ProductStatus;
    version?: string;
    requirements?: string[];
    features?: string[];
    install_guide?: string;
    metadata?: Record<string, any>;
}

/**
 * Product query filters (internal - snake_case)
 */
export interface ProductQueryFilters {
    type?: ProductType;
    status?: ProductStatus;
    review_status?: ProductReviewStatus;
    is_free?: boolean;
    seller_id?: string;
    search?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    sort_by?: 'created_at' | 'rating' | 'downloads';
    sort_order?: 'asc' | 'desc';
}

