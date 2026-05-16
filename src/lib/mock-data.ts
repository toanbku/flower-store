import type { Category, Customer, InventoryItem, Order, Product, Supplier } from '@/types'

export const mockCategories: Category[] = [
  { id: '1', name: 'Hoa hồng', description: 'Các loại hoa hồng', created_at: '2024-01-01' },
  { id: '2', name: 'Hoa ly', description: 'Các loại hoa ly', created_at: '2024-01-01' },
  { id: '3', name: 'Hoa cúc', description: 'Các loại hoa cúc', created_at: '2024-01-01' },
  { id: '4', name: 'Lan', description: 'Hoa lan các loại', created_at: '2024-01-01' },
  { id: '5', name: 'Hoa hướng dương', description: 'Hoa hướng dương', created_at: '2024-01-01' },
  { id: '6', name: 'Bó hoa tổng hợp', description: 'Bó hoa phối nhiều loại', created_at: '2024-01-01' },
]

export const mockProducts: Product[] = [
  { id: '1', name: 'Hoa hồng đỏ nhập khẩu', description: 'Hoa hồng đỏ Ecuador loại 1', category_id: '1', category: mockCategories[0], price: 15000, unit: 'cành', is_active: true, created_at: '2024-01-10', updated_at: '2024-05-01' },
  { id: '2', name: 'Hoa hồng vàng', description: 'Hoa hồng vàng Đà Lạt', category_id: '1', category: mockCategories[0], price: 12000, unit: 'cành', is_active: true, created_at: '2024-01-10', updated_at: '2024-05-01' },
  { id: '3', name: 'Hoa hồng phấn', description: 'Hoa hồng hồng dịu dàng', category_id: '1', category: mockCategories[0], price: 12000, unit: 'cành', is_active: true, created_at: '2024-01-10', updated_at: '2024-05-01' },
  { id: '4', name: 'Hoa ly trắng', description: 'Hoa ly trắng thuần khiết', category_id: '2', category: mockCategories[1], price: 25000, unit: 'cành', is_active: true, created_at: '2024-01-12', updated_at: '2024-05-01' },
  { id: '5', name: 'Hoa ly hồng', description: 'Hoa ly hồng Đà Lạt', category_id: '2', category: mockCategories[1], price: 22000, unit: 'cành', is_active: true, created_at: '2024-01-12', updated_at: '2024-05-01' },
  { id: '6', name: 'Hoa cúc vàng', description: 'Cúc vàng tươi mỗi ngày', category_id: '3', category: mockCategories[2], price: 8000, unit: 'cành', is_active: true, created_at: '2024-01-15', updated_at: '2024-05-01' },
  { id: '7', name: 'Hoa cúc trắng', description: 'Cúc trắng thanh lịch', category_id: '3', category: mockCategories[2], price: 8000, unit: 'cành', is_active: true, created_at: '2024-01-15', updated_at: '2024-05-01' },
  { id: '8', name: 'Lan Dendro tím', description: 'Lan Dendro màu tím sang trọng', category_id: '4', category: mockCategories[3], price: 45000, unit: 'cành', is_active: true, created_at: '2024-02-01', updated_at: '2024-05-01' },
  { id: '9', name: 'Lan hồ điệp trắng', description: 'Lan hồ điệp trắng cao cấp', category_id: '4', category: mockCategories[3], price: 85000, unit: 'cành', is_active: true, created_at: '2024-02-01', updated_at: '2024-05-01' },
  { id: '10', name: 'Hoa hướng dương', description: 'Hướng dương tươi sáng', category_id: '5', category: mockCategories[4], price: 18000, unit: 'cành', is_active: true, created_at: '2024-02-05', updated_at: '2024-05-01' },
  { id: '11', name: 'Bó hoa sinh nhật', description: 'Bó hoa hỗn hợp 30 cành', category_id: '6', category: mockCategories[5], price: 350000, unit: 'bó', is_active: true, created_at: '2024-02-10', updated_at: '2024-05-01' },
  { id: '12', name: 'Bó hoa cưới cô dâu', description: 'Bó hoa cưới hoa hồng & lan', category_id: '6', category: mockCategories[5], price: 850000, unit: 'bó', is_active: true, created_at: '2024-02-10', updated_at: '2024-05-01' },
  { id: '13', name: 'Hộp hoa Valentine', description: 'Hộp hoa 12 bông hồng đỏ', category_id: '6', category: mockCategories[5], price: 450000, unit: 'hộp', is_active: true, created_at: '2024-03-01', updated_at: '2024-05-01' },
  { id: '14', name: 'Lẵng hoa khai trương', description: 'Lẵng hoa phong phú 2 tầng', category_id: '6', category: mockCategories[5], price: 1200000, unit: 'lẵng', is_active: true, created_at: '2024-03-01', updated_at: '2024-05-01' },
]

