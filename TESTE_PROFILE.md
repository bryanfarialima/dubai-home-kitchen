# 🧪 Guia de Testes - Página de Perfil

Este documento contém todos os testes que devem ser realizados na página de perfil para garantir que está funcionando corretamente.

## ✅ Checklist de Testes

### 1. **Teste de Label do Telefone**
- [ ] Acesse a página de perfil
- [ ] Verifique se o label acima do campo de telefone mostra **"Telefone"** (não "+971 50 000 0000")
- **Resultado esperado:** Label correto "Telefone" em português

---

### 2. **Teste de Validação - Telefone UAE (+971)**

#### 2.1 Teste Números Válidos
- [ ] Selecione código de área: **+971 🇦🇪**
- [ ] Digite: `501234567` (9 dígitos começando com 50)
- [ ] Clique em "Salvar Perfil"
- **Resultado esperado:** ✅ Salva com sucesso

#### 2.2 Teste Números Inválidos
Teste cada um desses casos e verifique o erro:

| Entrada | Resultado Esperado |
|---------|-------------------|
| `601234567` | ❌ Erro: "Telefone inválido: UAE: 50/52/54/55/56/58 + 7 digits" |
| `5012345` (7 dígitos) | ❌ Erro de validação |
| `50123456789` (11 dígitos) | ⚠️ Campo limita entrada em 9 dígitos |

#### 2.3 Prefixos Válidos para UAE
Teste todos os prefixos válidos:
- [ ] `501234567` ✅
- [ ] `521234567` ✅
- [ ] `541234567` ✅
- [ ] `551234567` ✅
- [ ] `561234567` ✅
- [ ] `581234567` ✅

---

### 3. **Teste de Validação - Telefone Brasil (+55)**

#### 3.1 Teste Números Válidos
- [ ] Selecione código de área: **+55 🇧🇷**
- [ ] Digite: `11987654321` (11 dígitos - DDD + 9 dígitos)
- [ ] Clique em "Salvar Perfil"
- **Resultado esperado:** ✅ Salva com sucesso

- [ ] Digite: `1134567890` (10 dígitos - DDD + 8 dígitos)
- [ ] Clique em "Salvar Perfil"
- **Resultado esperado:** ✅ Salva com sucesso

#### 3.2 Teste Números Inválidos
| Entrada | Resultado Esperado |
|---------|-------------------|
| `509754600` (9 dígitos) | ❌ Erro: "Telefone inválido: Brazil: 10-11 digits (DDD + number)" |
| `123` (3 dígitos) | ❌ Erro de validação |
| `119876543210` (12 dígitos) | ⚠️ Campo limita entrada em 11 dígitos |

#### 3.3 Teste Limite de Caracteres
- [ ] Selecione **+55**
- [ ] Tente digitar mais de 11 números
- **Resultado esperado:** Campo bloqueia após 11 dígitos ✅

---

### 4. **Teste de Validação - Telefone EUA (+1)**

#### 4.1 Teste Números Válidos
- [ ] Selecione código de área: **+1 🇺🇸**
- [ ] Digite: `2025551234` (10 dígitos)
- [ ] Clique em "Salvar Perfil"
- **Resultado esperado:** ✅ Salva com sucesso

#### 4.2 Teste Números Inválidos
| Entrada | Resultado Esperado |
|---------|-------------------|
| `20255512` (8 dígitos) | ❌ Erro: "Telefone inválido: USA/Canada: 10 digits" |
| `202555123456` (12 dígitos) | ⚠️ Campo limita entrada em 10 dígitos |

---

### 5. **Teste de Validação - Telefone UK (+44)**

#### 5.1 Teste Números Válidos
- [ ] Selecione código de área: **+44 🇬🇧**
- [ ] Digite: `2071234567` (10 dígitos)
- [ ] Clique em "Salvar Perfil"
- **Resultado esperado:** ✅ Salva com sucesso

- [ ] Digite: `20712345678` (11 dígitos)
- [ ] Clique em "Salvar Perfil"
- **Resultado esperado:** ✅ Salva com sucesso

#### 5.2 Teste Números Inválidos
| Entrada | Resultado Esperado |
|---------|-------------------|
| `207123` (6 dígitos) | ❌ Erro: "Telefone inválido: UK: 10-11 digits" |

---

### 6. **Teste de Troca de Código de Área**

#### 6.1 Teste Mudança de Limite de Caracteres
- [ ] Selecione **+971** e digite `501234567` (9 dígitos) ✅
- [ ] Mude para **+55**
- [ ] Tente adicionar mais 2 dígitos: `50123456711` (11 dígitos) ✅
- **Resultado esperado:** Campo permite até 11 dígitos com +55

#### 6.2 Teste Validação Diferente
- [ ] Selecione **+971** e digite `501234567` ✅
- [ ] Tente salvar: Deve funcionar ✅
- [ ] Mude para **+55** sem alterar o número
- [ ] Tente salvar: Deve dar erro "Brazil: 10-11 digits" ❌

---

### 7. **Teste de Validação - Endereço**

