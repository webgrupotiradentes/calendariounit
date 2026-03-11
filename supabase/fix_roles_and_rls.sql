-- Script de REPARO TOTAL para restaurar Admins e corrigir Recursão de Segurança.
-- Execute isto no SQL Editor do seu Supabase.

-- 1. Garantir que 'superadmin' exista no enum (sem transação para evitar erro)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';

-- 2. Limpar papéis e definir como Admin para Osvaldo e Flávio
DO $$
DECLARE
    osvaldo_id UUID;
    flavio_id UUID;
BEGIN
    -- Busca os IDs pelos nomes ou emails conhecidos
    SELECT id INTO osvaldo_id FROM public.profiles WHERE email = 'osvaldo@mkt.grupotiradentes.com' LIMIT 1;
    -- Busca Flávio pelo nome se o email não for conhecido (assumindo que existe no banco)
    SELECT id INTO flavio_id FROM public.profiles WHERE full_name ILIKE '%Flávio Machado%' LIMIT 1;
    
    -- Se não achou Flávio pelo nome, tenta buscar por emails prováveis ou logar o erro
    IF flavio_id IS NULL THEN
        RAISE NOTICE 'Atenção: Perfil do Flávio Machado não encontrado pelo nome. Por favor, verifique o email correto no painel.';
    END IF;

    -- Restaurar Osvaldo
    IF osvaldo_id IS NOT NULL THEN
        DELETE FROM public.user_roles WHERE user_id = osvaldo_id;
        INSERT INTO public.user_roles (user_id, role) VALUES (osvaldo_id, 'admin');
        RAISE NOTICE 'Osvaldo restaurado como Admin.';
    END IF;

    -- Restaurar Flávio
    IF flavio_id IS NOT NULL THEN
        DELETE FROM public.user_roles WHERE user_id = flavio_id;
        INSERT INTO public.user_roles (user_id, role) VALUES (flavio_id, 'admin');
        RAISE NOTICE 'Flávio restaurado como Admin.';
    END IF;
END $$;

-- 3. CORREÇÃO CRITICAL: Remover políticas recursivas que quebram o acesso
-- O problema anterior era que para ver se você é admin, você precisava ler a tabela, 
-- mas a política dizia que só admins podiam ler a tabela (loop infinito).

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- NOVA POLÍTICA: Qualquer usuário autenticado pode ver SEUS PRÓPRIOS papéis (Sem recursão)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- NOVA POLÍTICA: Admins podem gerenciar e ver tudo (Usa a função SECURITY DEFINER para quebrar a recursão)
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Garantir que a função has_role quebre a recursão (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER -- IMPORTANTE: Isso ignora o RLS para esta consulta específica
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Atualizar esquema
NOTIFY pgrst, 'reload schema';
