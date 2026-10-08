-- Organic Farm Products: initial schema.
-- Only the Worker API (service_role) reads/writes these tables. RLS is enabled with
-- no policies, so the public anon key used by the website for admin sign-in cannot touch data.

create extension if not exists pgcrypto;

-- ---------- helpers ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- catalogue ----------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  short_description text not null default '',
  description text not null default '',
  images text[] not null default '{}',
  availability text not null default 'available'
    check (availability in ('available', 'coming_soon', 'seasonal', 'out_of_stock')),
  orderable boolean not null default true,
  bulk_available boolean not null default false,
  sourcing_note text,
  published boolean not null default false,
  featured boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,
  price_lsl numeric(12, 2) check (price_lsl is null or price_lsl >= 0), -- null = "Price on request"
  sort int not null default 0
);
create index product_variants_product_idx on public.product_variants (product_id);

-- ---------- news ----------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  cover text,
  body text not null default '',
  published_at timestamptz, -- null = draft
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------- site settings (single row) ----------

create table public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------- orders ----------

create sequence public.order_ref_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique
    default 'OFP-' || to_char(now() at time zone 'Africa/Maseru', 'YYMM') || '-'
      || lpad(nextval('public.order_ref_seq')::text, 4, '0'),
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'ready', 'delivered', 'cancelled')),
  customer_name text not null,
  phone text not null,
  email text,
  customer_type text not null
    check (customer_type in ('individual', 'restaurant', 'hotel', 'retailer', 'wholesaler', 'institution', 'other')),
  business_name text,
  district text not null,
  fulfilment text not null check (fulfilment in ('delivery', 'pickup')),
  address text,
  notes text,
  admin_notes text,
  estimated_total numeric(12, 2),
  has_unpriced_items boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_status_created_idx on public.orders (status, created_at desc);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  -- snapshots at order time, so later catalogue edits don't change past orders
  product_name text not null,
  variant_label text not null,
  qty int not null check (qty > 0),
  unit_price numeric(12, 2)
);
create index order_items_order_idx on public.order_items (order_id);

-- Inserts an order and its items in one transaction. Called by the API after it has
-- validated the request and priced every item from the database.
create or replace function public.create_order(p_order jsonb, p_items jsonb)
returns table (id uuid, ref text)
language plpgsql
as $$
declare
  v_id uuid;
  v_ref text;
begin
  insert into public.orders (
    customer_name, phone, email, customer_type, business_name, district,
    fulfilment, address, notes, estimated_total, has_unpriced_items
  ) values (
    p_order ->> 'customer_name',
    p_order ->> 'phone',
    nullif(p_order ->> 'email', ''),
    p_order ->> 'customer_type',
    p_order ->> 'business_name',
    p_order ->> 'district',
    p_order ->> 'fulfilment',
    p_order ->> 'address',
    p_order ->> 'notes',
    (p_order ->> 'estimated_total')::numeric,
    coalesce((p_order ->> 'has_unpriced_items')::boolean, false)
  )
  returning orders.id, orders.ref into v_id, v_ref;

  insert into public.order_items (order_id, product_id, variant_id, product_name, variant_label, qty, unit_price)
  select v_id,
         (i ->> 'product_id')::uuid,
         (i ->> 'variant_id')::uuid,
         i ->> 'product_name',
         i ->> 'variant_label',
         (i ->> 'qty')::int,
         (i ->> 'unit_price')::numeric
  from jsonb_array_elements(p_items) as i;

  return query select v_id, v_ref;
end;
$$;
revoke execute on function public.create_order(jsonb, jsonb) from public, anon, authenticated;

-- ---------- enquiries ----------

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('wholesale', 'notify', 'contact')),
  name text not null,
  phone text not null,
  email text,
  business text,
  message text,
  status text not null default 'new' check (status in ('new', 'handled')),
  created_at timestamptz not null default now()
);
create index enquiries_status_created_idx on public.enquiries (status, created_at desc);

-- ---------- admins ----------

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- lock everything down ----------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.posts enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.enquiries enable row level security;
alter table public.admins enable row level security;

-- ---------- storage: public bucket for product & news images ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;
