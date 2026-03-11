-- Execute este script no SQL Editor do Supabase para garantir que as colunas existam
-- e para atualizar o cache do esquema.

DO $$ 
BEGIN
    -- Adicionar coluna start_time se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'start_time') THEN
        ALTER TABLE public.events ADD COLUMN start_time TIME;
    END IF;

    -- Adicionar coluna end_time se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'end_time') THEN
        ALTER TABLE public.events ADD COLUMN end_time TIME;
    END IF;

    -- Adicionar coluna all_day se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'all_day') THEN
        ALTER TABLE public.events ADD COLUMN all_day BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Forçar atualização do cache do PostgREST
NOTIFY pgrst, 'reload schema';
