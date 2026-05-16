# 🌸 Hoa Xinh — Hệ thống quản lý cửa hàng hoa

Internal tool quản lý bán hoa cho SME, xây dựng trên Next.js + Supabase.

## Tech stack

| Layer | Công nghệ |
|---|---|
| Framework | Next.js 14 (Pages Router) |
| Language | TypeScript |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |

## Tính năng

- **Dashboard** — doanh thu hôm nay, đơn hàng, cảnh báo hàng sắp hết, biểu đồ 7 ngày
- **Đơn hàng** — tạo đơn, cập nhật trạng thái, quản lý thanh toán
- **Sản phẩm** — danh mục hoa, giá, trạng thái bán
- **Kho hàng** — theo dõi tồn kho, nhập hàng, cảnh báo sắp hết
- **Khách hàng** — lịch sử mua hàng, phân loại VIP / thân thiết
- **Nhà cung cấp** — thông tin liên hệ, lịch sử nhập hàng
- **Báo cáo** — doanh thu, đơn hàng, sản phẩm bán chạy

## Cài đặt

### 1. Clone & cài dependencies

```bash
git clone <repo-url>
cd flower-store
npm install
```

### 2. Tạo Supabase project

Vào [supabase.com](https://supabase.com) → tạo project mới → lấy **Project URL** và **Publishable Key** ở mục Settings → API.

### 3. Chạy migration

Vào **SQL Editor** trên Supabase Dashboard, copy toàn bộ nội dung file sau và chạy:

```
supabase/migrations/001_initial.sql
```

File này tạo tất cả bảng, trigger, RLS policy, và seed data danh mục.

### 4. Cấu hình biến môi trường

```bash
cp .env.local.example .env.local
```

Mở `.env.local` và điền vào:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Chạy dev server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Cấu trúc thư mục

```
src/
├── components/
│   ├── layout/          # Sidebar, Header, DashboardLayout
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── supabase.ts      # Supabase browser client
│   ├── utils.ts         # cn(), formatCurrency(), formatDate()...
│   └── mock-data.ts     # Dữ liệu mẫu để dev UI
├── pages/
│   ├── index.tsx        # Dashboard
│   ├── login.tsx
│   ├── orders/          # Đơn hàng
│   ├── products/        # Sản phẩm
│   ├── inventory/       # Kho hàng
│   ├── customers/       # Khách hàng
│   ├── suppliers/       # Nhà cung cấp
│   └── reports/         # Báo cáo
├── styles/
│   └── globals.css
└── types/
    └── index.ts         # TypeScript types cho toàn app
supabase/
└── migrations/
    └── 001_initial.sql  # Schema khởi tạo
```

## Quy trình thêm tính năng có database

Mỗi khi cần thêm / sửa database, tạo file migration mới:

```
supabase/migrations/002_ten_tinh_nang.sql
```

Sau đó copy paste nội dung lên Supabase SQL Editor để chạy. Không sửa file migration cũ.

## Scripts

```bash
npm run dev      # Chạy development server
npm run build    # Build production
npm run start    # Chạy production server
npm run lint     # Kiểm tra lỗi ESLint
```
