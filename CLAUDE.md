# Flower Store — CLAUDE.md

## Database migrations

Mỗi khi có thay đổi database (thêm table, thêm cột, thêm index, v.v.), **bắt buộc** tạo file migration mới trong `supabase/migrations/`.

- Đặt tên theo format: `00N_mô_tả_ngắn.sql` (ví dụ: `002_add_promotions.sql`)
- Không sửa các file migration cũ — chỉ thêm file mới
- User sẽ copy nội dung file đó và paste vào Supabase Dashboard → SQL Editor để chạy

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## Stack

- Next.js 14 **Pages Router** — không dùng React Server Components
- shadcn/ui cho UI components (`src/components/ui/`)
- Supabase JS client (`src/lib/supabase.ts`) — browser client only
- Tailwind CSS với primary color rose/pink
