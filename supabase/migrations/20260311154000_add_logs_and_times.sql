-- Log Administrative Activities
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can view activity logs') THEN
    CREATE POLICY "Admins can view activity logs" ON public.activity_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can insert activity logs') THEN
    CREATE POLICY "Admins can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- Update events with time columns
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='events' AND column_name='start_time') THEN
    ALTER TABLE public.events ADD COLUMN start_time TIME;
  END IF;
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='events' AND column_name='end_time') THEN
    ALTER TABLE public.events ADD COLUMN end_time TIME;
  END IF;
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='events' AND column_name='all_day') THEN
    ALTER TABLE public.events ADD COLUMN all_day BOOLEAN DEFAULT TRUE;
  END IF;
END $$;
