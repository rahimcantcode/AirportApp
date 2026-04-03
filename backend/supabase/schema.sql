-- Airport App Next Level schema 
-- Non-ERD app behavior is stored in explicit extension tables (suffix: _meta/_credentials).

begin;

create table if not exists airline (
  airline_code char(2) primary key,
  airline_name text not null
);

create table if not exists gate (
  gate_id integer generated always as identity primary key,
  terminal text not null,
  gate_number text not null,
  unique (terminal, gate_number)
);

create table if not exists flight (
  flight_id char(6) primary key,
  airline_code char(2) not null references airline(airline_code) on delete restrict,
  destination text not null,
  gate_id integer not null references gate(gate_id) on delete restrict,
  flight_status boolean not null default false
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'flight_gate_id_unique'
  ) then
    alter table flight add constraint flight_gate_id_unique unique (gate_id);
  end if;
end $$;

create table if not exists passenger (
  ticket_number char(10) primary key,
  first_name text not null,
  last_name text not null,
  identification char(6) not null,
  flight_id char(6) not null references flight(flight_id) on delete cascade,
  status text not null,
  boarded integer not null default 0 check (boarded in (0, 1))
);

create table if not exists bag (
  bag_id char(6) primary key,
  ticket_number char(10) not null references passenger(ticket_number) on delete cascade,
  flight_id char(6) not null references flight(flight_id) on delete cascade,
  location_type text not null,
  terminal text,
  counter_number text,
  gate_number text,
  status text not null,
  bag_history text not null default '[]'
);

create table if not exists ground_staff (
  ground_staff_id integer generated always as identity primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone char(10) not null,
  username text not null unique,
  current_role text,
  current_gate_id integer references gate(gate_id) on delete set null
);

create table if not exists gate_staff (
  gate_staff_id integer generated always as identity primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone char(10) not null,
  airline_code char(2) not null references airline(airline_code) on delete restrict,
  username text not null unique,
  current_gate_id integer references gate(gate_id) on delete set null
);

create table if not exists airline_staff (
  airline_staff_id integer generated always as identity primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone char(10) not null,
  airline_code char(2) not null references airline(airline_code) on delete restrict,
  username text not null unique
);

create table if not exists login_credentials (
  admin_id integer,
  username text primary key,
  password_hash text not null
);

create table if not exists message (
  message_id integer generated always as identity primary key,
  board_type text not null,
  sender_role text,
  sender_id integer,
  related_flight_id char(6) references flight(flight_id) on delete set null,
  related_bag_id char(6) references bag(bag_id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

-- ERD relation: GROUND_STAFF}|--|{BAG (Can access)
create table if not exists ground_staff_bag_access (
  ground_staff_id integer not null references ground_staff(ground_staff_id) on delete cascade,
  bag_id char(6) not null references bag(bag_id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (ground_staff_id, bag_id)
);

-- Extension table: non-ERD staff credentials for role logins
create table if not exists staff_credentials (
  username text primary key,
  password_hash text not null,
  staff_role text not null check (staff_role in ('airline-staff', 'gate-staff', 'ground-staff')),
  staff_id integer not null,
  unique (staff_role, staff_id)
);

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'login_credentials' and column_name = 'must_change_password'
  ) then
    alter table login_credentials add column must_change_password boolean not null default false;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'staff_credentials' and column_name = 'must_change_password'
  ) then
    alter table staff_credentials add column must_change_password boolean not null default false;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'airline_staff_username_format'
  ) then
    alter table airline_staff add constraint airline_staff_username_format check (username ~ '^[A-Za-z]{2,}[0-9]{2,}$');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'gate_staff_username_format'
  ) then
    alter table gate_staff add constraint gate_staff_username_format check (username ~ '^[A-Za-z]{2,}[0-9]{2,}$');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'ground_staff_username_format'
  ) then
    alter table ground_staff add constraint ground_staff_username_format check (username ~ '^[A-Za-z]{2,}[0-9]{2,}$');
  end if;
end $$;

-- Extension table: non-ERD UI fields for message handling
create table if not exists message_meta (
  message_id integer primary key references message(message_id) on delete cascade,
  subject text not null default 'Operational update',
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  is_read boolean not null default false,
  related_ticket_number char(10) references passenger(ticket_number) on delete set null,
  airline_code char(2) references airline(airline_code) on delete set null,
  author_username text
);

-- Extension table: non-ERD convenience security flag, derived from bag processing
create table if not exists bag_meta (
  bag_id char(6) primary key references bag(bag_id) on delete cascade,
  security_issue boolean not null default false
);

create index if not exists idx_flight_airline_code on flight(airline_code);
create index if not exists idx_flight_gate_id on flight(gate_id);
create index if not exists idx_passenger_flight_id on passenger(flight_id);
create index if not exists idx_bag_ticket_number on bag(ticket_number);
create index if not exists idx_bag_flight_id on bag(flight_id);
create index if not exists idx_message_board_type_created_at on message(board_type, created_at desc);
create index if not exists idx_ground_staff_bag_access_staff on ground_staff_bag_access(ground_staff_id);
create index if not exists idx_ground_staff_bag_access_bag on ground_staff_bag_access(bag_id);

commit;
