-- ============================================================================
-- Nudge Commerce AI — Supabase PostgreSQL Schema
-- ============================================================================
-- Run this in Supabase SQL Editor to set up the full database schema.
-- All tables use UUID PKs, have created_at/updated_at, and RLS enabled.
-- ============================================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

create type plan_type as enum ('free', 'pro', 'agency');
create type business_type as enum ('cafe', 'bakery', 'clothing', 'fitness', 'handmade', 'restaurant', 'beauty', 'generic');
create type store_status as enum ('draft', 'live', 'suspended');
create type font_style as enum ('modern', 'classic', 'playful', 'minimal');
create type stock_status as enum ('in_stock', 'out_of_stock', 'limited');
create type payment_method as enum ('online', 'cod');
create type order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type payment_status as enum ('pending', 'captured', 'failed', 'refunded');
create type subscription_status as enum ('active', 'cancelled', 'expired', 'past_due');

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- 2.1 profiles — extends auth.users
create table profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  full_name            text,
  phone                text unique,
  avatar_url           text,
  plan                 plan_type not null default 'free',
  plan_expires_at      timestamptz,
  razorpay_customer_id text,
  onboarding_completed boolean default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index profiles_plan_idx on profiles(plan);

alter table profiles enable row level security;

create policy "profiles_own_select" on profiles
  for select using (auth.uid() = id);

create policy "profiles_own_insert" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_own_update" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_own_delete" on profiles
  for delete using (auth.uid() = id);

