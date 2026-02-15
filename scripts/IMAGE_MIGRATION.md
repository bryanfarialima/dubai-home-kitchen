# 📸 Migração de Imagens para Supabase Storage

Este script migra automaticamente as imagens do cardápio de URLs externas para o Supabase Storage, com compressão automática para melhorar a performance do site.

## 🎯 Benefícios

- ✅ **Imagens otimizadas**: Todas comprimidas para máximo 200KB
- ✅ **CDN integrado**: Carregamento mais rápido via Supabase CDN
- ✅ **Transformação automática**: Redimensionamento e compressão on-the-fly
- ✅ **Sem custos extras**: Incluído no plano gratuito do Supabase
- ✅ **Melhor performance**: Especialmente em dispositivos móveis

## 🚀 Como usar

### 1. Preparação

Certifique-se de que as variáveis de ambiente estão configuradas:

```bash
# Verifique se existe o arquivo .env com:
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 2. Executar a migração

```bash
# No terminal, execute:
npm run migrate:images

# Ou diretamente:
node scripts/migrate_images_to_supabase.js
```

### 3. O que o script faz

1. 📥 Busca todos os itens do cardápio com `image_url` preenchida
2. ⬇️ Baixa cada imagem da URL original
3. 🗜️ Comprime para máximo 200KB mantendo qualidade visual
4. ☁️ Faz upload para o bucket `menu-images` no Supabase Storage
5. 🔄 Atualiza a `image_url` no banco de dados com a nova URL
6. ✅ Pula itens já migrados automaticamente

### 4. Após a migração

As imagens agora estarão disponíveis em URLs como:
```
https://[seu-projeto].supabase.co/storage/v1/render/image/public/menu-images/picanha-123.jpg?width=400&quality=75
```

## 🔧 Configuração do Supabase Storage (caso necessário)

Se o bucket ainda não existir, o script criará automaticamente. Mas você pode criar manualmente:

1. Acesse o Supabase Dashboard
2. Vá em **Storage** > **Create new bucket**
3. Nome: `menu-images`
4. **Public bucket**: ✅ Ativado
5. **File size limit**: 2MB

### Política de acesso (RLS)

O bucket precisa ser público para leitura. Execute no SQL Editor:

```sql
-- Permitir leitura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');
```

## 📊 Saída esperada

```
🚀 Starting image migration to Supabase Storage...

Found 12 items with images

Processing: Picanha Grelhada (1)
  → Downloading from https://exemplo.com/picanha.jpg...
  ✓ Downloaded 450.5KB
  → Compressing...
  ✓ Compressed to 185.3KB (quality: 70, width: 800px)
  → Uploading as picanha-grelhada-1.jpg...
  ✓ Successfully migrated!

...

==================================================
📊 Migration Summary:
==================================================
✓ Successfully migrated: 12
⊘ Already migrated:      0
✗ Failed:                0
📁 Total items:          12
==================================================
```

## 🎨 Usando imagens otimizadas no código

O componente `<OptimizedImage>` já está integrado no `FoodCard`:

```tsx
<OptimizedImage
  src={item.image}
  alt={item.name}
  width={400}      // Largura alvo
  quality={75}     // Qualidade (1-100)
  className="..."
/>
```

### Parâmetros de transformação disponíveis:

- `width`: Largura máxima em pixels (ex: 400, 800)
- `height`: Altura máxima em pixels
- `quality`: Qualidade JPEG/WebP (1-100)
- `format`: Formato de saída (webp, jpeg, png)

## ⚠️ Troubleshooting

### Erro: "Failed to download"
- Verifique se a URL da imagem está acessível
- Algumas URLs podem bloquear downloads automatizados

### Erro: "Error creating bucket"
- Verifique se a chave `VITE_SUPABASE_ANON_KEY` tem permissões de storage
- Crie o bucket manualmente no dashboard

### Erro: "Sharp module not found"
```bash
npm install --save-dev sharp
```

### Imagens não aparecem no site
1. Verifique se o bucket `menu-images` está marcado como **público**
2. Verifique as políticas RLS do storage
3. Limpe o cache do navegador (Ctrl+Shift+R)

## 📝 Adicionar script ao package.json

Adicione esta linha em `scripts`:

```json
{
  "scripts": {
    "migrate:images": "node scripts/migrate_images_to_supabase.js"
  }
}
```

## 🔄 Re-executar a migração

O script é idempotente - você pode executá-lo múltiplas vezes sem problemas:
- Itens já migrados serão pulados automaticamente
- Apenas novos itens ou URLs atualizadas serão processados
- Usa `upsert: true` para sobrescrever se necessário

## 💡 Dicas de performance

1. **No AdminPage**: Continue usando URLs diretas ao cadastrar
2. **O componente OptimizedImage**: Automaticamente otimiza URLs do Supabase
3. **Para imagens grandes**: Considere width=800 para telas de alta resolução
4. **Para thumbnails**: Use width=200 ou width=300

## 📚 Recursos

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