#### 7.1 Endereço Válido
- [ ] Digite no campo "Rua": `rua paramopama` (14 caracteres)
- [ ] Deixe Edifício/Villa e Andar/Apt vazios
- [ ] Clique em "Salvar Perfil"
- **Resultado esperado:** ✅ Salva com sucesso

#### 7.2 Endereço Inválido
| Campo Rua | Resultado Esperado |
|-----------|-------------------|
| `rua` (3 caracteres) | ❌ Erro: "Please enter a complete street address (minimum 5 characters)" |
| ` ` (vazio com espaços) | ❌ Erro de validação |

#### 7.3 Endereço Completo
- [ ] Rua: `Al Wasl Road, Building 123`
- [ ] Edifício: `Tower A`
- [ ] Andar: `Floor 12, Apt 1205`
- [ ] Salvar
- **Resultado esperado:** Endereço salvo como "Al Wasl Road, Building 123 | Tower A | Floor 12, Apt 1205"

---

### 8. **Teste de Salvamento Completo**

#### 8.1 Preencher Todos os Campos
- [ ] Nome Completo: `bryan faria lima`
- [ ] Código de área: `+55 🇧🇷`
- [ ] Telefone: `11987654321`
- [ ] Tipo de Local: `Casa`
- [ ] Rua: `rua paramopama`
- [ ] Edifício: (vazio)
- [ ] Andar: (vazio)
- [ ] Clicar em "Salvar Perfil"
- **Resultado esperado:** 
  - ✅ Mensagem de sucesso aparece
  - ✅ Página não mostra erro "AbortError"
  - ✅ Dados são salvos no banco

#### 8.2 Verificar Dados Salvos
- [ ] Sair da página de perfil (voltar ao menu)
- [ ] Entrar novamente na página de perfil
- [ ] Verificar se todos os dados estão preenchidos:
  - Nome: `bryan faria lima` ✅
  - Código: `+55` ✅
  - Telefone: `11987654321` ✅
  - Tipo: `Casa` ✅
  - Rua: `rua paramopama` ✅

---

### 9. **Teste de Auto-preenchimento no Checkout**

#### 9.1 Salvar Perfil
- [ ] Preencha e salve o perfil com:
  - Telefone: `+55 11987654321`
  - Endereço: `rua paramopama`
  - Tipo: `Casa`

#### 9.2 Ir para Checkout
- [ ] Adicione um item ao carrinho
- [ ] Vá para a página de checkout
- [ ] Verifique se os campos estão preenchidos:
  - Telefone: `+55 11987654321` ✅
  - Endereço: `rua paramopama` ✅
  - Tipo de Local: `Casa` ✅

---

### 10. **Teste de Erro AbortError (CRÍTICO)**

Este era o erro principal relatado pelo usuário.

#### 10.1 Teste com Dados Novos
- [ ] Preencha o formulário completamente
- [ ] Clique em "Salvar Perfil"
- [ ] Observe o console do navegador (F12 → Console)
- **Resultado esperado:** 
  - ✅ Nenhum erro "AbortError" aparece
  - ✅ Mensagem de sucesso aparece
  - ✅ Dados são salvos

#### 10.2 Teste com Atualização de Dados
- [ ] Altere apenas o telefone de `501234567` para `521234567`
- [ ] Salve novamente
- [ ] Observe o console
- **Resultado esperado:** 
  - ✅ Nenhum erro "AbortError"
  - ✅ Atualização bem-sucedida

---

## 📊 Resumo de Validações por País

| País | Código | Dígitos Aceitos | Formato Exemplo | Regex |
|------|--------|-----------------|-----------------|-------|
| **UAE** | +971 | 9 | `501234567` | `^(50\|52\|54\|55\|56\|58)\d{7}$` |
| **Brasil** | +55 | 10-11 | `11987654321` | `^\d{10,11}$` |
| **EUA/Canadá** | +1 | 10 | `2025551234` | `^\d{10}$` |
| **Reino Unido** | +44 | 10-11 | `2071234567` | `^\d{10,11}$` |

---

## 🐛 Como Reportar Bugs

Se encontrar algum erro durante os testes, anote:

1. **Qual teste estava fazendo:** (número da seção)
2. **O que digitou:** (valores exatos)
3. **O que esperava:** (comportamento correto)
4. **O que aconteceu:** (comportamento atual)
5. **Mensagem de erro:** (se houver)
6. **Screenshot:** (se possível)

---

## ✅ Critérios de Aceitação

O sistema está funcionando corretamente se:

- [x] Label "Telefone" aparece corretamente (não "+971 50 000 0000")
- [x] Campo de telefone aceita diferentes quantidades de dígitos conforme código de área
- [x] Validação funciona corretamente para cada país
- [x] Mensagens de erro mostram o formato correto para cada país
- [x] Não aparece erro "AbortError" ao salvar
- [x] Dados são salvos corretamente no banco
- [x] Auto-preenchimento funciona no checkout
- [x] Editar e salvar novamente funciona sem erros

---

**📝 Última atualização:** 15 de fevereiro de 2026
**👨‍💻 Desenvolvedor:** GitHub Copilot