export const mockInventory: InventoryItem[] = [
  { id: '1', product_id: '1', product: mockProducts[0], quantity: 120, min_quantity: 30, last_restocked_at: '2024-05-14', created_at: '2024-01-10', updated_at: '2024-05-14' },
  { id: '2', product_id: '2', product: mockProducts[1], quantity: 8, min_quantity: 20, last_restocked_at: '2024-05-10', created_at: '2024-01-10', updated_at: '2024-05-10' },
  { id: '3', product_id: '3', product: mockProducts[2], quantity: 85, min_quantity: 20, last_restocked_at: '2024-05-14', created_at: '2024-01-10', updated_at: '2024-05-14' },
  { id: '4', product_id: '4', product: mockProducts[3], quantity: 4, min_quantity: 15, last_restocked_at: '2024-05-08', created_at: '2024-01-12', updated_at: '2024-05-08' },
  { id: '5', product_id: '5', product: mockProducts[4], quantity: 45, min_quantity: 15, last_restocked_at: '2024-05-14', created_at: '2024-01-12', updated_at: '2024-05-14' },
  { id: '6', product_id: '6', product: mockProducts[5], quantity: 200, min_quantity: 50, last_restocked_at: '2024-05-15', created_at: '2024-01-15', updated_at: '2024-05-15' },
  { id: '7', product_id: '7', product: mockProducts[6], quantity: 150, min_quantity: 50, last_restocked_at: '2024-05-15', created_at: '2024-01-15', updated_at: '2024-05-15' },
  { id: '8', product_id: '8', product: mockProducts[7], quantity: 12, min_quantity: 10, last_restocked_at: '2024-05-12', created_at: '2024-02-01', updated_at: '2024-05-12' },
  { id: '9', product_id: '9', product: mockProducts[8], quantity: 3, min_quantity: 8, last_restocked_at: '2024-05-05', created_at: '2024-02-01', updated_at: '2024-05-05' },
  { id: '10', product_id: '10', product: mockProducts[9], quantity: 60, min_quantity: 20, last_restocked_at: '2024-05-14', created_at: '2024-02-05', updated_at: '2024-05-14' },
  { id: '11', product_id: '11', product: mockProducts[10], quantity: 5, min_quantity: 5, last_restocked_at: '2024-05-13', created_at: '2024-02-10', updated_at: '2024-05-13' },
  { id: '12', product_id: '12', product: mockProducts[11], quantity: 2, min_quantity: 3, last_restocked_at: '2024-05-10', created_at: '2024-02-10', updated_at: '2024-05-10' },
  { id: '13', product_id: '13', product: mockProducts[12], quantity: 8, min_quantity: 5, last_restocked_at: '2024-05-14', created_at: '2024-03-01', updated_at: '2024-05-14' },
  { id: '14', product_id: '14', product: mockProducts[13], quantity: 4, min_quantity: 3, last_restocked_at: '2024-05-12', created_at: '2024-03-01', updated_at: '2024-05-12' },
]

