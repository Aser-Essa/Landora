-- ============================================================================
-- Landora production-oriented initial schema
-- PostgreSQL / Supabase | Authentication provider: Clerk
-- IMPORTANT: RLS is intentionally NOT enabled and no RLS policies are created.
-- Run first in a new/staging Supabase project and review before production.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Shared updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Application users (Clerk remains the identity/authentication source)
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  name text,
  email text,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'pending_deletion')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint users_clerk_user_id_not_blank check (length(btrim(clerk_user_id)) > 0),
  constraint users_email_not_blank check (email is null or length(btrim(email)) > 0)
);

create index users_status_idx on public.users (status);

-- ---------------------------------------------------------------------------
-- 3. Supported platforms: catalogue rows are seeded below
-- ---------------------------------------------------------------------------
create table public.platforms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_enabled boolean not null default true,
  capabilities jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platforms_slug_format check (slug ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint platforms_name_not_blank check (length(btrim(name)) > 0),
  constraint platforms_capabilities_object check (jsonb_typeof(capabilities) = 'object')
);

insert into public.platforms (slug, name, capabilities)
values
  ('shopify', 'Shopify', '{"store_connection":true,"landing_publish":true}'::jsonb),
  ('wordpress', 'WordPress', '{"store_connection":true,"landing_publish":true}'::jsonb),
  ('easy_orders', 'Easy Orders', '{"store_connection":true,"landing_publish":true}'::jsonb)
on conflict (slug) do update
set name = excluded.name,
    capabilities = excluded.capabilities,
    updated_at = now();

-- ---------------------------------------------------------------------------
-- 4. Stores owned by Landora users
-- ---------------------------------------------------------------------------

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  logo_url text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'connection_required', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint stores_name_not_blank
    check (length(btrim(name)) > 0),

  constraint stores_logo_url_not_blank
    check (logo_url is null or length(btrim(logo_url)) > 0),

  unique (id, user_id)
);

create index stores_user_created_idx
  on public.stores (user_id, created_at desc);

create index stores_status_idx
  on public.stores (user_id, status);

-- ---------------------------------------------------------------------------
-- 5. Connections from a Landora store to an external platform
-- Secrets themselves are NOT stored here. See integration_secrets below.
-- ---------------------------------------------------------------------------
create table public.store_integrations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  platform_id uuid not null references public.platforms(id) on delete restrict,

  status text not null default 'pending'
    check (status in ('pending', 'connected', 'error', 'disconnected')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (store_id, platform_id),
  unique (id, store_id),
  unique (id, store_id, platform_id)
);

create index store_integrations_status_idx
  on public.store_integrations (status, updated_at desc);


-- ---------------------------------------------------------------------------
-- Store Vault secret references, never decrypted credentials.
-- vault_secret_id references the secret managed by Supabase Vault.
-- ---------------------------------------------------------------------------
create table public.integration_secrets (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null
    references public.store_integrations(id) on delete cascade,

  secret_name text not null,
  vault_secret_id uuid not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint integration_secrets_key_not_blank
    check (length(btrim(secret_name)) > 0),

  unique (integration_id, secret_name),
  unique (vault_secret_id)
);

create index integration_secrets_integration_idx
  on public.integration_secrets (integration_id);


-- ---------------------------------------------------------------------------
-- 6. Products: imported from a store or created manually/image-search flow
-- store_id is nullable so a manually entered product need not belong to a
-- store until the user selects a publishing destination.
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  store_id uuid,
  source_integration_id uuid,
  external_product_id text,

  source_type text not null default 'manual'
    check (source_type in ('manual', 'store_import', 'image_search')),

  name text not null,
  description text,
  price numeric(12,2),
  compare_at_price numeric(12,2),
  currency_code char(3),

  ai_research text,
  product_data jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_store_owner_fk
    foreign key (store_id, user_id)
    references public.stores(id, user_id)
    on delete cascade,

  constraint products_source_integration_fk
    foreign key (source_integration_id, store_id)
    references public.store_integrations(id, store_id)
    on delete set null (source_integration_id),

  constraint products_name_not_blank
    check (length(btrim(name)) > 0),

  constraint products_price_nonnegative
    check (price is null or price >= 0),

  constraint products_compare_price_nonnegative
    check (compare_at_price is null or compare_at_price >= 0),

  constraint products_currency_code_format
    check (currency_code is null or currency_code ~ '^[A-Z]{3}$'),

  constraint products_product_data_object
    check (jsonb_typeof(product_data) = 'object'),

  constraint products_import_source_fields
    check (
      source_type <> 'store_import'
      or (
        store_id is not null
        and source_integration_id is not null
        and external_product_id is not null
        and length(btrim(external_product_id)) > 0
      )
    ),

  unique (id, user_id),
  unique (id, store_id, user_id)
);

-- Products ordered by creation date for each user
create index products_user_created_idx
  on public.products (user_id, created_at desc);

-- Products belonging to a specific store
create index products_store_created_idx
  on public.products (store_id, created_at desc)
  where store_id is not null;

-- Search products by name
create index products_name_search_idx
  on public.products using gin (to_tsvector('simple', name));

-- Prevent importing the same external product more than once
create unique index products_external_id_unique_idx
  on public.products (source_integration_id, external_product_id)
  where source_integration_id is not null
    and external_product_id is not null;


