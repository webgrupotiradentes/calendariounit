-- Fix activity_logs FK to point to profiles instead of auth.users
-- This allows easier joining in PostgREST (public schema to public schema)
ALTER TABLE public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
ALTER TABLE public.activity_logs ADD CONSTRAINT activity_logs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Function to handle all entity logging automatically
CREATE OR REPLACE FUNCTION public.handle_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_action TEXT;
    v_entity_type TEXT;
    v_entity_name TEXT;
    v_user_id UUID;
BEGIN
    -- Use TG_ARGV[0] as entity type (e.g., 'Evento', 'Categoria', 'IES', 'Local')
    v_entity_type := TG_ARGV[0];
    v_user_id := auth.uid();
    
    IF (TG_OP = 'INSERT') THEN
        v_action := 'Criou';
        -- Try to get a name field, fallback to title or id
        BEGIN
            v_entity_name := NEW.title;
        EXCEPTION WHEN others THEN
            BEGIN
                v_entity_name := NEW.name;
            EXCEPTION WHEN others THEN
                v_entity_name := NEW.id::TEXT;
            END;
        END;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_action := 'Atualizou';
        BEGIN
            v_entity_name := NEW.title;
        EXCEPTION WHEN others THEN
            BEGIN
                v_entity_name := NEW.name;
            EXCEPTION WHEN others THEN
                v_entity_name := NEW.id::TEXT;
            END;
        END;
    ELSIF (TG_OP = 'DELETE') THEN
        v_action := 'Excluiu';
        BEGIN
            v_entity_name := OLD.title;
        EXCEPTION WHEN others THEN
            BEGIN
                v_entity_name := OLD.name;
            EXCEPTION WHEN others THEN
                v_entity_name := OLD.id::TEXT;
            END;
        END;
    END IF;

    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_name)
    VALUES (v_user_id, v_action, v_entity_type, v_entity_name);
    
    RETURN NEW; -- For AFTER triggers, result is usually ignored but NEW is safe
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-setup Triggers for all main entities

-- Events
DROP TRIGGER IF EXISTS on_event_audit ON public.events;
CREATE TRIGGER on_event_audit
AFTER INSERT OR UPDATE OR DELETE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log('Evento');

-- Categories
DROP TRIGGER IF EXISTS on_category_audit ON public.categories;
CREATE TRIGGER on_category_audit
AFTER INSERT OR UPDATE OR DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log('Categoria');

-- Macros (IES)
DROP TRIGGER IF EXISTS on_macro_audit ON public.macros;
CREATE TRIGGER on_macro_audit
AFTER INSERT OR UPDATE OR DELETE ON public.macros
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log('IES');

-- Micros (Locais)
DROP TRIGGER IF EXISTS on_micro_audit ON public.micros;
CREATE TRIGGER on_micro_audit
AFTER INSERT OR UPDATE OR DELETE ON public.micros
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log('Local');

-- Add robust RLS for the activity_logs table to ensure admins can see everything
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs" 
  ON public.activity_logs FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.activity_logs;
CREATE POLICY "Admins can insert activity logs" 
  ON public.activity_logs FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
