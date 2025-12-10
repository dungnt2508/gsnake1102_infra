REVISED PLAN
Mục tiêu: mở rộng catalog thành marketplace mini (phase 1-2), giữ kiến trúc cũ, thêm seller, pricing, review, transaction-lite; không phá layout hay design tokens (trắng/xám/cam #FF6D3B).
1) Kiến trúc & Role
Roles: user (mặc định), seller (approved), moderator, admin.
Seller lifecycle: user → seller_application (pending/approved/rejected + intro/link/proof) → admin duyệt → role=seller.
Guard: /seller/* chỉ seller; /admin/* chỉ admin; moderation tools: moderator|admin.
2) Routing
/products: filter seller/price_type/platform/rating/type/tag, sort newest/bestseller/price asc/desc, pagination server-side, search query.
/product/:id: chi tiết.
/seller/:id: profile.
/seller/dashboard, /seller/upload: seller.
/admin/dashboard: duyệt sản phẩm/seller, history, ban/suspend.
/auth/: login/register/oauth.
/search: global search.
/contact, /about, /policy (terms/refund/license).
3) Data Model (thêm, giữ field cũ)
user: id, email, password_hash, name, avatar_url, role, created_at, updated_at.
seller_application: id, user_id, status(pending/approved/rejected), intro, link, proof, reviewed_by, reviewed_at, reason.
auth_providers: id, user_id, provider, provider_user_id, access_token, refresh_token, created_at.
product: id, seller_id (FK restrict), title, description, type, tags (TSV), thumbnail, video_url, file_url, platform_requirement, price_type(free/onetime/subscription), price_value, compare_at_price, currency, rating_avg, rating_count, sales_count, status(draft/published/archived/suspended), version, changelog, support_contact, documentation_url, created_at, updated_at.
review: id, product_id, user_id, rating, content, is_verified_purchase, is_spam_flag, created_at, updated_at.
transaction: id, buyer_id, seller_id, product_id, amount, currency, price_type_snapshot, price_value_snapshot, license_key, payment_provider, payment_reference, status(pending/success/failed/refunded), refund_reason, refund_at, created_at.
audit_log: id, actor_id, action, entity_type, entity_id, meta, created_at.
4) Quy trình
Seller apply → admin duyệt → mở dashboard/upload.
Product publish: draft → submitted → admin review → published/rejected; suspend có expiry; audit log mọi hành động.
Review: chỉ 1 review/verified purchase; chặn spam bằng rate-limit/captcha.
Download: free giới hạn rate-limit; paid hiện CTA “Liên hệ” (chưa thanh toán).
Moderation pipeline: virus scan file_url; content check; queue cho admin/moderator.
5) UI/Design (giữ token)
Product Card: thumb, title, tags, price, seller avatar/name, rating.
Product Detail: trái media/desc, phải seller+pricing+CTA, dưới features/integration/reviews.
Seller Profile: avatar, bio, socials, stats, products, contact.
Seller Dashboard: tabs Products | Revenue | Settings | Payout Info.
Admin Review: queue, history, suspend/ban, product/seller view.
6) Phi chức năng
Index DB: seller_id, price_type, tags, rating_avg, status, created_at.
Cache listing/seller profile; bust on update.
Rate-limit API (download/review/auth); abuse control tải free.
Monitoring: log transaction, moderation, error metrics.
7) Migration & Integrity
Migration script thêm bảng/field; backfill legacy (status=published, price_type=free, platform_requirement='', support_contact='').
Tag format cố định TSV.
FK: seller delete restrict; product delete restrict nếu có transaction.
8) Legal & Policy
Pages: Terms, Refund Policy, Licensing.
Dispute/chargeback policy ghi nhận (chuẩn bị cho phase checkout).
Seller payout info (method, account) lưu trong settings; chưa chi trả tự động.
9) Phase
Phase 1 (Catalog+auth): listing/detail nâng cấp, contact/about/policy, login basic.
Phase 2 (Marketplace Lite): seller profile, seller_id cho product, admin review queue, filters, pricing meta, review verified + anti-spam, rate-limit, virus scan, cache, index, monitoring hooks.
Phase 3 (Real, sau): checkout/payments, transaction log đầy đủ, license management, payouts, dispute handling.