create table public.product_images (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id) on delete cascade,

  is_primary boolean not null default false,
  sort_order integer not null default 0
    check (sort_order >= 0),

  storage_bucket text not null,
  storage_path text not null,
  url text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint product_images_storage_bucket_not_blank
    check (length(btrim(storage_bucket)) > 0),

  constraint product_images_storage_path_not_blank
    check (length(btrim(storage_path)) > 0),

  constraint product_images_url_not_blank
    check (length(btrim(url)) > 0),

  constraint product_images_storage_location_unique
    unique (storage_bucket, storage_path)
);

-- Retrieve product images in display order
create index product_images_product_order_idx
  on public.product_images (product_id, sort_order, created_at);

-- Allow only one primary image per product
create unique index product_images_one_primary_per_product_idx
  on public.product_images (product_id)
  where is_primary;

-- ---------------------------------------------------------------------------
-- 7. Landing pages
-- Template and JSON data files are stored separately from this table.
-- ---------------------------------------------------------------------------
create table public.landings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null,
  store_id uuid,
  platform_id uuid not null references public.platforms(id) on delete restrict,
  current_version_id uuid,

  name text not null,
  status text not null default 'draft'
    check (
      status in (
        'draft',
        'generating',
        'ready',
        'publishing',
        'published',
        'error',
        'archived'
      )
    ),

  last_saved_at timestamptz,
  last_published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint landings_product_owner_fk
    foreign key (product_id, user_id)
    references public.products(id, user_id)
    on delete cascade,

  constraint landings_store_owner_fk
    foreign key (store_id, user_id)
    references public.stores(id, user_id)
    on delete cascade,

  constraint landings_name_not_blank
    check (length(btrim(name)) > 0),

  unique (id, user_id),
  unique (id, platform_id)
);

-- User's landing pages, most recently updated first
create index landings_user_updated_idx
  on public.landings (user_id, updated_at desc);

-- Landing pages belonging to a product
create index landings_product_created_idx
  on public.landings (product_id, created_at desc);

-- Landing pages associated with a store
create index landings_store_created_idx
  on public.landings (store_id, created_at desc)
  where store_id is not null;

-- Filter a user's landing pages by status
create index landings_user_status_idx
  on public.landings (user_id, status);





-- ---------------------------------------------------------------------------
-- 8. Landing versions: immutable version history
-- Save a new row per successful save/version; do not overwrite old versions.
-- ---------------------------------------------------------------------------

create table public.landing_versions (
  id uuid primary key default gen_random_uuid(),

  landing_id uuid not null
    references public.landings(id) on delete cascade,

  created_by_user_id uuid
    references public.users(id) on delete set null,

  version_number integer not null
    check (version_number > 0),

  change_summary text,

  created_at timestamptz not null default now(),

  constraint landing_versions_change_summary_not_blank
    check (
      change_summary is null
      or length(btrim(change_summary)) > 0
    ),

  constraint landing_versions_landing_version_unique
    unique (landing_id, version_number),

  constraint landing_versions_id_landing_unique
    unique (id, landing_id)
);

-- Retrieve version history in descending order
create index landing_versions_history_idx
  on public.landing_versions (landing_id, version_number desc);


-- Ensure the current version belongs to the same landing page
alter table public.landings
  add constraint landings_current_version_fk
  foreign key (current_version_id, id)
  references public.landing_versions(id, landing_id)
  on delete set null (current_version_id);


-- ---------------------------------------------------------------------------
-- Assets used by a landing page version.
-- Binary content lives in Supabase Storage or an external asset provider.
-- ---------------------------------------------------------------------------

create table public.landing_assets (
  id uuid primary key default gen_random_uuid(),

  version_id uuid not null
    references public.landing_versions(id) on delete cascade,

  storage_bucket text not null,
  storage_path text not null,
  url text,

  file_name text not null,

  asset_type text not null
    check (
      asset_type in (
        'template',
        'data',
        'image',
        'stylesheet',
        'script',
        'other'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint landing_assets_file_name_not_blank
    check (length(btrim(file_name)) > 0),

  constraint landing_assets_storage_bucket_not_blank
    check (length(btrim(storage_bucket)) > 0),

  constraint landing_assets_storage_path_not_blank
    check (length(btrim(storage_path)) > 0),

  constraint landing_assets_url_not_blank
    check (url is null or length(btrim(url)) > 0),

  constraint landing_assets_version_storage_path_unique
    unique (version_id, storage_bucket, storage_path)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index landing_assets_version_created_idx
  on public.landing_assets (version_id, created_at desc);



-- ---------------------------------------------------------------------------
-- 13. updated_at triggers
-- ---------------------------------------------------------------------------
create trigger users_set_updated_at before update on public.users
for each row execute function public.set_updated_at();

create trigger platforms_set_updated_at before update on public.platforms
for each row execute function public.set_updated_at();

create trigger stores_set_updated_at before update on public.stores
for each row execute function public.set_updated_at();

create trigger store_integrations_set_updated_at before update on public.store_integrations
for each row execute function public.set_updated_at();

create trigger integration_secrets_set_updated_at before update on public.integration_secrets
for each row execute function public.set_updated_at();

create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

create trigger product_images_set_updated_at before update on public.product_images
for each row execute function public.set_updated_at();

create trigger landing_assets_set_updated_at before update on public.landing_assets
for each row execute function public.set_updated_at();

create trigger landings_set_updated_at before update on public.landings
for each row execute function public.set_updated_at();


commit;

-- ---------------------------------------------------------------------------
-- RLS intentionally omitted per project owner request.
-- Before exposing any table through Supabase APIs, implement and test RLS
-- policies manually. Also restrict direct access to integration_secrets and
-- never expose Vault decrypted-secret views to client roles.
-- ---------------------------------------------------------------------------
