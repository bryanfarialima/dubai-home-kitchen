# 🔒 Configuração de Rate Limits no Supabase

## ⚠️ Problema Relatado

Usuários recebem erro: **"Email rate limit exceeded"** ao tentar se cadastrar.

## ✅ Solução Implementada no Código

O sistema agora detecta automaticamente erros de rate limit e exibe mensagens amigáveis:

- **Inglês**: "Too many sign-up attempts. Please wait a few minutes and try again."
- **Português**: "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente."
- **Árabe**: "تم تجاوز حد محاولات التسجيل. يرجى الانتظار بضع دقائق ثم المحاولة مرة أخرى."

**Arquivos modificados:**
- [`src/pages/AuthPage.tsx`](src/pages/AuthPage.tsx) - Tratamento de erro com função `getAuthErrorMessage()`
- [`src/i18n.ts`](src/i18n.ts) - Nova chave de tradução `email_rate_limit`

---

## 🛠️ Configurações no Supabase Dashboard

### 1. **Ajustar Rate Limits de Email**

**Caminho:** `Authentication → Settings → Rate Limits`

O Supabase limita emails enviados por hora para prevenir spam. Configure:

- **Limite atual (padrão):** 3-4 emails/hora por endereço IP
- **Recomendado para produção:** 10-20 emails/hora
- **Para desenvolvimento/teste:** Considere aumentar temporariamente

### 2. **Configurar SMTP Customizado (Recomendado)**

O SMTP gratuito do Supabase tem limites rigorosos. Use um provedor externo:

**Caminho:** `Settings → Auth → SMTP Settings`

**Provedores recomendados:**
- **Resend** (gratuito até 100/dia) - Mais simples
- **SendGrid** (gratuito até 100/dia)
- **AWS SES** (< $0.10 por 1000 emails)
- **Mailgun** (gratuito até 5000/mês)

**Exemplo de configuração (Resend):**
```
SMTP Host: smtp.resend.com
Port: 587
Username: resend
Password: [sua API key]
Sender email: noreply@seudominio.com
```

### 3. **Desabilitar Confirmação de Email (Apenas Dev)**

⚠️ **Uso: Somente ambiente de desenvolvimento/teste**

**Caminho:** `Authentication → Email Auth → Enable email confirmations`

- Desmarque para permitir login imediato sem confirmação
- **IMPORTANTE:** Sempre reabilite em produção por segurança

### 4. **Confirmar Emails Existentes Manualmente**

Se houver usuários pendentes de confirmação, execute no **SQL Editor**:

```sql
-- Confirmar todos os usuários pendentes
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Confirmar usuário específico
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'usuario@exemplo.com';
```

### 5. **Monitorar Logs de Rate Limit**

**Caminho:** `Logs → Auth Logs`

- Filtre por "rate_limit" para ver tentativas bloqueadas
- Identifique IPs com muitas tentativas
- Ajuste limites conforme necessidade

---

## 📊 Boas Práticas

### Para Produção:
1. ✅ Use SMTP customizado (Resend/SendGrid)
2. ✅ Mantenha confirmação de email ativa
3. ✅ Configure rate limits adequados (10-20/hora)
4. ✅ Monitore logs semanalmente

### Para Desenvolvimento:
1. ✅ Considere desabilitar confirmação de email temporariamente
2. ✅ Use comandos SQL para confirmar emails manualmente
3. ✅ Aumente rate limits temporariamente
4. ⚠️ **Atenção:** Reverta configurações antes de ir para produção

---

## 🔍 Troubleshooting

### "Rate limit exceeded" mesmo com poucos cadastros

**Causa:** O limite é por IP, não por email. Vários usuários na mesma rede (escritório, WiFi público) compartilham o mesmo IP.

**Solução:**
- Configure SMTP customizado
- Aumente limites no dashboard
- Para testes: use VPN para trocar de IP

### Emails não chegam após resolver rate limit

**Verifique:**
1. Pasta de spam/lixo eletrônico
2. Configurações de DNS (SPF, DKIM) se usar SMTP customizado
3. Logs do Supabase para erros de envio
4. Quotas do provedor de email

### Usuários reclamam de não receber confirmação

**Solução imediata:**
```sql
-- Confirmar email do usuário manualmente
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'email.do.usuario@exemplo.com';
```

---

## 📞 Suporte

- **Documentação Supabase Auth:** https://supabase.com/docs/guides/auth
- **Rate Limits:** https://supabase.com/docs/guides/platform/going-into-prod#rate-limiting
- **SMTP Setup:** https://supabase.com/docs/guides/auth/auth-smtp

---

**Última atualização:** 14 de fevereiro de 2026  
**Status:** ✅ Tratamento de erro implementado e funcionando
