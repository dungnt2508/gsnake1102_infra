Project : 
catalog sản phẩm n8n workflow  (có thể nâng cấp thành marketplace)
Page cần có :
1. Trang chủ
•	Hero giới thiệu: “Workflow n8n & tiện ích do team build”.
•	Danh mục sản phẩm: Workflow, Tool, Integration Pack.
•	Section “Sản phẩm nổi bật”.
•	Section mô tả giá trị: tiết kiệm thời gian, plug-and-play, tùy chỉnh theo yêu cầu.
•	CTA: Xem tất cả sản phẩm.
2. Trang danh sách sản phẩm (Template / Tool Listing)
•	Grid card.
•	Search.
•	Bộ lọc: loại sản phẩm (Workflow / Tool), nền tảng (Notion, Telegram, API), mức độ tự động.
•	Tag hiển thị rõ, mô tả 1–2 dòng.
•	Mỗi card có:
o	Tên
o	Tags
o	Preview thumbnail
o	Miễn phí / Trả phí
o	Nút xem chi tiết
3. Trang chi tiết sản phẩm
•	Tiêu đề.
•	Mô tả chi tiết.
•	Video demo (nếu có).
•	Ảnh preview workflow.
•	Các tính năng chính.
•	Yêu cầu tích hợp (API key nào, module nào).
•	Hướng dẫn cài đặt cơ bản.
•	Nút hành động:
o	Tải về nếu miễn phí
o	Liên hệ mua nếu trả phí
→ mở link Telegram/Zalo/email hoặc form liên hệ.
4. Trang Liên hệ
•	Form liên hệ đơn giản: tên, email, nhu cầu.
•	Link trực tiếp Telegram/Zalo.
•	Ghim note: team hỗ trợ cài đặt.
5. Trang giới thiệu team (optional nhưng quan trọng cho “độ tin” trên thị trường Việt)
•	Giới thiệu team/brand.
•	Công nghệ, kinh nghiệm, khách hàng.
•	Lợi thế cạnh tranh.

6. Trang Điều khoản sử dụng / Chính sách (optional)
Nếu bạn có file tải về hoặc bán template → cần page này cho hợp lệ.

7. Login / Register (optional)
Cần để chia role (mở rộng tính năng khi lên market)


UI cần có
Core UI
•	Header đơn giản: Logo, Sản phẩm, Liên hệ.
•	Footer có thông tin team, link liên hệ, copyright.
Product Card
•	Tối giản, không màu mè.
•	Phong cách n8n: trắng, xám, accent cam (#FF6D3B).
•	Thumbnail bắt buộc để tăng CTR.
Product Detail Page
•	Layout 2 cột:
o	Trái: mô tả + thông tin
o	Phải: box hành động (tải / mua / liên hệ)
Form liên hệ
•	Inline, gọn, không cần xác thực phức tạp.
•	Tự động gửi về email/team.

Sitemap
/
├── /products
│      ├── /workflow
│      ├── /tools
│      └── /product/:id
├── /contact
├── /about (optional)
└── /policy (optional)

Plan nâng cấp lên market
Cấu trúc hiện tại có thể nâng cấp thành marketplace mà không phải đập đi xây lại. Lý do:
1. Trang danh sách và trang chi tiết đã phù hợp cho cả 2 mô hình
Catalog nội bộ và marketplace đều dùng cùng 2 dạng page:
•	Listing
•	Detail
Khi chuyển sang marketplace, chỉ cần bổ sung:
•	Bộ lọc theo người bán
•	Profile seller ở mỗi sản phẩm
•	Các biến thể giá / license
Không ảnh hưởng cấu trúc.
2. Đường dẫn /product/:id giữ nguyên
Bạn chỉ thêm metadata về seller sau này.
Không chạm vào routing.
3. /products dễ mở rộng
Bổ sung khi cần:
•	/seller/:id
•	/seller-dashboard
•	/upload-template
•	/admin/review
Không đụng trang hiện có.
4. Trang liên hệ có thể thay bằng purchase flow
Hiện tại: nút “Liên hệ mua”.
Sau này: thay bằng “Buy” → checkout.
Không phá UI, chỉ đổi nút và thêm modal/flow mới.
5. Khung dữ liệu dễ nâng cấp
Giờ mỗi sản phẩm chỉ có:
•	Tên
•	Mô tả
•	File
•	Tag
Khi thành marketplace bạn thêm:
•	seller_id
•	pricing model
•	reviews
•	sales count
Không cần refactor toàn bộ cấu trúc.
6. UX ban đầu giống marketplace giản lược
Layout: card grid → tương tự marketplace.
Detail page: content + sidebar → giống marketplace.
Header: sản phẩm + liên hệ → sau này thêm “Sell”.
Mọc thêm tính năng, không cần thay khung.

