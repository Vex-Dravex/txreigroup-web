-- Insert into auth.users
INSERT INTO auth.users (id, email, aud, role, created_at, updated_at)
VALUES
 ('8d3c63d8-57e3-4428-ba2e-067755c3c0a1', 'maria@lonestargb.com', 'authenticated', 'authenticated', now(), now()),
 ('f4917400-b618-4221-8255-0d29377651a2', 'andre@bluebonnetplumbing.com', 'authenticated', 'authenticated', now(), now()),
 ('a1d82084-3c66-4176-9653-90226301e2b3', 'lena@skylineexteriors.com', 'authenticated', 'authenticated', now(), now()),
 ('c5e91122-8f50-482a-b733-14568902f3c4', 'service@hchvac.com', 'authenticated', 'authenticated', now(), now()),
 ('e9204432-6a71-4951-8944-45678913d4d5', 'projects@coastalfinish.com', 'authenticated', 'authenticated', now(), now()),
 ('b7113344-9c82-4062-9511-78901234e5e6', 'robin@greenbeltoutdoor.com', 'authenticated', 'authenticated', now(), now()),
 ('d8224455-1f93-4173-9622-89012345f6f1', 'investors@bayoutitle.com', 'authenticated', 'authenticated', now(), now()),
 ('a9335566-2e84-4284-9733-90123456a7a2', 'derick@lsescrow.com', 'authenticated', 'authenticated', now(), now()),
 ('c0446677-3d75-4395-9844-01234567b8b3', 'monica@cedarcapital.com', 'authenticated', 'authenticated', now(), now()),
 ('e1557788-4c66-4406-9955-12345678c9c4', 'acquisitions@sunsetgator.com', 'authenticated', 'authenticated', now(), now()),
 ('f2668899-5b57-4517-1066-23456789d0d5', 'leah@bbtxops.com', 'authenticated', 'authenticated', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Vendors into profiles
INSERT INTO public.profiles (id, display_name, email, role, bio, avatar_url, banner_url, status)
VALUES
  ('8d3c63d8-57e3-4428-ba2e-067755c3c0a1', 'Lone Star General Builders', 'maria@lonestargb.com', 'contractor', 'Design-build GC that understands holding costs and lender draw schedules.', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80', 'active'),
  ('f4917400-b618-4221-8255-0d29377651a2', 'Bluebonnet Plumbing & Mechanical', 'andre@bluebonnetplumbing.com', 'contractor', 'Rough-ins, repipes, water heaters, and gas tests.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?auto=format&fit=crop&w=1200&q=80', 'active'),
  ('a1d82084-3c66-4176-9653-90226301e2b3', 'Skyline Roofing & Exteriors', 'lena@skylineexteriors.com', 'contractor', 'Full roof replacements, gutters, and exterior repairs.', 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=1200&q=80', 'active'),
  ('c5e91122-8f50-482a-b733-14568902f3c4', 'Hill Country HVAC & Electrical', 'service@hchvac.com', 'contractor', 'Installations, change-outs, and electrical upgrades.', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80', 'active'),
  ('e9204432-6a71-4951-8944-45678913d4d5', 'Coastal Finish Drywall + Paint', 'projects@coastalfinish.com', 'contractor', 'Drywall hangs, level 4/5 finishes, texture matching.', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80', 'active'),
  ('b7113344-9c82-4062-9511-78901234e5e6', 'GreenBelt Landscape & Outdoor', 'robin@greenbeltoutdoor.com', 'contractor', 'Curb appeal and outdoor living that sell the deal.', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1200&q=80', 'active'),
  
  -- Insert Sample Transaction Services
  ('d8224455-1f93-4173-9622-89012345f6f1', 'Bayou Title Partners', 'investors@bayoutitle.com', 'wholesaler', 'Investor-first title team with fast turn commitments.', NULL, NULL, 'active'),
  ('a9335566-2e84-4284-9733-90123456a7a2', 'Lone Star Escrow Co.', 'derick@lsescrow.com', 'wholesaler', 'Escrow officers who keep assignment deals moving.', NULL, NULL, 'active'),
  ('c0446677-3d75-4395-9844-01234567b8b3', 'Cedar Capital Private Money', 'monica@cedarcapital.com', 'wholesaler', 'Fast approvals for buy-and-hold investors.', NULL, NULL, 'active'),
  ('e1557788-4c66-4406-9955-12345678c9c4', 'Sunset Gator Buyers', 'acquisitions@sunsetgator.com', 'investor', 'Close-ready cash buyers across Texas metros.', NULL, NULL, 'active'),
  ('f2668899-5b57-4517-1066-23456789d0d5', 'Bluebonnet Transaction Ops', 'leah@bbtxops.com', 'wholesaler', 'Coordinators who manage docs and deadlines.', NULL, NULL, 'active')
ON CONFLICT (id) DO NOTHING;