export const mockCustomers: Customer[] = [
  { id: '1', name: 'Nguyễn Thị Lan', phone: '0901234567', email: 'lan.nguyen@gmail.com', address: '123 Lê Lợi, Q1, TP.HCM', birthday: '1990-03-08', total_orders: 12, total_spent: 4250000, created_at: '2024-01-15', updated_at: '2024-05-10' },
  { id: '2', name: 'Trần Văn Nam', phone: '0912345678', email: 'namtran@gmail.com', address: '45 Nguyễn Huệ, Q1, TP.HCM', total_orders: 5, total_spent: 1800000, created_at: '2024-02-01', updated_at: '2024-04-20' },
  { id: '3', name: 'Lê Thị Hoa', phone: '0923456789', email: 'hoale@gmail.com', address: '78 Võ Văn Tần, Q3, TP.HCM', birthday: '1988-07-15', total_orders: 8, total_spent: 3100000, created_at: '2024-01-20', updated_at: '2024-05-05' },
  { id: '4', name: 'Phạm Minh Tuấn', phone: '0934567890', email: 'tuanpham@gmail.com', total_orders: 3, total_spent: 2850000, created_at: '2024-03-10', updated_at: '2024-05-01' },
  { id: '5', name: 'Hoàng Thị Mai', phone: '0945678901', email: 'maihoang@gmail.com', address: '12 Pasteur, Q1, TP.HCM', birthday: '1995-05-20', total_orders: 15, total_spent: 6750000, created_at: '2024-01-05', updated_at: '2024-05-14' },
  { id: '6', name: 'Vũ Đức Thịnh', phone: '0956789012', total_orders: 2, total_spent: 950000, created_at: '2024-04-15', updated_at: '2024-05-08' },
  { id: '7', name: 'Đặng Thị Thu', phone: '0967890123', email: 'thudang@gmail.com', address: '56 Hai Bà Trưng, Q1, TP.HCM', birthday: '1992-12-01', total_orders: 6, total_spent: 2200000, created_at: '2024-02-20', updated_at: '2024-05-12' },
  { id: '8', name: 'Bùi Văn Long', phone: '0978901234', total_orders: 1, total_spent: 450000, created_at: '2024-05-01', updated_at: '2024-05-01' },
  { id: '9', name: 'Ngô Thị Thanh', phone: '0989012345', email: 'thanhng@gmail.com', address: '89 Đinh Tiên Hoàng, Q1, TP.HCM', total_orders: 9, total_spent: 3850000, created_at: '2024-01-25', updated_at: '2024-05-13' },
  { id: '10', name: 'Đinh Văn Hùng', phone: '0990123456', total_orders: 4, total_spent: 1650000, created_at: '2024-03-05', updated_at: '2024-04-28' },
]

export const mockSuppliers: Supplier[] = [
  { id: '1', name: 'Vườn Hoa Đà Lạt', contact_name: 'Nguyễn Văn Sơn', phone: '02633123456', email: 'vuonhoa.dalat@gmail.com', address: 'Phường 8, TP. Đà Lạt, Lâm Đồng', notes: 'Hợp tác lâu năm, chất lượng ổn định. Giao 3 lần/tuần.', is_active: true, created_at: '2023-06-01' },
  { id: '2', name: 'Hoa Tươi Sài Gòn', contact_name: 'Trần Thị Bích', phone: '02838765432', email: 'hoatuoisaigon@gmail.com', address: 'Chợ Hoa Hồ Thị Kỷ, Q10, TP.HCM', notes: 'Chuyên cung cấp hoa nội địa, giá tốt.', is_active: true, created_at: '2023-08-15' },
  { id: '3', name: 'Hoa Nhập Khẩu ECU', contact_name: 'Lê Minh Phú', phone: '02835551234', email: 'hoanhapkhau.ecu@gmail.com', address: 'KCN Tân Bình, TP.HCM', notes: 'Chuyên hoa hồng Ecuador, giá cao nhưng chất lượng rất tốt.', is_active: true, created_at: '2024-01-10' },
  { id: '4', name: 'Lan Rừng Việt', contact_name: 'Phạm Văn Đạt', phone: '02633987654', email: 'lanrung.viet@gmail.com', address: 'Đức Trọng, Lâm Đồng', notes: 'Chuyên các loại lan quý.', is_active: true, created_at: '2024-02-20' },
  { id: '5', name: 'Cung Ứng Hoa Mê Kông', contact_name: 'Huỳnh Văn Tài', phone: '02963456789', email: 'hoamekong@gmail.com', address: 'Sa Đéc, Đồng Tháp', is_active: false, created_at: '2023-11-01' },
]

