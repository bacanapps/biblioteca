# 🚀 Quick Start Guide - Biblioteca da AIDS

## Iniciando em 3 Passos

### 1️⃣ Adicione as Bibliotecas Vendor

Baixe e coloque na pasta `assets/vendor/`:
- **React**: https://unpkg.com/react@18/umd/react.production.min.js
- **ReactDOM**: https://unpkg.com/react-dom@18/umd/react-dom.production.min.js
- **Howler**: https://unpkg.com/howler@2/dist/howler.min.js

Ou use via CDN atualizando o `index.html`:
```html
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/howler@2/dist/howler.min.js"></script>
```

### 2️⃣ Inicie um Servidor Local

**Opção A - Python:**
```bash
python -m http.server 8000
```

**Opção B - Node.js:**
```bash
npx serve
```

**Opção C - PHP:**
```bash
php -S localhost:8000
```

### 3️⃣ Acesse no Navegador

Abra: `http://localhost:8000`

## ✅ Verificação Rápida

Você deve ver:
- ✅ Página inicial com dois cards (Apresentação e Acervo)
- ✅ Botão 🎨 para alternar tema (canto superior)
- ✅ Tema escuro (padrão) ou tema claro
- ✅ Navegação funcionando entre páginas

## 🎨 Testando Theme Switching

1. Clique no botão 🎨 em qualquer página
2. O tema deve alternar entre:
   - **Modo Escuro**: Fundo azul escuro, texto branco
   - **Modo Exposição**: Fundo bege, texto preto
3. Recarregue a página - o tema escolhido deve persistir

## 📝 Adicionando Conteúdo

### Adicionar Livros

Edite `data/books.json`:
```json
{
  "books": [
    {
      "id": "seu-novo-livro",
      "title": "Título do Livro",
      "source": "Fonte",
      "year": "2024",
      "tags": ["Tag1", "Tag2"],
      "pdfUrl": "caminho/para/pdf",
      "audioUrl": "caminho/para/audio",
      "description": "Descrição completa",
      "summary": "Resumo breve"
    }
  ]
}
```

### Adicionar Áudio

1. Coloque arquivos MP3 em `assets/audio/`
2. Referencie no JSON: `"audioUrl": "assets/audio/seu-arquivo.mp3"`

### Adicionar PDFs

1. Coloque PDFs em `assets/pdf/`
2. Referencie no JSON: `"pdfUrl": "assets/pdf/seu-arquivo.pdf"`

## 🎯 Estrutura de Pastas

```
biblioteca/
├── index.html          ← Entrada principal
├── app.js             ← Lógica React + Theme Manager
├── manifest.json      ← PWA config
├── sw.js             ← Service Worker
├── data/
│   ├── books.json
│   └── presentation.json
└── assets/
    ├── css/
    │   ├── tokens.css      ← Temas e variáveis
    │   ├── app.css         ← Layout principal
    │   ├── books-detail.css
    │   └── theme.css
    ├── img/
    │   └── hero.png
    ├── audio/
    ├── pdf/
    └── vendor/
        ├── react.production.min.js
        ├── react-dom.production.min.js
        └── howler.min.js
```

## 🔧 Troubleshooting

### Tema não alterna?
- Verifique o console do navegador (F12)
- Certifique-se que `tokens.css` está carregando
- Limpe o cache do navegador (Ctrl+Shift+R)

### Livros não aparecem?
- Verifique se `data/books.json` é um JSON válido
- Abra as DevTools → Network para ver se o arquivo carrega

### Service Worker não funciona?
- Deve usar HTTPS ou localhost
- Limpe o cache e registre novamente
- Chrome DevTools → Application → Service Workers

## 📱 Instalar como PWA

1. Abra no Chrome/Edge
2. Clique no ícone de instalação na barra de endereço
3. Ou use Menu → Instalar aplicativo

## 🎨 Customizar Temas

Edite `assets/css/tokens.css`:

```css
:root[data-theme="meu-tema"] {
  --color-bg-page: #sua-cor;
  --color-text-primary: #sua-cor;
  /* ... demais variáveis */
}
```

Adicione ao `app.js`:
```javascript
THEMES: ["default", "exhibit", "meu-tema"]
```

## 📚 Próximos Passos

- ✅ Adicione seu conteúdo em `data/books.json`
- ✅ Personalize cores em `tokens.css`
- ✅ Adicione PDFs e áudios reais
- ✅ Configure domínio e HTTPS para produção
- ✅ Teste em diferentes dispositivos

## 💡 Dicas

- Use imagens otimizadas (WebP, comprimidas)
- Mantenha áudios em MP3 de boa qualidade
- Teste offline após primeira visita
- Monitore performance com Lighthouse

---

**Dúvidas?** Consulte o README.md completo para documentação detalhada.
