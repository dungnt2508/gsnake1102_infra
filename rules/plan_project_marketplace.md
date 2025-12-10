# PLAN MARKETPLACE MINI – BẢN TRIỂN KHAI THẲNG

## 1. Kiến trúc tổng thể
- Giữ nguyên những page hiện có nhưng mở rộng theo hướng:

    - Thêm role: admin, seller, moderator.
    - Tách product thành entity chuẩn marketplace mini:
    - Không đập kiến trúc cũ. Chỉ thêm bảng + API + UI cần thiết.

## 2. Page Structure – phiên bản dành cho marketplace mini
#### 2.1. Home
- Bổ sung:

        Section “Người bán nổi bật”.
        Section “Top mua nhiều”.
        Section “Workflow miễn phí”.
- Không thay layout, chỉ mở rộng nội dung.

#### 2.2. Product Listing

- Hiện tại đủ dùng. Nâng cấp thêm:

- Filter:

            Người bán
            Giá (miễn phí / trả phí / subscription)
            Xếp hạng
            Nền tảng
            Loại sản phẩm

- Sorting:

        Mới nhất
        Bán chạy
        Giá tăng/giảm
- Pagination server-side.

- Card giữ nguyên nhưng thêm:

        Seller avatar + tên.
        Rating (nếu có).
        Giá dạng chuẩn: Free / From 50.000đ / Subscription.

#### 2.3. Product Detail Page
- Mở rộng theo chuẩn marketplace:
    - Block Seller Info (avatar, mô tả ngắn, link /seller/:id).
    - Pricing block:
        One-time price
        Subscription price (nếu dùng)
        License type
    - Reviews (đánh giá sao + comment).
    - Sales count.
    - Security note (nếu workflow dùng API).
    - Related products theo tag.

- Hành động:

    - Free: tải trực tiếp.
    - Paid: mở checkout modal hoặc link thanh toán.
    - Với bản nội bộ hiện tại → vẫn dùng “Liên hệ”.

#### 2.4. Seller Profile Page
- Mới.
        Avatar, mô tả, socials.
        Số sản phẩm.
        Tổng doanh số.
        Rating trung bình.
        Danh sách sản phẩm của seller.
        Nút “Liên hệ”.

#### 2.5. Seller Dashboard

- Mới, dành cho mở rộng marketplace thật sự.

        Upload workflow/tool mới.
        Quản lý sản phẩm.
        Doanh số.
        File và metadata.
        License quản lý.
        Review management.
- Giữ cấu trúc minimal :
```
        Header: Sản phẩm | Doanh thu | Settings
        Không cần build quá mức ở giai đoạn 1.
```

#### 2.6. Admin Review Page
- Mới
```
    Danh sách sản phẩm chờ duyệt.
    Duyệt seller.
    Gắn tag/chỉnh meta.
    Gỡ sản phẩm vi phạm.
    Đây là điều kiện tiên quyết để marketplace vận hành.
```
#### 2.7. Checkout (optional stage 2
- Nếu chuyển thành marketplace thật sự:
        Payment gateway nội địa: Momo, ZaloPay, VNPAY.
        Page /checkout.
- Tự động gửi file hoặc unlock download link.
- Lưu transaction vào DB.

3. Sitemap – phiên bản marketplace
/
├── /products
│       └── /product/:id
├── /seller/:id
├── /seller/dashboard (role required)
├── /seller/upload
├── /admin/dashboard (admin)
├── /contact
├── /about
├── /policy
└── /auth
        ├── /login
        ├── /register
        └── /callback/google

#### 4. Data Model – tối thiểu để thành marketplace
- Giữ nguyên product cũ, bổ sung:
    - user
    
            id
            email
            password_hash
            name
            avatar_url
            role (user | seller | moderator | admin)
            created_at
            updated_at
            
            Lý do đủ:
            role xử lý phân quyền seller ngay trong bảng user, không cần bảng seller riêng.
            avatar_url để hiển thị user/seller profile.
            name tối thiểu để review có người nhận diện.
            Không cần address, phone, company… vì không phải marketplace logistics.
    - auth_providers
    
            id
            user_id
            provider        (google | github | microsoft)
            provider_user_id
            access_token
            refresh_token
            created_at
            
            Lý do:
            Cho phép user có nhiều phương thức đăng nhập.
            Không làm phình bảng user.
            Không đụng vào các field logic của marketplace.
            Giữ user đơn giản, quan hệ 1-n sang auth_providers.
            Mở rộng thêm OAuth khác không ảnh hưởng cấu trúc.
    - product

            id
            seller_id
            title
            description
            type (workflow | tool | integration_pack | other)
            tags (JSON array hoặc TSV)
            thumbnail
            video_url
            file_url
            price_type (free | onetime | subscription)
            price_value (nullable nếu free)
            currency
            rating_avg
            rating_count
            sales_count
            status (draft | published | archived)
            created_at
            updated_at
            
            Lý do bổ sung:
            rating_count để tránh COUNT(*) tốn tài nguyên.
            status để quản lý publish.
            updated_at để xử lý cache và index.
            currency cần vì transaction có currency.
            
    - review
    
            id
            product_id
            user_id
            rating
            content
            created_at
            updated_at
            
            Lý do bổ sung: updated_at để chỉnh sửa review không fail.
    - transaction
    
            id
            buyer_id
            seller_id
            product_id
            amount
            currency
            price_type_snapshot
            price_value_snapshot
            license_key
            status (pending | success | failed | refunded)
            created_at
            
            Lý do bổ sung:
            seller_id để tránh JOIN sâu khi aggregate.
            status để quản lý giao dịch.
            price_type_snapshot / price_value_snapshot để đảm bảo lịch sử không thay đổi khi product thay đổi giá.

#### 5. UI Plan

Không dùng màu mè. Tông n8n → trắng, xám, cam (#FF6D3B).

- Product Card

            Thumbnail.
            Tên.
            Tags.
            Giá.
            Seller avatar.
            Rating.

- Product Detail

        Khối trái: mô tả, ảnh, video.
        Khối phải: seller info + pricing + CTA.
        Phần dưới: feature list, integration requirement, reviews.

- Seller Dashboard

        Table sản phẩm.
        Form upload.
        Biểu đồ doanh thu (sau).

#### 6. Roadmap Phát Triển Theo Phase
- Phase 1: Catalog mở rộng

        Build listing + detail.
        Thêm contact.
        Thêm about.
        Có login basic.

- Phase 2: Marketplace Lite

        Thêm seller profile.
        Thêm seller_id cho product.
        Admin review.
        Bộ lọc theo seller.
        Pricing meta (free/paid).
        Không cần thanh toán.

- Phase 3: Marketplace Real
        
        Checkout.
        Payment gateway.
        Transaction log.
        License management.
        Review/rating.

- Phase 4: Ecosystem

        Seller dashboard nâng cao.
        
        Analytics.
        
        Subscription billing.
        
        API cho bên thứ ba.

#### 7. Kết luận

Plan đã tái cấu trúc để mở rộng thành marketplace mà không phá thiết kế ban đầu. Điều chỉnh đúng trọng tâm: thêm seller, pricing, review, transaction. Routing giữ nguyên. UI giữ nguyên. Chỉ thêm tầng chức năng.

Kết thúc.