# Biblioteca da AIDS - PWA com Theme Switching

Uma Progressive Web App (PWA) para explorar publicações sobre HIV/AIDS com funcionalidade de alternância de temas.

## 🎨 Funcionalidade de Theme Switching

### Temas Disponíveis

1. **Modo Claro (light)** - Tema padrão
   - Fundo: Cinza claro (#bcbcbc)
   - Texto: Cinza escuro (#5d5d5d)
   - Acento: Vermelho (#ff0000)
   - Ideal para leitura diurna

2. **Modo Escuro (dark)**
   - Fundo: Azul escuro profundo (#0f172a)
   - Texto: Branco e tons de cinza claros
   - Acento: Branco (#ffffff)
   - Ideal para leitura noturna

### Como Funciona

O sistema de temas usa:
- **CSS Variables** definidas em `tokens.css`
- **data-theme attribute** no elemento `<html>`
- **localStorage** para persistência da preferência do usuário
- **URL parameters** para compartilhar tema específico (ex: `?theme=dark`)
- **ThemeManager** em `app.js` para controle centralizado

### Implementação Técnica

```javascript
// Em app.js
const ThemeManager = {
  STORAGE_KEY: "biblioteca-theme",
  THEMES: ["light", "dark"],

  init() {
    // Verifica parâmetro URL primeiro
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    if (this.THEMES.includes(themeParam)) {
      this.apply(themeParam);
      return themeParam;
    }
    // Depois verifica localStorage
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const theme = this.THEMES.includes(saved) ? saved : "light"; // Padrão claro
    this.apply(theme);
    return theme;
  },

  apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  },

  toggle(currentTheme) {
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    this.apply(nextTheme);
    localStorage.setItem(this.STORAGE_KEY, nextTheme);
    // Atualiza parâmetro URL
    const url = new URL(window.location);
    url.searchParams.set('theme', nextTheme);
    window.history.pushState({}, '', url);
    return nextTheme;
  }
};
```

### CSS Tokens

```css
/* tokens.css */
:root,
:root[data-theme="light"] {
  --color-bg-page: #bcbcbc;
  --color-text-primary: #5d5d5d;
  --color-brand-accent: #ff0000;
  /* ... mais variáveis */
}

:root[data-theme="dark"] {
  --color-bg-page: #0f172a;
  --color-text-primary: #e2e8f0;
  --color-brand-accent: #ffffff;
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
      styles.css      # Estilos adicionais
    /img
      hero.png        # Logo/ícone principal
      1.2_historias_da_aids.png
      2.1_pcdt_hiv_modulo_1_2024.png
      3_pcdt_pep_interativo.png
      ...             # 20 capas de livros no total
    /audio
      presentation.mp3  # Audiodescrição da apresentação
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

### Navegação

**Página Inicial**
- Apresentação da biblioteca com audiodescrição
- Acesso ao acervo completo

**Acervo**
- Lista de todas as 20 publicações
- Busca por título
- Filtros por tags (Tratamento, PrEP, PEP, etc.)
- Contador de publicações disponíveis

**Página de Detalhes**
- Informações da publicação (título, fonte, ano)
- Botão de acesso direto ao PDF oficial
- Botão de audiodescrição (quando disponível)
- Descrição completa da publicação
- Interface simplificada sem abas para melhor experiência

### Alternância de Tema

- Clique no botão 🌙/☀️ em qualquer página
- O tema alterna entre Claro e Escuro
- A preferência é salva automaticamente em localStorage
- O tema também pode ser definido via URL: `?theme=light` ou `?theme=dark`

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
THEMES: ["light", "dark", "novo-tema"]
```

3. Atualize o método `toggle()` para suportar múltiplos temas
4. Atualize o método `getThemeName()` se necessário

## 📚 Acervo da Biblioteca

A Biblioteca da AIDS conta com **20 publicações oficiais** do Ministério da Saúde, incluindo:

- Protocolos Clínicos e Diretrizes Terapêuticas (PCDT) para HIV/AIDS
  - PCDT para adultos (módulos I e II)
  - PCDT para crianças e adolescentes (módulos I e II)
  - PCDT para PEP (Profilaxia Pós-Exposição)
  - PCDT para PrEP (Profilaxia Pré-Exposição)
- Guias de Profilaxia Pré-Exposição (PrEP) e Pós-Exposição (PEP)
- Manuais de diagnóstico e testagem
- Diretrizes para populações específicas (crianças, gestantes, população trans)
- Documentos estratégicos e de monitoramento
- Legislação e direitos das pessoas vivendo com HIV

Todas as publicações incluem:
- **Links diretos para PDFs oficiais** do gov.br
- Capas ilustrativas (thumbnails)
- Descrições detalhadas
- Tags para busca e filtragem
- Metadados completos (ano, fonte, categoria)

## 🎯 Recursos

- ✅ PWA com suporte offline
- ✅ Theme switching com persistência
- ✅ Reprodução de áudio (Howler.js)
- ✅ Navegação entre páginas (React)
- ✅ Busca e filtros
- ✅ Responsive design
- ✅ Design tokens CSS
- ✅ 20 publicações com capas ilustrativas e links para PDFs oficiais
- ✅ Interface simplificada nas páginas de detalhes (sem abas)
- ✅ Google Analytics 4 (GA4) para análise de uso e métricas

## 📊 Analytics e Métricas

A aplicação integra Google Analytics 4 (GA4) para monitoramento de uso e comportamento dos usuários:

**Measurement ID**: `G-8LF7TTE76Z`

**Dados Coletados:**
- Visualizações de página
- Interações com elementos (cliques, navegação)
- Tempo de sessão
- Uso de recursos (audiodescrições, busca, filtros)
- Dispositivos e navegadores utilizados

**Implementação:**
O código do Google Analytics está incluído no `<head>` do `index.html`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-8LF7TTE76Z"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-8LF7TTE76Z');
</script>
```

**Privacidade:**
- Os dados são anonimizados
- Usado apenas para fins de melhoria da aplicação
- Conforme as diretrizes da LGPD

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
