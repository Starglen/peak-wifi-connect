CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.packages (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_kes integer NOT NULL,
  duration_minutes integer NOT NULL,
  devices integer NOT NULL DEFAULT 1,
  tagline text,
  popular boolean NOT NULL DEFAULT false,
  sort integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.packages TO anon, authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages public" ON public.packages FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.packages (id,name,price_kes,duration_minutes,devices,tagline,popular,sort) VALUES
('1h','1 Hour',10,60,1,'Quick browse',false,1),
('3h','3 Hours',20,180,1,'Catch up & stream',false,2),
('24h','24 Hours',50,1440,1,'All-day access',true,3),
('7d','Weekly',250,10080,2,'Two devices, 7 days',false,4),
('30d','Monthly',800,43200,3,'Best value for home',false,5);

CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id text NOT NULL REFERENCES public.packages(id),
  phone text NOT NULL,
  amount_kes integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  mpesa_ref text,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own purchases read" ON public.purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX purchases_user_idx ON public.purchases(user_id, expires_at DESC);