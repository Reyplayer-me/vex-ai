-- Several sample reports at once; /sample rotates through them.

-- Publishing a sample no longer unpublishes the others. _on = false removes one.
DROP FUNCTION IF EXISTS public.set_sample_idea(uuid);
CREATE OR REPLACE FUNCTION public.set_sample_idea(_idea_id uuid, _on boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  UPDATE public.ideas SET is_sample = _on WHERE id = _idea_id AND user_id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.set_sample_idea(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_sample_idea(uuid, boolean) TO authenticated;

-- Every published sample (up to 10), oldest first so the rotation order is stable.
CREATE OR REPLACE FUNCTION public.get_sample_report()
RETURNS TABLE (id uuid, idea text, audience text, result jsonb, full_report jsonb, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT i.id, i.idea, i.audience, i.result, i.full_report, i.created_at
  FROM public.ideas i WHERE i.is_sample ORDER BY i.created_at, i.id LIMIT 10
$$;
GRANT EXECUTE ON FUNCTION public.get_sample_report() TO anon, authenticated;
