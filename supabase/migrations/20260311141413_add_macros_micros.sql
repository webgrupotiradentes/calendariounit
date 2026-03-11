-- Criar tabela de Macros
CREATE TABLE IF NOT EXISTS public.macros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.macros ENABLE ROW LEVEL SECURITY;

-- Triggers para updated_at macro
DROP TRIGGER IF EXISTS update_macros_updated_at ON public.macros;
CREATE TRIGGER update_macros_updated_at
  BEFORE UPDATE ON public.macros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies para macros
-- RLS Policies para macros
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Macros are viewable by everyone') THEN
    CREATE POLICY "Macros are viewable by everyone" ON public.macros FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can manage macros') THEN
    CREATE POLICY "Admins can manage macros" ON public.macros FOR ALL USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Criar tabela de Micros
CREATE TABLE IF NOT EXISTS public.micros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  macro_id UUID REFERENCES public.macros(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.micros ENABLE ROW LEVEL SECURITY;

-- Triggers para updated_at micro
DROP TRIGGER IF EXISTS update_micros_updated_at ON public.micros;
CREATE TRIGGER update_micros_updated_at
  BEFORE UPDATE ON public.micros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies para micros
-- RLS Policies para micros
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Micros are viewable by everyone') THEN
    CREATE POLICY "Micros are viewable by everyone" ON public.micros FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can manage micros') THEN
    CREATE POLICY "Admins can manage micros" ON public.micros FOR ALL USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Atualizar eventos para usar Macro e Micro em vez de string
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='events' AND column_name='macro_id') THEN
    ALTER TABLE public.events ADD COLUMN macro_id UUID REFERENCES public.macros(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='events' AND column_name='micro_id') THEN
    ALTER TABLE public.events ADD COLUMN micro_id UUID REFERENCES public.micros(id) ON DELETE SET NULL;
  END IF;
END $$;
