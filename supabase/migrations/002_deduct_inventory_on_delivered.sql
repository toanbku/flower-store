-- Trigger: giảm tồn kho khi đơn hàng chuyển sang "delivered"
CREATE OR REPLACE FUNCTION deduct_inventory_on_delivered()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE inventory inv
    SET quantity    = GREATEST(0, inv.quantity - oi.quantity),
        updated_at  = NOW()
    FROM order_items oi
    WHERE oi.order_id   = NEW.id
      AND oi.product_id IS NOT NULL
      AND oi.product_id  = inv.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_order_delivered_deduct_inventory
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION deduct_inventory_on_delivered();
