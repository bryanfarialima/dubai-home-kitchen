# 📝 Instruções de Migração - Campo location_type

## ⚠️ IMPORTANTE: Execute no Supabase antes de usar a nova funcionalidade

A nova funcionalidade de perfil de usuário requer um campo adicional na tabela `profiles`.

## 🔧 Como Aplicar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em: **SQL Editor**
4. Execute o seguinte SQL:

```sql
-- Add location_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location_type TEXT;

-- Update existing profiles with default value if needed
UPDATE public.profiles 
SET location_type = 'apartment' 
WHERE location_type IS NULL;
```

### Opção 2: Via Script Node.js

```bash
# Criar arquivo .env com as credenciais (se ainda não existe)
echo "VITE_SUPABASE_URL=sua_url" > .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=sua_service_key" >> .env.local

# Executar migração
node scripts/apply_migration_location_type.js
```

## ✅ Verificar Migração

Execute no SQL Editor:

```sql
-- Verificar se a coluna existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'location_type';

-- Ver estrutura completa da tabela
\d profiles
```

## 📋 O que foi adicionado

- **Campo:** `location_type` (TEXT, nullable)
- **Valores possíveis:** house, apartment, condo, villa, office, hotel
- **Uso:** Salvar o tipo de local do usuário no perfil

## 🔄 Rollback (se necessário)

```sql
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS location_type;
```

---

**Data da migração:** 14 de fevereiro de 2026  
**Arquivo:** `supabase/migrations/20260214000000_add_location_type_to_profiles.sql`
