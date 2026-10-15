CREATE TABLE public.contact_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
 email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
 message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX contact_messages_email_created_idx ON public.contact_messages (email, created_at DESC);
CREATE FUNCTION public.submit_contact_message(p_name text, p_email text, p_message text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
 p_name := btrim(p_name); p_email := lower(btrim(p_email)); p_message := btrim(p_message);
 IF p_name IS NULL OR char_length(p_name) NOT BETWEEN 1 AND 100 OR p_email IS NULL OR char_length(p_email) > 255 OR p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR p_message IS NULL OR char_length(p_message) NOT BETWEEN 1 AND 1000 THEN
  RAISE EXCEPTION 'Invalid message';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_email, 0));
 IF EXISTS (SELECT 1 FROM public.contact_messages WHERE email = p_email AND created_at > now() - interval '1 minute') THEN
  RAISE EXCEPTION 'Please wait one minute before sending another message';
 END IF;
 INSERT INTO public.contact_messages(name, email, message) VALUES(p_name, p_email, p_message) RETURNING id INTO new_id;
 RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_contact_message(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_contact_message(text, text, text) TO anon, authenticated, service_role;