-- 2.2 stores
create table stores (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references profiles(id) on delete cascade,
  name               text not null,
  slug               text not null unique,
  description        text,
  tagline            text,
  business_type      business_type not null,
  logo_url           text,
  status             store_status not null default 'draft',
  template_id        text not null default 'minimal',
  ai_config          jsonb,
  whatsapp_number    text,
  contact_email      text,
  contact_address    text,
  currency           text not null default 'INR',
  delivery_fee       integer not null default 0,
  free_delivery_above integer,
  published_at       timestamptz,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create index stores_owner_id_idx on stores(owner_id);
create index stores_slug_idx on stores(slug);
create index stores_status_idx on stores(status);

alter table stores enable row level security;

create policy "stores_owner_all" on stores
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "stores_public_select" on stores
  for select using (status = 'live');

-- 2.3 store_themes
create table store_themes (
  id               uuid primary key default gen_random_uuid(),
  store_id         uuid not null unique references stores(id) on delete cascade,
  primary_color    text not null default '#000000',
  accent_color     text not null default '#ffffff',
  background_color text not null default '#ffffff',
  font_style       font_style not null default 'modern',
  sections_order   text[],
  sections_enabled jsonb,
  hero_image_url   text,
  hero_headline    text,
  hero_subheading  text,
  about_text       text,
  social_links     jsonb,
  custom_css       text,
  custom_sections  jsonb default '[]'::jsonb,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table store_themes enable row level security;

create policy "store_themes_owner_all" on store_themes
  for all using (
    exists (select 1 from stores where stores.id = store_themes.store_id and stores.owner_id = auth.uid())
  ) with check (
    exists (select 1 from stores where stores.id = store_themes.store_id and stores.owner_id = auth.uid())
  );

create policy "store_themes_public_select" on store_themes
  for select using (
    exists (select 1 from stores where stores.id = store_themes.store_id and stores.status = 'live')
  );

-- 2.4 store_domains
create table store_domains (
  id               uuid primary key default gen_random_uuid(),
  store_id         uuid not null unique references stores(id) on delete cascade,
  domain           text not null unique,
  verified         boolean not null default false,
  vercel_domain_id text,
  ssl_provisioned  boolean not null default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table store_domains enable row level security;

create policy "store_domains_owner_all" on store_domains
  for all using (
    exists (select 1 from stores where stores.id = store_domains.store_id and stores.owner_id = auth.uid())
  ) with check (
    exists (select 1 from stores where stores.id = store_domains.store_id and stores.owner_id = auth.uid())
  );

-- 2.5 products
create table products (
  id               uuid primary key default gen_random_uuid(),
  store_id         uuid not null references stores(id) on delete cascade,
  name             text not null,
  slug             text not null,
  description      text,
  price            integer not null,
  compare_at_price integer,
  category         text,
  sku              text,
  stock_status     stock_status not null default 'in_stock',
  stock_quantity   integer default 0,
  is_featured      boolean not null default false,
  sort_order       integer not null default 0,
  seo_title        text,
  seo_description  text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique(store_id, slug)
);

create index products_store_id_idx on products(store_id);
create index products_category_idx on products(category);
create index products_is_featured_idx on products(is_featured);

alter table products enable row level security;

create policy "products_owner_all" on products
  for all using (
    exists (select 1 from stores where stores.id = products.store_id and stores.owner_id = auth.uid())
  ) with check (
    exists (select 1 from stores where stores.id = products.store_id and stores.owner_id = auth.uid())
  );

create policy "products_public_select" on products
  for select using (
    exists (select 1 from stores where stores.id = products.store_id and stores.status = 'live')
  );

-- 2.6 product_images
create table product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  url           text not null,
  cloudinary_id text,
  alt_text      text,
  sort_order    integer not null default 0,
  is_primary    boolean not null default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index product_images_product_id_idx on product_images(product_id);

alter table product_images enable row level security;

create policy "product_images_owner_all" on product_images
  for all using (
    exists (select 1 from stores join products on products.store_id = stores.id where products.id = product_images.product_id and stores.owner_id = auth.uid())
  ) with check (
    exists (select 1 from stores join products on products.store_id = stores.id where products.id = product_images.product_id and stores.owner_id = auth.uid())
  );

create policy "product_images_public_select" on product_images
  for select using (
    exists (select 1 from stores join products on products.store_id = stores.id where products.id = product_images.product_id and stores.status = 'live')
  );

-- 2.7 orders
create sequence order_number_seq start 1 increment 1;

create table orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique,
  store_id         uuid not null references stores(id) on delete cascade,
  customer_name    text not null,
  customer_phone   text,
  customer_email   text,
  delivery_address jsonb,
  subtotal         integer not null,
  delivery_fee     integer not null default 0,
  discount_amount  integer not null default 0,
  total            integer not null,
  coupon_code      text,
  payment_method   payment_method not null default 'online',
  status           order_status not null default 'pending',
  notes            text,
  owner_notes      text,
  notified_at      timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index orders_store_id_idx on orders(store_id);
create index orders_status_idx on orders(status);
create index orders_created_at_idx on orders(created_at desc);

alter table orders enable row level security;

create policy "orders_owner_all" on orders
  for all using (
    exists (select 1 from stores where stores.id = orders.store_id and stores.owner_id = auth.uid())
  ) with check (
    exists (select 1 from stores where stores.id = orders.store_id and stores.owner_id = auth.uid())
  );

-- 2.8 order_items
create table order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders(id) on delete cascade,
  product_id     uuid references products(id) on delete set null,
  product_name   text not null,
  product_image  text,
  unit_price     integer not null,
  quantity       integer not null check (quantity > 0),
  total_price    integer not null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index order_items_order_id_idx on order_items(order_id);

alter table order_items enable row level security;

create policy "order_items_owner_all" on order_items
  for all using (
    exists (select 1 from orders join stores on stores.id = orders.store_id where orders.id = order_items.order_id and stores.owner_id = auth.uid())
  ) with check (
    exists (select 1 from orders join stores on stores.id = orders.store_id where orders.id = order_items.order_id and stores.owner_id = auth.uid())
  );

-- 2.9 payments
create table payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null unique references orders(id) on delete cascade,
  razorpay_order_id   text not null unique,
  razorpay_payment_id text unique,
  razorpay_signature  text,
  amount              integer not null,
  currency            text not null default 'INR',
  status              payment_status not null default 'pending',
  method              text,
  error_code          text,
  error_description   text,
  captured_at         timestamptz,
  refunded_at         timestamptz,
  refund_id           text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index payments_order_id_idx on payments(order_id);
create index payments_razorpay_order_id_idx on payments(razorpay_order_id);

alter table payments enable row level security;

create policy "payments_owner_all" on payments
  for all using (
    exists (select 1 from orders join stores on stores.id = orders.store_id where orders.id = payments.order_id and stores.owner_id = auth.uid())
  ) with check (
    exists (select 1 from orders join stores on stores.id = orders.store_id where orders.id = payments.order_id and stores.owner_id = auth.uid())
  );

-- 2.10 subscriptions
create table subscriptions (
  id                        uuid primary key default gen_random_uuid(),
  owner_id                  uuid not null references profiles(id) on delete cascade,
  plan                      plan_type not null,
  status                    subscription_status not null default 'active',
  razorpay_subscription_id  text not null unique,
  current_period_start      timestamptz not null,
  current_period_end        timestamptz not null,
  cancelled_at              timestamptz,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

create index subscriptions_owner_id_idx on subscriptions(owner_id);
create index subscriptions_status_idx on subscriptions(status);

alter table subscriptions enable row level security;

create policy "subscriptions_owner_all" on subscriptions
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- 2.11 ai_generation_logs
create table ai_generation_logs (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references profiles(id) on delete set null,
  store_id       uuid references stores(id) on delete set null,
  input_payload  jsonb,
  output_config  jsonb,
  model_used     text,
  tokens_used    integer,
  duration_ms    integer,
  success        boolean not null default false,
  error_message  text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index ai_generation_logs_owner_id_idx on ai_generation_logs(owner_id);
create index ai_generation_logs_store_id_idx on ai_generation_logs(store_id);
create index ai_generation_logs_created_at_idx on ai_generation_logs(created_at desc);

alter table ai_generation_logs enable row level security;

create policy "ai_generation_logs_owner_all" on ai_generation_logs
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ============================================================================
-- 3. FUNCTIONS
-- ============================================================================

-- 3.0 auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.phone,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3.1 updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3.2 order number generation
create or replace function generate_order_number()
returns trigger as $$
declare
  year text;
  seq text;
begin
  year := to_char(now(), 'YYYY');
  seq := lpad(nextval('order_number_seq')::text, 5, '0');
  new.order_number := 'NUD-' || year || '-' || seq;
  return new;
end;
$$ language plpgsql;

-- 3.3 free-plan product limit check
create or replace function check_product_limit()
returns trigger as $$
declare
  owner_plan plan_type;
  product_count integer;
begin
  select p.plan into owner_plan
  from profiles p
  join stores s on s.owner_id = p.id
  where s.id = new.store_id;

  if owner_plan = 'free' then
    select count(*) into product_count
    from products
    where store_id = new.store_id;

    if product_count >= 5 then
      raise exception 'Free plan limit reached: maximum 5 products per store. Upgrade to pro to add more.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

-- 3.4 free-plan store limit check
create or replace function check_store_limit()
returns trigger as $$
declare
  owner_plan plan_type;
  store_count integer;
begin
  select plan into owner_plan
  from profiles
  where id = new.owner_id;

  if owner_plan = 'free' then
    select count(*) into store_count
    from stores
    where owner_id = new.owner_id;

    if store_count >= 1 then
      raise exception 'Free plan limit reached: maximum 1 store. Upgrade to pro to create more.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- 4.0 auto-create profile trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 4.1 updated_at triggers on all tables
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger update_stores_updated_at
  before update on stores
  for each row execute function update_updated_at();

create trigger update_store_themes_updated_at
  before update on store_themes
  for each row execute function update_updated_at();

create trigger update_store_domains_updated_at
  before update on store_domains
  for each row execute function update_updated_at();

create trigger update_products_updated_at
  before update on products
  for each row execute function update_updated_at();

create trigger update_product_images_updated_at
  before update on product_images
  for each row execute function update_updated_at();

create trigger update_orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

create trigger update_order_items_updated_at
  before update on order_items
  for each row execute function update_updated_at();

create trigger update_payments_updated_at
  before update on payments
  for each row execute function update_updated_at();

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at();

create trigger update_ai_generation_logs_updated_at
  before update on ai_generation_logs
  for each row execute function update_updated_at();

-- 4.2 order number trigger
create trigger set_order_number
  before insert on orders
  for each row
  when (new.order_number is null)
  execute function generate_order_number();

-- 4.3 product limit trigger
create trigger enforce_product_limit
  before insert on products
  for each row execute function check_product_limit();

-- 4.4 store limit trigger
create trigger enforce_store_limit
  before insert on stores
  for each row execute function check_store_limit();

-- ============================================================================
-- 5. CHAT / AI ASSISTANT
-- ============================================================================

create type chat_role as enum ('user', 'assistant');

create table chat_messages (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores(id) on delete cascade,
  owner_id   uuid not null references profiles(id) on delete cascade,
  role       chat_role not null,
  content    text not null,
  metadata   jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index chat_messages_store_idx on chat_messages(store_id, created_at);

alter table chat_messages enable row level security;

create policy "chat_messages_own_select" on chat_messages
  for select using (auth.uid() = owner_id);

create policy "chat_messages_own_insert" on chat_messages
  for insert with check (auth.uid() = owner_id);

create policy "chat_messages_own_update" on chat_messages
  for update using (auth.uid() = owner_id);

create policy "chat_messages_own_delete" on chat_messages
  for delete using (auth.uid() = owner_id);
