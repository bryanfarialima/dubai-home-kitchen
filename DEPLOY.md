# 🚀 Guia de Deploy - Sabor de Casa

Este guia mostra como fazer deploy da aplicação em produção usando Vercel ou Netlify.

## 📋 Pré-requisitos

Antes de fazer deploy, certifique-se de ter:

- [x] Todos os arquivos commitados no GitHub
- [x] Conta no Supabase configurada
- [x] Migrations aplicadas no banco de dados
- [x] RLS policies aplicadas (arquivo `supabase/RLS_POLICIES.sql`)
- [x] Pelo menos um usuário promovido a admin
- [x] Menu items cadastrados no banco de dados

## 🔐 Configuração do Supabase

### 1. Aplicar Migrations

No Supabase Dashboard → SQL Editor:

```sql
-- Execute o conteúdo do arquivo:
-- supabase/migrations/20260211021034_13e5554c-4b4e-4f55-84bb-cbdfa1d327e3.sql
```

### 2. Aplicar RLS Policies

No Supabase Dashboard → SQL Editor:

```sql
-- Execute o conteúdo do arquivo:
-- supabase/RLS_POLICIES.sql
```

⚠️ **IMPORTANTE**: As RLS policies são essenciais para segurança. Sem elas, qualquer usuário poderá ver/editar dados de outros usuários.

### 3. Promover Usuário a Admin

Após criar sua conta no site, promova ela a admin:

```sql
-- Substitua 'SEU_USER_ID' pelo ID do seu usuário
-- Você pode ver o ID em: Authentication → Users
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Ou atualize o user_metadata direto:
UPDATE auth.users 
SET raw_user_meta_data = 
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb), 
    '{role}', 
    '"admin"'
  ) 
WHERE id = 'SEU_USER_ID';
```

### 4. Cadastrar Categorias

```sql
-- Exemplo de categorias
INSERT INTO public.categories (name, emoji, sort_order) VALUES
  ('Pratos Principais', '🥘', 1),
  ('Lanches', '🥟', 2),
  ('Sobremesas', '🍨', 3),
  ('Combos', '📦', 4),
  ('Promoções', '🔥', 5);
```

### 5. Cadastrar Menu Items (Exemplo)

```sql
-- Pegue o ID da categoria primeiro
SELECT id, name FROM categories;

-- Depois insira os items (substitua CATEGORY_ID)
INSERT INTO public.menu_items 
  (name, description, price, image_url, category_id, is_available) 
VALUES
  (
    'Feijoada Completa',
    'Feijoada tradicional com arroz, farofa, couve e laranja',
    45.00,
    'https://exemplo.com/feijoada.jpg',
    'CATEGORY_ID_AQUI',
    true
  );
```

## 🌐 Deploy no Vercel (Recomendado)

### Passo 1: Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Importe o repositório do GitHub: `bryanfarialima/dubai-home-kitchen`

### Passo 2: Configurar Variáveis de Ambiente

Na página de configuração do projeto, adicione:

```env
VITE_SUPABASE_PROJECT_ID=seu_project_id
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=seu_publishable_key
VITE_WHATSAPP_NUMBER=+971501234567
```

⚠️ **NÃO adicione** a `SUPABASE_SERVICE_ROLE_KEY` nas variáveis de ambiente da Vercel (ela só é usada em scripts Node.js locais).

### Passo 3: Configurar Build

As configurações padrão já funcionam:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Passo 4: Deploy

Clique em **"Deploy"** e aguarde ~2 minutos.

### Passo 5: Verificações Pós-Deploy

Após o deploy, teste:

1. ✅ Site carrega sem erros
2. ✅ Menu aparece com imagens corretas
3. ✅ Login funciona
4. ✅ Carrinho funciona
5. ✅ Checkout cria pedidos
6. ✅ Admin panel acessível (após login como admin)
7. ✅ PWA instalável (ícone de instalação aparece na barra de endereços)

## 🔧 Deploy no Netlify (Alternativa)

### Passo 1: Conectar Repositório

