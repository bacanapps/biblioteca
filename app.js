/* ========== BIBLIOTECA DA AIDS - REACT APP ==========
 * Theme switching + PWA with books, presentation, audio
 */

"use strict";

const { useState, useEffect, useRef } = React;
const e = React.createElement;

/* ========== THEME MANAGER ========== */
const ThemeManager = {
  STORAGE_KEY: "biblioteca-theme",
  THEMES: ["light", "dark"],

  init() {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    if (this.THEMES.includes(themeParam)) {
      this.apply(themeParam);
      return themeParam;
    }
    // Then check localStorage
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const theme = this.THEMES.includes(saved) ? saved : "light"; // Default to light
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
    // Update URL parameter
    const url = new URL(window.location);
    url.searchParams.set('theme', nextTheme);
    window.history.pushState({}, '', url);
    return nextTheme;
  },

  getThemeName(theme) {
    return theme === "light" ? "Modo Claro" : "Modo Escuro";
  }
};

/* ========== AUDIO PLAYER ========== */
class AudioPlayer {
  constructor() {
    this.currentSound = null;
    this.isPlaying = false;
  }

  play(url, onEnd) {
    this.stop();
    if (!window.Howl) {
      console.warn("Howler.js não carregado");
      return;
    }
    this.currentSound = new Howl({
      src: [url],
      html5: true,
      onend: () => {
        this.isPlaying = false;
        if (onEnd) onEnd();
      },
      onplay: () => {
        this.isPlaying = true;
      },
      onstop: () => {
        this.isPlaying = false;
      }
    });
    this.currentSound.play();
  }

  stop() {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.unload();
      this.currentSound = null;
    }
    this.isPlaying = false;
  }

  toggle(url, onEnd) {
    if (this.isPlaying && this.currentSound) {
      this.stop();
    } else {
      this.play(url, onEnd);
    }
  }
}

const audioPlayer = new AudioPlayer();

/* ========== HOME PAGE ========== */
function HomePage({ onNavigate, theme, onThemeToggle }) {
  return e("div", { className: "page fade-in" },
    // Theme toggle button (fixed position)
    e("button", {
      className: "theme-toggle-btn",
      onClick: onThemeToggle,
      "aria-label": "Alternar tema"
    }, theme === "light" ? "🌙" : "☀️"),

    // Hero section with gradient glass card
    e("section", { className: "hero hero-gradient glass-card" },
      e("div", { className: "hero-header" },
        e("div", { className: "hero-content" },
          e("h1", { className: "hero-title" }, "Biblioteca da AIDS"),
          e("p", { className: "hero-lede" },
            "Acesse materiais educativos sobre HIV/AIDS em formato acessível"
          )
        )
      )
    ),

    // Two-column cards section
    e("section", { className: "home-cards" },
      e("div", { className: "cards-2col" },
        // Card 1: Apresentação
        e("article", {
          className: "choice-card glass-card card-hover",
          onClick: () => onNavigate("presentation")
        },
          e("div", { className: "choice-icon" }, "📘"),
          e("h2", { className: "choice-title" }, "Apresentação"),
          e("p", { className: "choice-desc" },
            "Conheça o contexto da biblioteca e sua importância na luta contra a AIDS"
          ),
          e("div", { className: "actions" },
            e("button", { className: "btn btn-primary" }, "Explorar")
          )
        ),

        // Card 2: Publicações
        e("article", {
          className: "choice-card glass-card card-hover",
          onClick: () => onNavigate("books")
        },
          e("div", { className: "choice-icon" }, "📚"),
          e("h2", { className: "choice-title" }, "Publicações"),
          e("p", { className: "choice-desc" },
            "Acesse materiais técnicos e literários sobre HIV e aids"
          ),
          e("div", { className: "actions" },
            e("button", { className: "btn btn-green" }, "Explorar") 
          )
        )
      )
    )
  );
}

