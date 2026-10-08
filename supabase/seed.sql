-- Starter content taken from the client brief. Pack sizes and prices are not known yet,
-- so variants are clearly marked "to be confirmed" and have no price ("Price on request").

insert into public.categories (id, name, slug, sort) values
  ('11111111-1111-4111-8111-000000000001', 'Grains & Legumes', 'grains-legumes', 1),
  ('11111111-1111-4111-8111-000000000002', 'Poultry', 'poultry', 2),
  ('11111111-1111-4111-8111-000000000003', 'Fish', 'fish', 3);

insert into public.products
  (id, category_id, name, slug, short_description, description, availability, orderable, bulk_available, sourcing_note, published, featured, sort)
values
  ('22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-000000000001',
   'Sorghum', 'sorghum',
   'Sorghum grown on our family farm in Phamong, Mohale''s Hoek.',
   'Sorghum is where our story began in 2016. It is grown on our family farmland in Phamong, Lekhalong, Ha Makhofola. Contact us for current pack sizes, prices and bulk quantities.',
   'available', true, true, null, true, true, 1),
  ('22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-000000000001',
   'Maize', 'maize',
   'Maize (corn) grown on our family farm in Mohale''s Hoek.',
   'Maize has been part of our crop production since we expanded beyond sorghum. Contact us for current pack sizes, prices and bulk quantities.',
   'available', true, true, null, true, true, 2),
  ('22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-000000000001',
   'Sugar Beans', 'sugar-beans',
   'Sugar beans grown on our family farm in Mohale''s Hoek.',
   'Sugar beans joined our crop production as the farm grew. Contact us for current pack sizes, prices and bulk quantities.',
   'available', true, true, null, true, true, 3),
  ('22222222-2222-4222-8222-000000000004', '11111111-1111-4111-8111-000000000002',
   'Chicken', 'chicken',
   'Fresh, chilled and frozen packaged chicken — coming soon.',
   'We are preparing to launch packaged chicken. Cuts, pack sizes and launch date will be announced soon. Register your interest and we will let you know when it is available.',
   'coming_soon', false, true, null, true, true, 4),
  ('22222222-2222-4222-8222-000000000005', '11111111-1111-4111-8111-000000000003',
   'Rainbow Trout', 'rainbow-trout',
   'Rainbow trout sourced from SanLi in Lesotho, available through Organic Farm Products.',
   'Organic Farm Products does not farm trout. Our rainbow trout is sourced from SanLi in Lesotho and supplied to customers through Organic Farm Products. Contact us for packaging, availability and pricing.',
   'available', true, true, 'Sourced from SanLi, Lesotho. Organic Farm Products supplies this trout; we do not farm it.', true, true, 5);

insert into public.product_variants (id, product_id, label, price_lsl, sort) values
  ('33333333-3333-4333-8333-000000000001', '22222222-2222-4222-8222-000000000001', 'Standard pack (size to be confirmed)', null, 1),
  ('33333333-3333-4333-8333-000000000002', '22222222-2222-4222-8222-000000000002', 'Standard pack (size to be confirmed)', null, 1),
  ('33333333-3333-4333-8333-000000000003', '22222222-2222-4222-8222-000000000003', 'Standard pack (size to be confirmed)', null, 1),
  ('33333333-3333-4333-8333-000000000004', '22222222-2222-4222-8222-000000000004', 'Pack (cuts and size to be announced)', null, 1),
  ('33333333-3333-4333-8333-000000000005', '22222222-2222-4222-8222-000000000005', 'Standard pack (size to be confirmed)', null, 1);

insert into public.posts (title, slug, excerpt, body, published_at) values
  ('A new generation leads Organic Farm Products', 'new-generation-leadership',
   'In January 2026, leadership of the family business passed to Athens Daphney Koali.',
   E'Organic Farm Products was founded in 2016 by Noleaveit Koali and Seyaloyalo Koali as a family-owned agricultural business in Lesotho.\n\nIn January 2026, leadership and ownership of the business passed to the founders'' eldest daughter, Athens Daphney Koali. Athens works closely with Seyaloyalo Koali and her siblings, Africa Koali and Phindiwe Koali.\n\nThe new leadership is building on our agricultural foundation in sorghum, sugar beans and maize, and developing opportunities in food processing, value-added products, poultry, fish, packaging and distribution.',
   '2026-01-15T09:00:00+02:00');

insert into public.settings (id, data) values (1, '{
  "phones": { "agricultural": "+266 5896 9889", "fish": "+266 5965 0416", "poultry": "To be announced" },
  "whatsapp": "+266 5896 9889",
  "email": "organicfarmproducts04@gmail.com",
  "instagram": "https://www.instagram.com/organic.farm.productsls",
  "facebook": "",
  "location": "Mohale''s Hoek, Lesotho",
  "delivery": {
    "areas": "TBD — please contact us",
    "fees": "TBD — please contact us",
    "minimumOrder": "TBD — please contact us",
    "pickup": "TBD — please contact us",
    "days": "TBD — please contact us",
    "coldChain": "TBD — please contact us"
  },
  "registration": { "show": false, "companyName": "Organic Farm Products Pty", "number": "" }
}'::jsonb);
