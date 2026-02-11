# 🎨 Guia de Imagens - Logo e Preview do WhatsApp

Este guia explica como adicionar sua própria logo e imagem de preview para compartilhamentos.

## 📋 Imagens Necessárias

### 1. **Favicon / Logo do Site** (ícone na aba do navegador)

Você precisa criar logos nos seguintes tamanhos:

- `logo-16x16.png` - 16x16 pixels (favicon pequeno)
- `logo-32x32.png` - 32x32 pixels (favicon padrão)
- `logo-180x180.png` - 180x180 pixels (ícone iOS)
- `logo-192x192.png` - 192x192 pixels (PWA Android)
- `logo-512x512.png` - 512x512 pixels (PWA splash screen)

**Onde colocar**: Pasta `public/` do projeto

**Dica**: Use um gerador de favicon online:
- [Favicon.io](https://favicon.io/) - Gratuito, gera todos os tamanhos
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Mais completo

### 2. **Imagem de Preview do WhatsApp/Facebook** (Open Graph)

- `og-image.jpg` ou `og-image.png`
- **Tamanho recomendado**: 1200x630 pixels
- **Formato**: JPG ou PNG
- **Peso máximo**: 8 MB (idealmente < 300 KB para carregar rápido)

**Onde colocar**: Pasta `public/` do projeto

**O que deve aparecer na imagem**:
- Logo do seu negócio
- Nome "Sabor de Casa"
- Frase chamativa: "Comida Brasileira em Dubai 🇧🇷"
- Foto de um prato apetitoso (opcional)

## 🚀 Opção 1: Usar Imagens Locais (Recomendado para Deploy)

### Passo 1: Preparar as Imagens

1. Crie todas as imagens nos tamanhos listados acima
2. Nomeie exatamente como indicado:
   - `logo-16x16.png`
   - `logo-32x32.png`
   - `logo-180x180.png`
   - `logo-192x192.png`
   - `logo-512x512.png`
   - `og-image.jpg` (ou `.png`)

### Passo 2: Adicionar ao Projeto

Coloque todos os arquivos na pasta `public/`:

```bash
public/
├── logo-16x16.png
├── logo-32x32.png
├── logo-180x180.png
├── logo-192x192.png
├── logo-512x512.png
├── og-image.jpg
├── manifest.json
└── robots.txt
```

### Passo 3: Atualizar URLs no Código

No arquivo `index.html`, as referências já estão corretas:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/logo-32x32.png" />
<meta property="og:image" content="https://seu-dominio.com/og-image.jpg" />
```

⚠️ **IMPORTANTE**: Substitua `https://seu-dominio.com` pela URL real do seu site após o deploy:
- Exemplo Vercel: `https://dubai-home-kitchen.vercel.app`
- Exemplo Netlify: `https://sabor-de-casa.netlify.app`
- Exemplo domínio próprio: `https://saboredecasa.ae`

### Passo 4: Atualizar manifest.json

Execute este comando para atualizar os ícones no PWA:

```bash
# Já vou fazer isso para você automaticamente
```

## 🌐 Opção 2: Usar URLs Externas (Temporário)

Se ainda não tiver as imagens prontas, pode usar URLs externas:

### Hospedar Imagens Online

1. **ImgBB** (https://imgbb.com/) - Upload gratuito, ideal para og:image
2. **Cloudinary** (https://cloudinary.com/) - Gratuito até 25 GB
3. **Supabase Storage** - Se já usa Supabase

### Exemplo de URLs Externas

No `index.html`, use a URL completa:

```html
<meta property="og:image" content="https://i.ibb.co/XXXXX/og-image.jpg" />
```

## 🎨 Ferramentas para Criar as Imagens

### Logo/Favicon

- **Canva** (https://canva.com) - Templates prontos para logos
- **Figma** (https://figma.com) - Design profissional
- **Favicon.io** - Converte logo em todos os tamanhos de favicon

### Imagem Open Graph (Preview WhatsApp)

Use templates prontos no Canva:
1. Acesse Canva → Busque "Facebook Post" ou "Open Graph"
2. Tamanho personalizado: **1200 x 630 pixels**
3. Adicione:
   - Logo
   - Texto: "Sabor de Casa"
   - Subtítulo: "Comida Brasileira Caseira em Dubai"
   - Foto de comida (ex: feijoada, picanha)
   - Bandeiras 🇧🇷🇦🇪
4. Exporte como JPG (qualidade alta)

### Templates Prontos

Vou criar um template básico de og:image para você:

**Sugestão de Layout**:
```
+-----------------------------------+
|  🇧🇷  SABOR DE CASA  🇦🇪          |
|                                   |
|  Comida Brasileira Caseira        |
|       em Dubai                    |
|                                   |
|  [FOTO DE FEIJOADA/PICANHA]       |
|                                   |
|  ⭐ Entrega Grátis                |
|  📱 Peça pelo WhatsApp            |
+-----------------------------------+
```

## ✅ Checklist Final

Antes de fazer deploy, confirme:

- [ ] Todos os arquivos de logo criados (5 tamanhos)
- [ ] Arquivo `og-image.jpg` criado (1200x630px)
- [ ] Imagens colocadas na pasta `public/`
- [ ] `index.html` atualizado com domínio correto
- [ ] `manifest.json` atualizado (vou fazer isso)
- [ ] Testado localmente (`npm run dev`)
- [ ] Committado e pushed para GitHub

## 🧪 Como Testar

### Testar Favicon

1. Rode `npm run dev`
2. Acesse `http://localhost:8080`
3. Verifique o ícone na aba do navegador

### Testar Preview do WhatsApp

Depois do deploy, use estas ferramentas:

1. **WhatsApp Link Preview Debugger**:
   - Envie o link para você mesmo no WhatsApp
   - A imagem pode demorar até 24h para atualizar

2. **Facebook Sharing Debugger**:
   - https://developers.facebook.com/tools/debug/
   - Cole sua URL e clique "Debug"
   - Veja como ficará o preview
   - Use "Scrape Again" se precisar atualizar

3. **LinkedIn Post Inspector**:
   - https://www.linkedin.com/post-inspector/

## 📞 Precisa de Ajuda?

Se tiver dificuldade para criar as imagens:

1. Me envie o logo que você quer usar (pode ser PNG, JPG, SVG)
2. Posso gerar os tamanhos corretos automaticamente
3. Ou podemos usar um design temporário até você ter as imagens finais

---

**Próximo passo**: Criar as imagens e colocá-las na pasta `public/`