/* ========== PRESENTATION PAGE ========== */
function PresentationPage({ onNavigate, theme, onThemeToggle }) {
  const [data, setData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch("data/presentation.json")
      .then(r => r.json())
      .then(setData)
      .catch(err => console.error("Erro ao carregar apresentação:", err));
  }, []);

  const handleAudioToggle = () => {
    if (!data?.audioUrl) return;
    audioPlayer.toggle(data.audioUrl, () => setIsPlaying(false));
    setIsPlaying(!isPlaying);
  };

  if (!data) {
    return e("div", { className: "app-shell" },
      e("div", { className: "page-body" }, "Carregando...")
    );
  }

  return e("div", { className: "page fade-in" },
    // Header
    e("header", { className: "page-header" },
      e("a", {
        href: "#",
        className: "back-link",
        onClick: (ev) => { ev.preventDefault(); onNavigate("home"); }
      }, "← Voltar"),
      e("div", { className: "page-header-content" },
        e("h1", { className: "page-title" }, "Apresentação"),
        e("p", { className: "page-subtle" }, "Biblioteca da AIDS")
      ),
      e("button", {
        className: "theme-toggle-btn",
        onClick: onThemeToggle,
        "aria-label": "Alternar tema"
      }, theme === "light" ? "🌙" : "☀️")
    ),

    // Content
    e("div", { className: "presentation-card" },
      data.heroImage && e("div", { className: "presentation-heroimg-wrapper" },
        e("img", { src: data.heroImage, alt: "Biblioteca Hero" })
      ),

      e("div", { className: "presentation-textblock" }, data.content),

      data.audioUrl && e("div", { className: "audio-row" },
        e("button", {
          className: "audio-btn",
          type: "button",
          "aria-pressed": isPlaying ? "true" : "false",
          onClick: handleAudioToggle
        }, isPlaying ? "⏸️ Pausar" : "▶️ Audiodescrição")
      )
    ),

    data.disclaimer && e("div", { className: "disclaimer-card" },
      data.disclaimer
    ),

    e("div", { className: "app-footer-line" },
      "© 2025 Biblioteca da AIDS • Informação confiável sobre HIV/AIDS"
    )
  );
}

/* ========== BOOKS LIST PAGE ========== */
function BooksListPage({ onNavigate, theme, onThemeToggle }) {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    fetch("data/books.json")
      .then(r => r.json())
      .then(data => setBooks(data.books || []))
      .catch(err => console.error("Erro ao carregar livros:", err));
  }, []);

  const allTags = [...new Set(books.flatMap(b => b.tags || []))];

  const filteredBooks = books.filter(book => {
    if (!searchTerm && !selectedTag) return true;

    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchTerm ||
      book.title.toLowerCase().includes(searchLower) ||
      (book.source || "").toLowerCase().includes(searchLower) ||
      (book.description || "").toLowerCase().includes(searchLower) ||
      (book.tags || []).some(tag => tag.toLowerCase().includes(searchLower));

    const matchesTag = !selectedTag || (book.tags || []).includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return e("div", { className: "app-shell" },
    // Header
    e("div", { className: "app-header-bar" },
      e("div", { className: "app-header-left" },
        e("a", {
          href: "#",
          className: "back-link",
          onClick: (ev) => { ev.preventDefault(); onNavigate("home"); }
        }, "← Voltar")
      ),
      e("div", { className: "app-header-title" }, "Biblioteca da AIDS"),
      e("button", {
        className: "theme-toggle-btn",
        onClick: onThemeToggle,
        style: { fontSize: ".8rem", padding: ".4rem .6rem" }
      }, theme === "light" ? "🌙" : "☀️")
    ),

    // Content
    e("div", { className: "page-body" },
      // Filters
      e("div", { className: "filters-row" },
        e("div", { className: "search-input-wrapper" },
          e("input", {
            type: "text",
            className: "search-input",
            placeholder: "Buscar por título ou fonte...",
            value: searchTerm,
            onChange: (ev) => setSearchTerm(ev.target.value)
          }),
          searchTerm && e("button", {
            className: "search-clear-btn",
            onClick: () => setSearchTerm(""),
            "aria-label": "Limpar busca"
          }, "✕")
        ),
        allTags.map(tag =>
          e("button", {
            key: tag,
            className: `tag-chip ${selectedTag === tag ? "active" : ""}`,
            onClick: () => setSelectedTag(selectedTag === tag ? "" : tag)
          }, tag)
        )
      ),

      // Books grid
      e("div", { className: "books-grid" },
        filteredBooks.length === 0
          ? e("p", { style: { color: "var(--color-text-secondary)" } },
              "Nenhum resultado encontrado"
            )
          : filteredBooks.map(book =>
              e("div", {
                key: book.id,
                className: "book-card",
                onClick: () => onNavigate("book", book.id)
              },
                e("div", { className: "book-thumb" },
                  book.thumbnail
                    ? e("img", {
                        src: book.thumbnail,
                        alt: book.title,
                        style: { width: "100%", height: "100%", objectFit: "cover" }
                      })
                    : "📄"
                ),
                e("div", { className: "book-title" }, book.title),
                e("div", { className: "book-meta" }, book.source || "Fonte não especificada"),
                e("div", { className: "badge-row" },
                  book.pdfUrl && e("span", { className: "badge badge-pdf" }, "📄 PDF"),
                  book.audioUrl && e("span", { className: "badge badge-audio" }, "🎵 Áudio")
                )
              )
            )
      )
    ),

    e("div", { className: "app-footer-line" },
      `${filteredBooks.length} publicação${filteredBooks.length !== 1 ? "ões" : ""} disponível${filteredBooks.length !== 1 ? "is" : ""}`
    )
  );
}

/* ========== BOOK DETAIL PAGE ========== */
function BookDetailPage({ bookId, onNavigate, theme, onThemeToggle }) {
  const [book, setBook] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch("data/books.json")
      .then(r => r.json())
      .then(data => {
        const found = (data.books || []).find(b => b.id === bookId);
        setBook(found || null);
      })
      .catch(err => console.error("Erro ao carregar livro:", err));
  }, [bookId]);

  const handleAudioToggle = () => {
    if (!book?.audioUrl) return;
    audioPlayer.toggle(book.audioUrl, () => setIsPlaying(false));
    setIsPlaying(!isPlaying);
  };

  if (!book) {
    return e("div", { className: "app-shell" },
      e("div", { className: "page-body" }, "Carregando...")
    );
  }

  return e("div", { className: "app-shell" },
    // Header
    e("div", { className: "app-header-bar" },
      e("div", { className: "app-header-left" },
        e("a", {
          href: "#",
          className: "back-link",
          onClick: (ev) => { ev.preventDefault(); onNavigate("books"); }
        }, "← Voltar")
      ),
      e("div", { className: "app-header-title" }, book.title),
      e("button", {
        className: "theme-toggle-btn",
        onClick: onThemeToggle,
        style: { fontSize: ".8rem", padding: ".4rem .6rem" }
      }, theme === "light" ? "🌙" : "☀️")
    ),

    // Content
    e("div", { className: "page-body" },
      e("div", { className: "bookdetail-card" },
        e("div", { className: "bookdetail-thumb" },
          book.thumbnail
            ? e("img", {
                src: book.thumbnail,
                alt: book.title
              })
            : e("div", { className: "bookdetail-thumb-placeholder" })
        ),

        e("h1", { className: "bookdetail-title" }, book.title),
        
        e("div", { className: "bookdetail-source" },
          e("span", {}, book.source || "Fonte não especificada"),
          book.year && e("span", {}, ` – ${book.year}`)
        ),

        e("div", { className: "bookdetail-cta-row" },
          book.pdfUrl && e("a", {
            href: book.pdfUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "btn-open-pdf"
          }, "📄 Abrir PDF"),

          book.audioUrl && e("button", {
            className: "btn-audio",
            type: "button",
            "aria-pressed": isPlaying ? "true" : "false",
            onClick: handleAudioToggle
          }, isPlaying ? "⏸️ Pausar" : "▶️ Audiodescrição")
        ),

        // Description
        e("div", { style: { marginTop: "2rem" } },
          e("div", { className: "bookdetail-textblock" },
            book.description || "Descrição não disponível."
          )
        )
      )
    ),

    e("div", { className: "app-footer-line" },
      "© 2025 Biblioteca da AIDS"
    )
  );
}

