INSERT INTO pedidos (producto_id, usuario_id, cantidad, total, estado, creado_en)
SELECT p.id, u.id, q.c, p.precio * q.c, e.estado,
       now() - (random() * 45) * interval '1 day'
FROM generate_series(1, 60) g
CROSS JOIN LATERAL (
  SELECT id, precio FROM productos
  WHERE estado = 'aprobado' ORDER BY random() + g * 0 LIMIT 1
) p
CROSS JOIN LATERAL (
  SELECT id FROM usuarios
  WHERE estado = 'aprobado' ORDER BY random() + g * 0 LIMIT 1
) u
CROSS JOIN LATERAL (
  SELECT 1 + floor(random() * 4 + g * 0)::int AS c
) q
CROSS JOIN LATERAL (
  SELECT (ARRAY['pendiente_de_pago','pagado','pagado','confirmado','enviado','enviado','cancelado'])
         [1 + floor(random() * 7 + g * 0)::int] AS estado
) e;
