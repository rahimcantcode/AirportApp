begin;

insert into airline (airline_code, airline_name) values
  ('AA', 'American Airlines'),
  ('DL', 'Delta Air Lines')
on conflict do nothing;

insert into gate (terminal, gate_number) values
  ('T1', 'G12'),
  ('T1', 'G23')
on conflict (terminal, gate_number) do nothing;

insert into flight (flight_id, airline_code, destination, gate_id, flight_status)
select 'DL0245', 'DL', 'Atlanta', g.gate_id, false
from gate g where g.terminal='T1' and g.gate_number='G12'
on conflict (flight_id) do nothing;

insert into flight (flight_id, airline_code, destination, gate_id, flight_status)
select 'AA0108', 'AA', 'Chicago', g.gate_id, false
from gate g where g.terminal='T1' and g.gate_number='G23'
on conflict (flight_id) do nothing;

insert into passenger (ticket_number, first_name, last_name, identification, flight_id, status, boarded) values
  ('1234567890', 'Alice', 'Passenger', '123456', 'DL0245', 'not-checked-in', 0),
  ('0987654321', 'Bob', 'Passenger', '654321', 'AA0108', 'checked-in', 0)
on conflict (ticket_number) do nothing;

insert into bag (bag_id, ticket_number, flight_id, location_type, terminal, counter_number, gate_number, status, bag_history) values
  ('100001', '0987654321', 'AA0108', 'check-in-counter', 'T1', 'C05', 'G23', 'check-in-counter', '[]'),
  ('100002', '0987654321', 'AA0108', 'check-in-counter', 'T1', 'C05', 'G23', 'check-in-counter', '[]')
on conflict (bag_id) do nothing;

insert into bag_meta (bag_id, security_issue) values
  ('100001', false),
  ('100002', false)
on conflict (bag_id) do nothing;

insert into airline_staff (first_name, last_name, email, phone, airline_code, username)
values ('Alice', 'Airline', 'alice.airline@example.com', '2145550101', 'AA', 'al01')
on conflict (username) do nothing;

insert into gate_staff (first_name, last_name, email, phone, airline_code, username)
values ('Bob', 'Gate', 'bob.gate@example.com', '2145550102', 'AA', 'bg02')
on conflict (username) do nothing;

insert into ground_staff (first_name, last_name, email, phone, username, current_role)
values ('Charlie', 'Ground', 'charlie.ground@example.com', '2145550103', 'cg03', null)
on conflict (username) do nothing;

insert into login_credentials (admin_id, username, password_hash)
values (1, 'admin', '$2b$10$FVOu02QnFMcGuRw7rErLleq1Nh9PSEFBulEtbfPGrx9rZ7PSOqCAS')
on conflict (username) do update
set admin_id = excluded.admin_id,
    password_hash = excluded.password_hash,
    must_change_password = false;

insert into staff_credentials (username, password_hash, staff_role, staff_id)
select 'al01', '$2b$10$7/BKGF2NFRD16nYQoOlRV.9Gf9NyRW3tny5A0mqJKSf0o4xnjW9Q6', 'airline-staff', airline_staff_id from airline_staff where username='al01'
on conflict (username) do update
set password_hash = excluded.password_hash,
    staff_role = excluded.staff_role,
    staff_id = excluded.staff_id,
    must_change_password = false;

insert into staff_credentials (username, password_hash, staff_role, staff_id)
select 'bg02', '$2b$10$7/BKGF2NFRD16nYQoOlRV.9Gf9NyRW3tny5A0mqJKSf0o4xnjW9Q6', 'gate-staff', gate_staff_id from gate_staff where username='bg02'
on conflict (username) do update
set password_hash = excluded.password_hash,
    staff_role = excluded.staff_role,
    staff_id = excluded.staff_id,
    must_change_password = false;

insert into staff_credentials (username, password_hash, staff_role, staff_id)
select 'cg03', '$2b$10$7/BKGF2NFRD16nYQoOlRV.9Gf9NyRW3tny5A0mqJKSf0o4xnjW9Q6', 'ground-staff', ground_staff_id from ground_staff where username='cg03'
on conflict (username) do update
set password_hash = excluded.password_hash,
    staff_role = excluded.staff_role,
    staff_id = excluded.staff_id,
    must_change_password = false;

insert into message (board_type, sender_role, sender_id, content)
values ('ground-staff', 'system', 0, 'Select Security Clearance or Gate Ops before updating bag locations.')
returning message_id;

insert into message_meta (message_id, subject, severity, is_read)
select message_id, 'Operational update', 'info', true
from message
order by message_id desc
limit 1
on conflict (message_id) do nothing;

insert into ground_staff_bag_access (ground_staff_id, bag_id)
select gs.ground_staff_id, b.bag_id
from ground_staff gs
cross join bag b
where gs.username = 'cg03'
on conflict do nothing;

commit;