/* ========== MAIN APP ========== */
function App() {
  const [route, setRoute] = useState(() => {
    // Initialize route based on hash
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'apresentacao' || hash === 'apresentação') {
      return { page: "presentation", params: null };
    }
    return { page: "home", params: null };
  });
  const [theme, setTheme] = useState(() => ThemeManager.init());

  // Listen to hash changes
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'apresentacao' || hash === 'apresentação') {
        setRoute({ page: "presentation", params: null });
      } else if (hash === '' || hash === 'home') {
        setRoute({ page: "home", params: null });
      }
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page, params = null) => {
    setRoute({ page, params });
    audioPlayer.stop();
    window.scrollTo(0, 0);
    // Update hash based on page
    if (page === 'presentation') {
      window.location.hash = 'apresentacao';
    } else if (page === 'home') {
      window.location.hash = '';
    }
  };

  const handleThemeToggle = () => {
    setTheme(current => ThemeManager.toggle(current));
  };

  // Render current page
  let pageComponent;
  
  if (route.page === "home") {
    pageComponent = e(HomePage, {
      onNavigate: navigate,
      theme,
      onThemeToggle: handleThemeToggle
    });
  } else if (route.page === "presentation") {
    pageComponent = e(PresentationPage, {
      onNavigate: navigate,
      theme,
      onThemeToggle: handleThemeToggle
    });
  } else if (route.page === "books") {
    pageComponent = e(BooksListPage, {
      onNavigate: navigate,
      theme,
      onThemeToggle: handleThemeToggle
    });
  } else if (route.page === "book") {
    pageComponent = e(BookDetailPage, {
      bookId: route.params,
      onNavigate: navigate,
      theme,
      onThemeToggle: handleThemeToggle
    });
  } else {
    pageComponent = e(HomePage, {
      onNavigate: navigate,
      theme,
      onThemeToggle: handleThemeToggle
    });
  }

  return pageComponent;
}

/* ========== INITIALIZE APP ========== */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  if (root) {
    ReactDOM.render(e(App), root);
  }
});
