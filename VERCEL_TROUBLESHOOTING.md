# 🔧 Guia de Troubleshooting - Vercel Deploy

## ✅ Situação Atual

- **Git local:** ✅ Atualizado
- **GitHub:** ✅ Commits enviados corretamente
- **Repositório:** `https://github.com/bryanfarialima/dubai-home-kitchen`
- **Local:** ✅ Funcionando perfeitamente
- **Vercel:** ❌ Não está atualizando

---

## 📋 Passo a Passo para Resolver

### **PASSO 1: Verificar Dashboard do Vercel**

1. Acesse: https://vercel.com/dashboard
2. **Login** com sua conta
3. Procure o projeto: **dubai-home-kitchen** (ou nome similar)

**O que verificar:**
- ✅ Projeto existe no dashboard?
- ✅ Última atualização é recente?
- ✅ Status do último deploy?

---

### **PASSO 2: Verificar Conexão com GitHub**

1. No dashboard do Vercel, clique no projeto
2. Vá em: **Settings** (aba superior)
3. Procure: **Git**

**Verifique:**
```
✅ Repository: bryanfarialima/dubai-home-kitchen
✅ Branch: main
✅ Auto Deploy: Enabled
```

**Se estiver diferente:**
- Clique em "Disconnect" e reconecte o repositório correto
- Certifique-se que a branch é `main`

---

### **PASSO 3: Verificar Deployments**

1. No projeto, clique na aba **Deployments**
2. Veja o último deploy:
   - **Status:** Ready? Building? Error?
   - **Commit:** É o mais recente (4780893)?
   - **Time:** Quando foi?

**Status Possíveis:**

| Status | O que significa | O que fazer |
|--------|-----------------|-------------|
| ✅ **Ready** | Deploy bem-sucedido | Limpar cache do navegador |
| 🔄 **Building** | Em andamento | Aguardar 2-5 min |
| ❌ **Failed** | Erro no build | Ver logs (Passo 4) |
| ⏸️ **Canceled** | Deploy cancelado | Fazer redeploy manual |
| 🚫 **Sem deploy novo** | Vercel não detectou | Ver Passo 5 |

---

### **PASSO 4: Se Houver Erro - Ver Logs**

1. Clique no deploy que falhou
2. Role para baixo até **Build Logs**
3. Procure por linhas com `Error` ou `Failed`

**Erros Comuns:**

**A) Erro de Build:**
```
Error: Build failed
```
**Solução:** Verificar se `npm run build` funciona localmente

**B) Erro de Environment Variables:**
```
Missing VITE_SUPABASE_URL
```
**Solução:** Adicionar variáveis de ambiente (Passo 6)

**C) Erro de Memory:**
```
JavaScript heap out of memory
```
**Solução:** Fazer upgrade do plano ou otimizar código

---

### **PASSO 5: Forçar Novo Deploy**

Se o Vercel não está detectando os commits:

**Opção A: Redeploy via Dashboard**
1. Deployments → Último deploy
2. Clique nos **3 pontos** (⋮) no canto superior direito
3. Selecione **Redeploy**
4. Confirme e aguarde

**Opção B: Via Terminal (se tiver Vercel CLI)**
```bash
npm install -g vercel
vercel --prod
```

**Opção C: Reconectar Repositório**
1. Settings → Git
2. Disconnect
3. Connect novamente
4. Selecione o repositório correto

---

### **PASSO 6: Verificar Environment Variables**

1. Settings → **Environment Variables**
2. Certifique-se que existem:

```
VITE_SUPABASE_URL = https://jkzlrsaohlbfpoyzjfpo.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
```

**Se não existirem:**
1. Clique em **Add New**
2. Cole as variáveis do seu arquivo `.env`
3. Selecione: **Production**, **Preview**, **Development**
4. Salve e faça redeploy

---

### **PASSO 7: Webhook do GitHub**

Se o Vercel não está recebendo notificações do GitHub:

