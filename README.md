# Biblioteca da AIDS - PWA com Theme Switching

Uma Progressive Web App (PWA) para explorar publicações sobre HIV/AIDS com funcionalidade de alternância de temas.

## 🎨 Funcionalidade de Theme Switching

### Temas Disponíveis

1. **Modo Escuro (default)**
   - Fundo: Azul escuro profundo (#0a0f1a)
   - Texto: Branco e tons de cinza
   - Acento: Azul índigo (#8fa2ff)
   - Ideal para leitura noturna

2. **Modo Exposição (exhibit)**
   - Fundo: Bege quente (#fdf6e9)
   - Texto: Preto e tons marrons
   - Acento: Vermelho (#b91c1c)
   - Estilo de exposição de museu

### Como Funciona

O sistema de temas usa:
- **CSS Variables** definidas em `tokens.css`
- **data-theme attribute** no elemento `<html>`
- **localStorage** para persistência da preferência do usuário
- **ThemeManager** em `app.js` para controle centralizado

### Implementação Técnica

```javascript
// Em app.js
const ThemeManager = {
  STORAGE_KEY: "biblioteca-theme",
  THEMES: ["default", "exhibit"],
  
  init() {
    // Carrega tema salvo ou usa 'default'
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const theme = this.THEMES.includes(saved) ? saved : "default";
    this.apply(theme);
    return theme;
  },
  
  apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  },
  
  toggle(currentTheme) {
    const nextTheme = currentTheme === "default" ? "exhibit" : "default";
    this.apply(nextTheme);
    localStorage.setItem(this.STORAGE_KEY, nextTheme);
    return nextTheme;
  }
};
```

### CSS Tokens

```css
/* tokens.css */
:root,
:root[data-theme="default"] {
  --color-bg-page: #0a0f1a;
  --color-text-primary: #ffffff;
  /* ... mais variáveis */
}

:root[data-theme="exhibit"] {
  --color-bg-page: #fdf6e9;
  --color-text-primary: #1a1a1a;
  /* ... mais variáveis */
}
```

## 📁 Estrutura de Arquivos

```
/biblioteca
  index.html           # Ponto de entrada HTML
  app.js              # Lógica React + Theme Manager
  manifest.json       # Configuração PWA
  sw.js              # Service Worker para cache offline
  
  /data
    books.json         # Dados dos livros
    presentation.json  # Dados da apresentação
  
  /assets
    /css
      tokens.css       # Design tokens e variáveis de tema
      app.css         # Estilos principais e layout
      books-detail.css # Estilos da página de detalhes
      theme.css       # Placeholder para extensões futuras
    /img
      hero.png        # Logo/ícone principal
    /vendor
      react.production.min.js
      react-dom.production.min.js
      howler.min.js   # Player de áudio
```

## 🚀 Como Usar

### Desenvolvimento Local

1. Sirva os arquivos com um servidor HTTP:
```bash
python -m http.server 8000
# ou
npx serve
```

2. Acesse `http://localhost:8000`

### Alternância de Tema

- Clique no botão 🎨 em qualquer página
- O tema alterna entre Escuro e Exposição
- A preferência é salva automaticamente

### Adicionar Novo Tema

1. Em `tokens.css`, adicione novo conjunto de variáveis:
```css
:root[data-theme="novo-tema"] {
  --color-bg-page: #cor;
  /* ... demais variáveis */
}
```

2. Em `app.js`, adicione ao array THEMES:
```javascript
THEMES: ["default", "exhibit", "novo-tema"]
```

3. Atualize o método `getThemeName()` se necessário

## 🎯 Recursos

- ✅ PWA com suporte offline
- ✅ Theme switching com persistência
- ✅ Reprodução de áudio (Howler.js)
- ✅ Navegação entre páginas (React)
- ✅ Busca e filtros
- ✅ Responsive design
- ✅ Design tokens CSS

## 📱 PWA Features

- Instalável no dispositivo
- Funciona offline após primeira visita
- Cache inteligente de recursos
- Atualização automática de conteúdo JSON

## 🎨 Customização de Cores

Edite `assets/css/tokens.css` para ajustar:
- Cores de fundo
- Cores de texto
- Cores de acento/marca
- Bordas e sombras
- Raios de borda

Todas as páginas e componentes usam essas variáveis automaticamente.

## 🔧 Manutenção

### Atualizar Conteúdo
- Edite `data/books.json` para adicionar/modificar livros
- Edite `data/presentation.json` para atualizar apresentação

### Atualizar Estilos
- Tokens globais: `assets/css/tokens.css`
- Layout geral: `assets/css/app.css`
- Página de detalhes: `assets/css/books-detail.css`

### Service Worker
- Altere `VERSION` em `sw.js` após mudanças importantes
- O cache será atualizado automaticamente

## 📄 Licença

Desenvolvido para fins educacionais e informativos.

---

**Nota**: Esta aplicação requer React, ReactDOM e Howler.js carregados via CDN ou localmente na pasta `assets/vendor/`.
