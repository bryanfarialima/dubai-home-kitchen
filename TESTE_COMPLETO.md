# 🧪 GUIA DE TESTE COMPLETO - Dubai Home Kitchen

## ✅ PRÉ-REQUISITOS

1. **Dev server rodando**: `npm run dev` (porta 8080)
2. **Supabase configurado**: variáveis no `.env`
3. **RLS aplicado**: executar o SQL abaixo primeiro

---

## 🔐 PASSO 1: Aplicar Políticas de Segurança (RLS)

### No Supabase Dashboard → SQL Editor:

Copie e execute TODO o conteúdo de `supabase/RLS_POLICIES.sql`

### Verificar se funcionou:

```sql
-- Deve mostrar rowsecurity = true para todas as 9 tabelas
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 'user_roles', 'categories', 'menu_items',
  'delivery_zones', 'coupons', 'orders', 'order_items', 'reviews'
);
```

**✅ Esperado:** 9 linhas com `rowsecurity = t`

---

## 👤 PASSO 2: Testar como CLIENTE

### A. Criar conta de cliente

1. Acesse: `http://localhost:8080`
2. Clique em **"Sign In"** (canto superior direito)
3. Clique em **"Sign Up"**
4. Preencha:
   - Nome: **Maria Silva**
   - Email: **maria@teste.com**
   - Senha: **senha123**
5. Clique em **"Create Account"**

**✅ Esperado:** Login automático + redirecionamento para home

### B. Navegar pelo site

1. Veja as categorias e pratos no menu
2. Role a página - deve ver pratos de exemplo
3. Clique nas categorias para filtrar

**✅ Esperado:** Interface carrega normalmente, sem erros no console

### C. Adicionar itens ao carrinho

1. Clique em **"Add to Cart"** em 2-3 pratos diferentes
2. Observe o badge do carrinho aumentar (canto superior)
3. Clique no ícone do carrinho (canto superior direito)

**✅ Esperado:** Drawer lateral abre mostrando os itens

### D. Fazer um pedido

1. No drawer do carrinho, clique em **"Checkout"**
2. Preencha o formulário:
   - **Telefone**: +971 50 123 4567
   - **Endereço**: Apt 123, Marina Tower, Dubai Marina
   - **Zona de Entrega**: Dubai Marina (selecione)
   - **Observações** (opcional): "Sem cebola"
3. Clique em **"Place Order"**

**✅ Esperado:** 
- Toast de sucesso aparece
- Carrinho limpa
- Redirecionamento para `/orders`
- Pedido aparece na lista

### E. Ver meus pedidos

1. Em `/orders`, você deve ver:
   - Seu pedido recém-criado
   - Status: **pending** (amarelo)
   - Itens do pedido listados
   - Total correto (incluindo taxa de entrega)

**✅ Esperado:** Apenas SEUS pedidos aparecem (não de outros usuários)

### F. Tentar acessar admin (deve falhar)

1. Tente acessar: `http://localhost:8080/admin`

**✅ Esperado:** Redirecionamento automático para home (sem permissão)

---

## 🛠️ PASSO 3: Tornar-se ADMIN

### No Supabase Dashboard → SQL Editor:

```sql
-- 1. Encontre seu user_id
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'maria@teste.com';

-- Copie o 'id' mostrado (algo como: 12345678-abcd-...)

-- 2. Adicione role de admin (SUBSTITUA o user_id!)
INSERT INTO user_roles (user_id, role)
VALUES ('COLE_SEU_USER_ID_AQUI', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Verificar
SELECT u.email, ur.role 
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'maria@teste.com';
```

**✅ Esperado:** Deve mostrar `maria@teste.com | admin`

### ⚠️ IMPORTANTE: Faça LOGOUT e LOGIN novamente!

1. No site, clique em **"Sign Out"**
2. Faça login novamente com **maria@teste.com / senha123**

---

## 🎛️ PASSO 4: Testar como ADMIN

### A. Acessar painel admin

1. Acesse: `http://localhost:8080/admin`

**✅ Esperado:** Painel admin carrega (não redireciona)

### B. Ver TODOS os pedidos

1. Na aba **"Orders"**:
   - Deve ver TODOS os pedidos (incluindo de outros usuários, se houver)
   - Seu pedido de teste aparece

**✅ Esperado:** Lista de pedidos com opção de alterar status

### C. Alterar status do pedido

1. Localize seu pedido
2. No dropdown de status, mude de **pending** para:
   - **confirmed** → salva
   - **preparing** → salva
   - **delivering** → salva
   - **delivered** → salva

**✅ Esperado:** 
- Status atualiza em tempo real
- Cor do badge muda
- Toast de sucesso

### D. Gerenciar categorias

1. Vá para aba **"Menu Management"**
2. Sub-aba **"Categories"**
3. Adicione nova categoria:
   - Nome: **Bebidas**
   - Emoji: 🥤
   - Sort Order: 6
