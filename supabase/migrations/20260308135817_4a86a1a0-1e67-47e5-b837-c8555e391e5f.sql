CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  email_domain TEXT;
  allowed_domains TEXT[] := ARRAY['gmail.com', 'yahoo.com', 'outlook.com'];
BEGIN
  email_domain := split_part(NEW.email, '@', 2);
  
  IF NOT (email_domain = ANY(allowed_domains)) THEN
    RAISE EXCEPTION 'Sign-ups are restricted to gmail.com, yahoo.com, and outlook.com email addresses.'
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$function$;