1. Acesse [netlify.com](https://netlify.com)
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Conecte com GitHub e selecione `dubai-home-kitchen`

### Passo 2: Configurar Build

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

### Passo 3: Variáveis de Ambiente

Em **Site settings** → **Environment variables**, adicione:

```env
VITE_SUPABASE_PROJECT_ID=seu_project_id
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=seu_publishable_key
VITE_WHATSAPP_NUMBER=+971501234567
```

### Passo 4: Configurar Redirects

Crie o arquivo `public/_redirects`:

```
/*    /index.html   200
```

Isso garante que o React Router funcione corretamente.

### Passo 5: Deploy

Clique em **"Deploy site"** e aguarde a build.

## 📱 Testar PWA

Após o deploy:

1. Acesse o site em um **dispositivo móvel**
2. No **Chrome/Safari**, aparecerá um prompt para "Adicionar à tela inicial"
3. Instale o app
4. Teste offline (desconecte Wi-Fi/dados) - deve mostrar a página em cache

## 🐛 Troubleshooting

### ❌ "Failed to fetch menu items"

**Causa**: RLS policies não aplicadas ou muito restritivas

**Solução**: Execute `supabase/RLS_POLICIES.sql` no SQL Editor

### ❌ "Invalid UUID" ao criar pedido

**Causa**: IDs de menu items no formato errado (ex: "1", "2")

**Solução**: Certifique-se que todos os menu_items no banco têm UUIDs válidos

### ❌ Imagens não aparecem

**Causa 1**: Campo `image_url` vazio ou NULL
**Causa 2**: URL da imagem inválida/bloqueada por CORS

**Solução**: 
- Verifique com `SELECT id, name, image_url FROM menu_items;`
- Use URLs públicas (ex: Cloudinary, ImgBB, Supabase Storage)
- Para Supabase Storage, configure bucket como público

### ❌ Admin panel não aparece

**Causa**: Usuário não tem role de admin

**Solução**: Execute o SQL de promoção a admin (ver seção 3 acima)

### ❌ Logout não funciona

**Causa**: Fix já aplicado no código

**Solução**: Certifique-se que está usando a versão mais recente do código

## 🔄 Atualizar Deploy

Toda vez que você fizer `git push origin main`, o deploy automático acontecerá:

- **Vercel**: ~2 minutos
- **Netlify**: ~3 minutos

Você receberá um email quando o deploy estiver pronto.

## 🌐 Domínio Personalizado

### Vercel

1. **Settings** → **Domains**
2. Adicione seu domínio (ex: `saboredecasa.ae`)
3. Configure os DNS records conforme instruções

### Netlify

1. **Domain settings** → **Add custom domain**
2. Adicione seu domínio
3. Configure Netlify DNS ou adicione CNAME no seu provedor atual

## 📊 Monitoramento

### Supabase

- **Database** → **Table Editor**: Ver dados em tempo real
- **Database** → **Logs**: Ver queries executadas
- **Auth** → **Users**: Gerenciar usuários

### Vercel

- **Analytics**: Tráfego e pageviews
- **Speed Insights**: Performance da aplicação
- **Logs**: Erros e warnings

## 🔐 Segurança Pós-Deploy

### ✅ Checklist de Segurança

- [x] RLS policies aplicadas em todas as tabelas
- [x] Service role key NÃO exposta no frontend
- [x] HTTPS ativo (automático na Vercel/Netlify)
- [x] Variáveis de ambiente configuradas corretamente
- [x] `.env` no `.gitignore`

### 🚨 O que NUNCA fazer

- ❌ Commitar `.env` com chaves reais para GitHub
- ❌ Usar `SUPABASE_SERVICE_ROLE_KEY` no frontend
- ❌ Desabilitar RLS policies em produção
- ❌ Expor endpoints sem autenticação

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs no Vercel/Netlify
2. Verifique os logs no Supabase (Database → Logs)
3. Teste localmente com `npm run build && npm run preview`
4. Verifique o console do navegador (F12)

---

**Boa sorte com o deploy! 🚀**