4. Clique **"Add Category"**

**✅ Esperado:** Categoria aparece na lista

### E. Gerenciar itens do menu

1. Sub-aba **"Menu Items"**
2. Adicione novo item:
   - Nome: **Suco Natural de Laranja**
   - Descrição: **Feito na hora com laranjas frescas**
   - Preço: **15**
   - Categoria: **Bebidas** (selecione)
   - URL da Imagem: `https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400`
   - Disponível: ✓ (checked)
3. Clique **"Add Item"**

**✅ Esperado:** Item aparece na lista

### F. Testar visualização pública

1. Clique em **"Voltar ao Site"** (canto superior direito do admin)
2. Role até o menu
3. Deve ver sua nova categoria **Bebidas** 🥤
4. Deve ver o **Suco Natural de Laranja**

**✅ Esperado:** Novo item visível para todos (público)

### G. Gerenciar cupons

1. Volte ao admin (`/admin`)
2. Aba **"Coupons"**
3. Veja o cupom existente: **WELCOME10**
4. Adicione novo cupom:
   - Código: **TESTE20**
   - Tipo: **percentage**
   - Valor: **20**
   - Pedido mínimo: **100**
   - Ativo: ✓
5. Clique **"Add Coupon"**

**✅ Esperado:** Cupom criado e aparece na lista

### H. Testar cupom no checkout

1. Volte ao site (não admin)
2. Adicione itens ao carrinho (total > AED 100)
3. Vá para checkout
4. No campo **"Coupon Code"**, digite: **TESTE20**
5. Observe o desconto aplicar

**✅ Esperado:** 
- Desconto de 20% calculado
- Total final reduzido
- Mensagem de sucesso

---

## 🔍 PASSO 5: Testar Isolamento de Dados (Segurança)

### Criar segundo usuário

1. Faça **logout**
2. Crie nova conta:
   - Nome: **João Santos**
   - Email: **joao@teste.com**
   - Senha: **senha456**

### Fazer pedido como João

1. Adicione itens ao carrinho
2. Faça checkout
3. Vá para `/orders`

**✅ Esperado:** João vê APENAS seus próprios pedidos (não os de Maria)

### Verificar no banco (Supabase SQL Editor)

```sql
-- Ver todos os pedidos (admin apenas)
SELECT 
  o.id,
  o.status,
  o.total,
  p.full_name as cliente,
  p.email
FROM orders o
JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC;
```

**✅ Esperado:** Ver pedidos de Maria E João

---

## 🧹 PASSO 6: Limpar Dados de Teste

### Se quiser começar limpo:

```sql
-- ⚠️ CUIDADO: Isso apaga TODOS os pedidos de teste
DELETE FROM order_items;
DELETE FROM orders;

-- Apagar usuários de teste (NÃO execute se for manter as contas)
-- DELETE FROM auth.users WHERE email IN ('maria@teste.com', 'joao@teste.com');
```

---

## ✅ CHECKLIST FINAL

- [ ] RLS ativado em todas as tabelas
- [ ] Cliente consegue criar conta
- [ ] Cliente consegue fazer pedido
- [ ] Cliente vê apenas seus próprios pedidos
- [ ] Cliente NÃO acessa admin
- [ ] Admin vê TODOS os pedidos
- [ ] Admin consegue mudar status de pedidos
- [ ] Admin consegue criar categorias
- [ ] Admin consegue criar itens do menu
- [ ] Admin consegue criar cupons
- [ ] Cupons funcionam no checkout
- [ ] Carrinho persiste (refresh da página mantém itens)
- [ ] Segundo usuário tem dados isolados
- [ ] Botão "Voltar ao Site" funciona no admin

---

## 🐛 Troubleshooting

### "Access denied" ou "permission denied"
→ RLS não aplicado corretamente. Re-execute `RLS_POLICIES.sql`

### "Admin panel redirects to home"
→ Você não tem role de admin. Execute o SQL do Passo 3 e faça logout/login

### "Menu vazio"
→ Dados de seed não carregaram. Verifique se a migration rodou.

### "Can't place order"
→ Verifique console do browser (F12). Pode ser zona de entrega não selecionada.

### Carrinho não persiste após refresh
→ Verifique localStorage no DevTools (Application tab)

---

## 📋 Próximos Passos Após Teste

Se tudo funcionar:

1. ✅ **Segurança validada** - RLS funcionando
2. 📸 **Adicionar fotos reais** - seguir `GUIA_FOTOS_TEXTOS.md`
3. 🍽️ **Cadastrar pratos da sua mãe**
4. 📍 **Ajustar zonas de entrega** (se necessário)
5. 📱 **Verificar número do WhatsApp** no `.env`
6. 🚀 **Deploy em produção** (Vercel/Netlify)

---

**Qualquer erro ou dúvida durante os testes, me avise! 🚀**