1. **No GitHub:**
   - Vá em: https://github.com/bryanfarialima/dubai-home-kitchen/settings/hooks
   - Procure webhook do Vercel (URL parecida com `hooks.vercel.com`)
   - Se não existir ou estiver com erro (❌), reconecte o Vercel

2. **No Vercel:**
   - Settings → Git → Disconnect
   - Connect novamente → Autorize no GitHub

---

### **PASSO 8: Limpar Cache do Navegador**

Mesmo depois do deploy, o navegador pode ter cache:

**Chrome/Edge:**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

**Ou:**
1. F12 (DevTools)
2. Clique com botão direito no ícone de reload
3. Selecione "Empty Cache and Hard Reload"

---

### **PASSO 9: Verificar Build Localmente**

Antes de fazer deploy, sempre teste:

```bash
# Buildar localmente
npm run build

# Se passar sem erros, testar o preview
npm run preview

# Abrir: http://localhost:4173
```

Se funcionar local mas não no Vercel, o problema é na configuração do Vercel.

---

## 🚨 Problemas Comuns e Soluções

### 1️⃣ "Vercel não detecta meus commits"

**Causa:** Webhook do GitHub não está configurado

**Solução:**
- Reconecte o repositório no Vercel (Settings → Git)
- Ou faça redeploy manual para cada commit

---

### 2️⃣ "Deploy fica 'Building' por muito tempo"

**Causa:** Build travado ou muito pesado

**Solução:**
1. Cancele o deploy atual
2. Verifique logs
3. Otimize dependências ou faça upgrade do plano

---

### 3️⃣ "Site atualiza mas eu não vejo mudanças"

**Causa:** Cache do navegador ou CDN

**Solução:**
- Ctrl+Shift+R no navegador
- Abrir em modo anônimo
- Aguardar 2-5 minutos (propagação do CDN)

---

### 4️⃣ "Build funciona local mas falha no Vercel"

**Causa:** Diferença de ambiente ou variáveis faltando

**Solução:**
1. Verificar Node version (Vercel usa Node 18 por padrão)
2. Adicionar environment variables
3. Verificar imports case-sensitive (funciona em Mac/Windows mas falha em Linux)

---

## 📞 Checklist Final

Antes de pedir ajuda, verifique:

- [ ] Código está commitado e pushado para GitHub?
- [ ] GitHub mostra o último commit?
- [ ] Vercel está conectado ao repositório correto?
- [ ] Branch no Vercel é `main`?
- [ ] Auto Deploy está habilitado?
- [ ] Environment variables estão configuradas?
- [ ] Último deploy no Vercel é recente?
- [ ] Limpei o cache do navegador?
- [ ] `npm run build` funciona localmente?

---

## 🆘 Se Nada Funcionar

### Opção 1: Criar Novo Projeto no Vercel

1. Delete o projeto atual no Vercel
2. Crie novo: **Add New → Project**
3. Importe: `bryanfarialima/dubai-home-kitchen`
4. Configure environment variables
5. Deploy

### Opção 2: Usar Netlify (Alternativa)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## 📊 Comandos Úteis

```bash
# Ver status do git
git status
git log --oneline -5

# Forçar redeploy (commit vazio)
git commit --allow-empty -m "chore: trigger redeploy" && git push

# Build e verificar local
npm run build
npm run preview

# Limpar e reinstalar (se houver erro)
rm -rf node_modules dist
npm install
npm run build
```

---

## ✅ Resultado Esperado

Depois de seguir os passos:

1. ✅ Vercel deve mostrar novo deploy com status "Ready"
2. ✅ URL de produção deve abrir com as mudanças
3. ✅ Dropdown menu do usuário deve aparecer
4. ✅ Página /profile deve existir
5. ✅ Checkout deve pré-preencher dados

---

**Última atualização:** 15 de fevereiro de 2026  
**Commits verificados no GitHub:** ✅  
**Status atual:** Aguardando verificação no Vercel Dashboard
