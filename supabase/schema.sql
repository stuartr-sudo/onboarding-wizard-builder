-- Create types
create type user_role as enum ('super_admin', 'admin', 'client');

-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role user_role default 'admin'::user_role,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Wizards
create table wizards (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  theme_color_primary text default '#000000',
  theme_color_secondary text default '#ffffff',
  font_family text default 'Inter',
  logo_url text,
  background_url text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Wizard Steps
create table wizard_steps (
  id uuid default gen_random_uuid() primary key,
  wizard_id uuid references wizards(id) on delete cascade not null,
  step_number int not null,
  title text,
  description text,
  layout_style text default 'single-column',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Wizard Fields
create table wizard_fields (
  id uuid default gen_random_uuid() primary key,
  step_id uuid references wizard_steps(id) on delete cascade not null,
  field_type text not null, -- text_input, dropdown, etc.
  label text not null,
  options jsonb, -- For dropdowns, toggles, etc.
  required boolean default false,
  order_index int default 0,
  created_at timestamptz default now()
);

-- Submissions
create table wizard_submissions (
  id uuid default gen_random_uuid() primary key,
  wizard_id uuid references wizards(id) on delete cascade not null,
  submitted_at timestamptz default now(),
  submitted_by_ip text,
  metadata jsonb
);

-- Responses
create table wizard_responses (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references wizard_submissions(id) on delete cascade not null,
  field_id uuid references wizard_fields(id) on delete cascade not null,
  value text, -- Storing simple values here. Complex/JSON values can use JSONB if needed, but text usually covers most.
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table wizards enable row level security;
alter table wizard_steps enable row level security;
alter table wizard_fields enable row level security;
alter table wizard_submissions enable row level security;
alter table wizard_responses enable row level security;

-- RLS Policies

-- Profiles:
-- Anyone can read their own profile
create policy "Users can see own profile" on profiles
  for select using (auth.uid() = id);
-- Super admins can see all profiles (Assuming we have a function or way to check super_admin, for simplicity initially allowing auth users to read own, maybe public if needed? No, internal.)

-- Wizards/Steps/Fields:
-- Public read access (for rendering the wizard to clients)
create policy "Wizards are viewable by everyone" on wizards
  for select using (true);
create policy "Steps are viewable by everyone" on wizard_steps
  for select using (true);
create policy "Fields are viewable by everyone" on wizard_fields
  for select using (true);

-- Admins can insert/update/delete wizards
create policy "Admins can manage wizards" on wizards
  for all using (auth.uid() in (select id from profiles where role in ('admin', 'super_admin')));

create policy "Admins can manage steps" on wizard_steps
  for all using (auth.uid() in (select id from profiles where role in ('admin', 'super_admin')));

create policy "Admins can manage fields" on wizard_fields
  for all using (auth.uid() in (select id from profiles where role in ('admin', 'super_admin')));


-- Submissions:
-- Public can insert (submit)
create policy "Anyone can submit" on wizard_submissions
  for insert with check (true);

-- Admins can view submissions
create policy "Admins can view submissions" on wizard_submissions
  for select using (auth.uid() in (select id from profiles where role in ('admin', 'super_admin')));

-- Responses:
-- Public can insert
create policy "Anyone can submit responses" on wizard_responses
  for insert with check (true);

-- Admins can view responses
create policy "Admins can view responses" on wizard_responses
  for select using (auth.uid() in (select id from profiles where role in ('admin', 'super_admin')));


-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'admin'); -- Defaulting to admin for this app context as it's an internal tool mostly? Or maybe 'client'? Prompt says clients are unauthenticated. So authenticated users are admins.
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage Buckets (handled via API usually, but can define policies if buckets exist)
-- We will need buckets: 'wizard-assets' and 'submissions'