export const mockOrders: Order[] = [
  {
    id: '1', order_number: 'DH001245', customer_id: '1', customer: mockCustomers[0],
    customer_name: 'Nguyễn Thị Lan', customer_phone: '0901234567',
    status: 'delivered', delivery_type: 'delivery',
    delivery_address: '123 Lê Lợi, Q1, TP.HCM',
    delivery_date: '2024-05-15T10:00:00',
    subtotal: 450000, discount: 0, total: 450000,
    payment_status: 'paid', payment_method: 'transfer',
    created_by: 'Hương',
    items: [
      { id: '1', order_id: '1', product_id: '13', product_name: 'Hộp hoa Valentine', quantity: 1, unit_price: 450000, total_price: 450000 },
    ],
    created_at: '2024-05-15T08:30:00', updated_at: '2024-05-15T11:00:00'
  },
  {
    id: '2', order_number: 'DH001246', customer_id: '5', customer: mockCustomers[4],
    customer_name: 'Hoàng Thị Mai', customer_phone: '0945678901',
    status: 'processing', delivery_type: 'pickup',
    subtotal: 850000, discount: 50000, total: 800000,
    payment_status: 'partial', payment_method: 'cash',
    note: 'Bó hoa cưới. Cần xong trước 14h ngày 16/05',
    created_by: 'Linh',
    items: [
      { id: '2', order_id: '2', product_id: '12', product_name: 'Bó hoa cưới cô dâu', quantity: 1, unit_price: 850000, total_price: 850000 },
    ],
    created_at: '2024-05-16T07:00:00', updated_at: '2024-05-16T08:00:00'
  },
  {
    id: '3', order_number: 'DH001247', customer_name: 'Khách lẻ', customer_phone: '0933111222',
    status: 'pending', delivery_type: 'pickup',
    subtotal: 180000, discount: 0, total: 180000,
    payment_status: 'unpaid',
    created_by: 'Hương',
    items: [
      { id: '3', order_id: '3', product_id: '1', product_name: 'Hoa hồng đỏ nhập khẩu', quantity: 12, unit_price: 15000, total_price: 180000 },
    ],
    created_at: '2024-05-16T09:15:00', updated_at: '2024-05-16T09:15:00'
  },
  {
    id: '4', order_number: 'DH001248', customer_id: '3', customer: mockCustomers[2],
    customer_name: 'Lê Thị Hoa', customer_phone: '0923456789',
    status: 'ready', delivery_type: 'delivery',
    delivery_address: '78 Võ Văn Tần, Q3, TP.HCM',
    delivery_date: '2024-05-16T14:00:00',
    subtotal: 350000, discount: 0, total: 350000,
    payment_status: 'paid', payment_method: 'transfer',
    created_by: 'Linh',
    items: [
      { id: '4', order_id: '4', product_id: '11', product_name: 'Bó hoa sinh nhật', quantity: 1, unit_price: 350000, total_price: 350000 },
    ],
    created_at: '2024-05-16T08:00:00', updated_at: '2024-05-16T10:30:00'
  },
  {
    id: '5', order_number: 'DH001249', customer_id: '9', customer: mockCustomers[8],
    customer_name: 'Ngô Thị Thanh', customer_phone: '0989012345',
    status: 'pending', delivery_type: 'delivery',
    delivery_address: '89 Đinh Tiên Hoàng, Q1, TP.HCM',
    delivery_date: '2024-05-17T10:00:00',
    subtotal: 1200000, discount: 100000, total: 1100000,
    payment_status: 'paid', payment_method: 'transfer',
    note: 'Lẵng hoa khai trương công ty. Gắn băng rôn "Chúc mừng khai trương".',
    created_by: 'Hương',
    items: [
      { id: '5', order_id: '5', product_id: '14', product_name: 'Lẵng hoa khai trương', quantity: 1, unit_price: 1200000, total_price: 1200000 },
    ],
    created_at: '2024-05-16T10:00:00', updated_at: '2024-05-16T10:05:00'
  },
  {
    id: '6', order_number: 'DH001244', customer_name: 'Khách lẻ', customer_phone: '0977888999',
    status: 'cancelled', delivery_type: 'pickup',
    subtotal: 96000, discount: 0, total: 96000,
    payment_status: 'unpaid',
    note: 'Khách hủy do đổi ý',
    created_by: 'Linh',
    items: [
      { id: '6', order_id: '6', product_id: '6', product_name: 'Hoa cúc vàng', quantity: 12, unit_price: 8000, total_price: 96000 },
    ],
    created_at: '2024-05-15T15:00:00', updated_at: '2024-05-15T16:00:00'
  },
]

export const mockRevenueData = [
  { date: '10/05', revenue: 2850000 },
  { date: '11/05', revenue: 3200000 },
  { date: '12/05', revenue: 1950000 },
  { date: '13/05', revenue: 4100000 },
  { date: '14/05', revenue: 3750000 },
  { date: '15/05', revenue: 5200000 },
  { date: '16/05', revenue: 2280000 },
]

export const mockTopProducts = [
  { name: 'Bó hoa sinh nhật', sold: 24, revenue: 8400000 },
  { name: 'Hoa hồng đỏ nhập khẩu', sold: 186, revenue: 2790000 },
  { name: 'Bó hoa cưới cô dâu', sold: 8, revenue: 6800000 },
  { name: 'Hộp hoa Valentine', sold: 12, revenue: 5400000 },
  { name: 'Lẵng hoa khai trương', sold: 4, revenue: 4800000 },
]
