CREATE TABLE public.feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'feedback' CHECK (kind IN ('feedback','contact')),
  name text CHECK (char_length(name) <= 100),
  email text CHECK (char_length(email) <= 255),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  page text CHECK (char_length(page) <= 200),
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.feedback_submissions TO anon, authenticated;
CREATE POLICY "Anyone can submit feedback" ON public.feedback_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());