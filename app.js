/* ========== BIBLIOTECA DA AIDS - REACT APP ==========
 * Theme switching + PWA with books, presentation, audio
 */

"use strict";

const { useState, useEffect, useRef } = React;
const e = React.createElement;

/* ========== APP VERSION ========== */
// Update this manually when deploying to reflect last GitHub update
const APP_VERSION = '11/12/2025, 11:11';
const getAppVersion = () => {
  return `(v. ${APP_VERSION})`;
};

/* ========== ANALYTICS TRACKER ========== */
const AnalyticsTracker = {
  // Check if gtag is available
  isAvailable() {
    return typeof window.gtag === 'function';
  },

  // Track page views
  trackPageView(pageName, pageTitle) {
    if (!this.isAvailable()) return;
    window.gtag('event', 'page_view', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.hash
    });
    console.log('📊 Analytics: Page view -', pageName);
  },

  // Track publication views
  trackPublicationView(bookId, bookTitle) {
    if (!this.isAvailable()) return;
    window.gtag('event', 'view_publication', {
      event_category: 'engagement',
      event_label: bookTitle,
      publication_id: bookId,
      publication_title: bookTitle
    });
    console.log('📊 Analytics: Publication view -', bookTitle);
  },

  // Track audio plays
  trackAudioPlay(audioType, contentTitle) {
    if (!this.isAvailable()) return;
    window.gtag('event', 'play_audio', {
      event_category: 'engagement',
      event_label: contentTitle,
      audio_type: audioType,
      content_title: contentTitle
    });
    console.log('📊 Analytics: Audio play -', audioType, '-', contentTitle);
  },

  // Track PDF opens
  trackPdfOpen(bookTitle, pdfUrl) {
    if (!this.isAvailable()) return;
    window.gtag('event', 'open_pdf', {
      event_category: 'engagement',
      event_label: bookTitle,
      pdf_url: pdfUrl,
      publication_title: bookTitle
    });
    console.log('📊 Analytics: PDF open -', bookTitle);
  },

  // Track search usage
  trackSearch(searchTerm, resultCount) {
    if (!this.isAvailable()) return;
    window.gtag('event', 'search', {
      search_term: searchTerm,
      result_count: resultCount
    });
    console.log('📊 Analytics: Search -', searchTerm, '- Results:', resultCount);
  },

  // Track filter usage
  trackFilter(filterTag) {
    if (!this.isAvailable()) return;
    window.gtag('event', 'use_filter', {
      event_category: 'engagement',
      event_label: filterTag,
      filter_tag: filterTag
    });
    console.log('📊 Analytics: Filter -', filterTag);
  },

  // Track theme toggle
  trackThemeToggle(newTheme) {
    if (!this.isAvailable()) return;
    window.gtag('event', 'toggle_theme', {
      event_category: 'engagement',
      event_label: newTheme,
      theme: newTheme
    });
    console.log('📊 Analytics: Theme toggle -', newTheme);
  },

  // Track language toggle
  trackLanguageToggle(newLanguage) {
    if (!this.isAvailable()) return;
    window.gtag('event', 'language_toggle', {
      language: newLanguage,
      event_category: 'user_preference'
    });
    console.log('📊 Analytics: Language toggle -', newLanguage);
  }
};

/* ========== TRANSLATIONS ========== */
const TRANSLATIONS = {
  'pt-br': {
    nav: {
      voltar: 'Voltar'
    },
    home: {
      heroTitle: 'BIBLIOTECA DIGITAL DA AIDS',
      heroDesc: 'Acesse publicações sobre HIV e aids disponibilizadas pelo Ministério da Saúde do Brasil.',
      cardApresentacao: {
        title: 'Apresentação',
        button: 'Explorar'
      },
      cardPublicacoes: {
        title: 'Publicações',
        button: 'Explorar'
      }
    },
    apresentacao: {
      title: 'Apresentação',
      subtitle: 'Biblioteca da AIDS',
      loading: 'Carregando...',
      audioBtnPlay: '▶️ Audiodescrição',
      audioBtnPause: '⏸️ Pausar'
    },
    books: {
      title: 'Biblioteca da AIDS',
      searchPlaceholder: 'Buscar por título ou fonte...',
      clearBtn: 'Limpar busca',
      noResults: 'Nenhum resultado encontrado'
    },
    bookDetail: {
      subtitle: 'Biblioteca da AIDS',
      sourceLabel: 'Fonte não especificada',
      openPdf: '📄 Abrir PDF',
      audioBtnPlay: '▶️ Audiodescrição',
      audioBtnPause: '⏸️ Pausar',
      descriptionLabel: 'Descrição não disponível.',
      loading: 'Carregando...'
    },
    common: {
      themeToggleAria: 'Alternar tema visual',
      languageToggleAria: 'Alternar idioma',
      languageLabel: 'Português',
      footer: '© 2025 Dezembro Vermelho • Ministério da Saúde'
    }
  },
  'en': {
    nav: {
      voltar: 'Back'
    },
    home: {
      heroTitle: 'AIDS DIGITAL LIBRARY',
      heroDesc: 'Check out publications on HIV and AIDS made available by the Brazilian Ministry of Health.',
      cardApresentacao: {
        title: 'Introduction',
        button: 'Explore'
      },
      cardPublicacoes: {
        title: 'Publications',
        button: 'Explore'
      }
    },
    apresentacao: {
      title: 'Introduction',
      subtitle: 'AIDS Library',
      loading: 'Loading...',
      audioBtnPlay: '▶️ Audio Description',
      audioBtnPause: '⏸️ Pause'
    },
    books: {
      title: 'AIDS Library',
      searchPlaceholder: 'Search by title or source...',
      clearBtn: 'Clear search',
      noResults: 'No results found'
    },
    bookDetail: {
      subtitle: 'AIDS Library',
      sourceLabel: 'Source not specified',
      openPdf: '📄 Open PDF',
      audioBtnPlay: '▶️ Audio Description',
      audioBtnPause: '⏸️ Pause',
      descriptionLabel: 'Description not available.',
      loading: 'Loading...'
    },
    common: {
      themeToggleAria: 'Toggle visual theme',
      languageToggleAria: 'Toggle language',
      languageLabel: 'English',
      footer: '© 2025 Red December • Ministry of Health'
    }
  }
};

/**
 * Translation helper function
 * @param {string} language - The current language ('en' or 'pt-br')
 * @param {string} key - The translation key path (e.g., 'home.heroTitle')
 * @returns {string} The translated string
 */
function t(language, key) {
  const keys = key.split('.');
  let value = TRANSLATIONS[language];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      // Fallback to Portuguese if key not found
      value = TRANSLATIONS['pt-br'];
      for (const k2 of keys) {
        if (value && typeof value === 'object') {
          value = value[k2];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }

  return value || key;
}

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

/* ========== LANGUAGE MANAGER ========== */
function useLanguage() {
  const [language, setLanguage] = useState(() => {
    // 1. Check URL parameter first (?lang=en)
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam === 'en' || langParam === 'pt-br' || langParam === 'pt') {
      return langParam === 'en' ? 'en' : 'pt-br';
    }

    // 2. Check localStorage
    const saved = localStorage.getItem('biblioteca-language');
    if (saved === 'en' || saved === 'pt-br') {
      return saved;
    }

    // 3. Browser language detection (default)
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && browserLang.toLowerCase().startsWith('en')) {
      return 'en';
    }

    // 4. Default to Portuguese
    return 'pt-br';
  });

  const toggleLanguage = () => {
    setLanguage(current => {
      const next = current === 'en' ? 'pt-br' : 'en';
      localStorage.setItem('biblioteca-language', next);
      document.documentElement.setAttribute('lang', next);

      // Update URL parameter
      const url = new URL(window.location);
      url.searchParams.set('lang', next);
      window.history.pushState({}, '', url);

      // Track language change
      AnalyticsTracker.trackLanguageToggle(next);

      return next;
    });
  };

  // Apply language on mount
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  return { language, toggleLanguage };
}

/* ========== HOME PAGE ========== */
function HomePage({ onNavigate, theme, onThemeToggle, language, onLanguageToggle }) {
  return e("div", { className: "page fade-in" },
    // Theme toggle button (fixed position)
    e("button", {
      className: "theme-toggle-btn",
      onClick: onThemeToggle,
      "aria-label": t(language, 'common.themeToggleAria')
    }, theme === "light" ? "🌙" : "☀️"),

    // Language toggle button
    e("button", {
      className: "language-toggle-btn",
      onClick: onLanguageToggle,
      "aria-label": t(language, 'common.languageToggleAria')
    }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN'),

    // Hero section with gradient glass card
    e("section", { className: "hero hero-gradient glass-card" },
      e("div", { className: "hero-header" },
        e("div", { className: "hero-content" },
          e("h1", { className: "hero-title" }, t(language, 'home.heroTitle')),
          e("p", { className: "hero-lede" },
            t(language, 'home.heroDesc')
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
          onClick: () => {
            AnalyticsTracker.trackPageView('presentation', t(language, 'apresentacao.title'));
            onNavigate("presentation");
          }
        },
          e("div", { className: "choice-icon" }, "📘"),
          e("h2", { className: "choice-title" }, t(language, 'home.cardApresentacao.title')),
          e("p", { className: "choice-desc" },
            ""
          ),
          e("div", { className: "actions" },
            e("button", { className: "btn btn-primary" }, t(language, 'home.cardApresentacao.button'))
          )
        ),

        // Card 2: Publicações
        e("article", {
          className: "choice-card glass-card card-hover",
          onClick: () => {
            AnalyticsTracker.trackPageView('books', t(language, 'home.cardPublicacoes.title'));
            onNavigate("books");
          }
        },
          e("div", { className: "choice-icon" }, "📚"),
          e("h2", { className: "choice-title" }, t(language, 'home.cardPublicacoes.title')),
          e("p", { className: "choice-desc" },
            ""
          ),
          e("div", { className: "actions" },
            e("button", { className: "btn btn-green" }, t(language, 'home.cardPublicacoes.button'))
          )
        )
      )
    ),

    e("div", { className: "app-footer-line" },
      e("span", null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
      e("button", {
        className: "footer-lang-toggle",
        onClick: onLanguageToggle,
        "aria-label": t(language, 'common.languageToggleAria'),
        style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
      }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
    )
  );
}

/* ========== PRESENTATION PAGE ========== */
function PresentationPage({ onNavigate, theme, onThemeToggle, language, onLanguageToggle }) {
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
    if (!isPlaying) {
      AnalyticsTracker.trackAudioPlay('presentation', t(language, 'apresentacao.title'));
    }
    audioPlayer.toggle(data.audioUrl, () => setIsPlaying(false));
    setIsPlaying(!isPlaying);
  };

  // Hide audio button when English selected (audio not ready yet)
  const showAudioButton = language === 'pt-br' && data?.audioUrl;

  if (!data) {
    return e("div", { className: "app-shell" },
      e("div", { className: "page-body" }, t(language, 'apresentacao.loading'))
    );
  }

  return e("div", { className: "page fade-in" },
    // Header
    e("header", { className: "page-header" },
      e("a", {
        href: "#",
        className: "back-link",
        onClick: (ev) => { ev.preventDefault(); onNavigate("home"); }
      }, `← ${t(language, 'nav.voltar')}`),
      e("div", { className: "page-header-content" },
        e("h1", { className: "page-title" }, t(language, 'apresentacao.title')),
        e("p", { className: "page-subtle" }, t(language, 'apresentacao.subtitle'))
      ),
      e("button", {
        className: "theme-toggle-btn",
        onClick: onThemeToggle,
        "aria-label": t(language, 'common.themeToggleAria')
      }, theme === "light" ? "🌙" : "☀️"),
      e("button", {
        className: "language-toggle-btn",
        onClick: onLanguageToggle,
        "aria-label": t(language, 'common.languageToggleAria')
      }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
    ),

    // Content
    e("div", { className: "presentation-card" },
      data.heroImage && e("div", { className: "presentation-heroimg-wrapper" },
        e("img", { src: data.heroImage, alt: t(language, 'apresentacao.subtitle') })
      ),

      e("div", { className: "presentation-textblock" }, language === 'en' ? data.contentEn : data.content),

      showAudioButton && e("div", { className: "audio-row" },
        e("button", {
          className: "audio-btn",
          type: "button",
          "aria-pressed": isPlaying ? "true" : "false",
          onClick: handleAudioToggle
        }, isPlaying ? t(language, 'apresentacao.audioBtnPause') : t(language, 'apresentacao.audioBtnPlay'))
      )
    ),

    e("div", { className: "app-footer-line" },
      e("span", null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
      e("button", {
        className: "footer-lang-toggle",
        onClick: onLanguageToggle,
        "aria-label": t(language, 'common.languageToggleAria'),
        style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
      }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
    )
  );
}

/* ========== BOOKS LIST PAGE ========== */
function BooksListPage({ onNavigate, theme, onThemeToggle, language, onLanguageToggle }) {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    fetch("data/books.json")
      .then(r => r.json())
      .then(data => setBooks(data.books || []))
      .catch(err => console.error("Erro ao carregar livros:", err));
  }, []);

  // Track search usage with debouncing
  useEffect(() => {
    if (!searchTerm) return;
    const timer = setTimeout(() => {
      const resultCount = books.filter(book => {
        const searchLower = searchTerm.toLowerCase().trim();
        return book.title.toLowerCase().includes(searchLower) ||
               (book.source || "").toLowerCase().includes(searchLower) ||
               (book.description || "").toLowerCase().includes(searchLower) ||
               (book.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
      }).length;
      AnalyticsTracker.trackSearch(searchTerm, resultCount);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm, books]);

  // Track filter usage
  useEffect(() => {
    if (selectedTag) {
      AnalyticsTracker.trackFilter(selectedTag);
    }
  }, [selectedTag]);

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
        }, `← ${t(language, 'nav.voltar')}`)
      ),
      e("div", { className: "app-header-title" }, t(language, 'books.title')),
      e("button", {
        className: "theme-toggle-btn",
        onClick: onThemeToggle,
        style: { fontSize: ".8rem", padding: ".4rem .6rem" }
      }, theme === "light" ? "🌙" : "☀️"),
      e("button", {
        className: "language-toggle-btn",
        onClick: onLanguageToggle,
        "aria-label": t(language, 'common.languageToggleAria'),
        style: { fontSize: ".8rem", padding: ".4rem .6rem", marginLeft: '8px' }
      }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
    ),

    // Content
    e("div", { className: "page-body" },
      // Filters
      e("div", { className: "filters-row" },
        e("div", { className: "search-input-wrapper" },
          e("input", {
            type: "text",
            className: "search-input",
            placeholder: t(language, 'books.searchPlaceholder'),
            value: searchTerm,
            onChange: (ev) => setSearchTerm(ev.target.value)
          }),
          searchTerm && e("button", {
            className: "search-clear-btn",
            onClick: () => setSearchTerm(""),
            "aria-label": t(language, 'books.clearBtn')
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
              t(language, 'books.noResults')
            )
          : filteredBooks.map(book =>
              e("div", {
                key: book.id,
                className: "book-card",
                onClick: () => {
                  AnalyticsTracker.trackPublicationView(book.id, book.title);
                  onNavigate("book", book.id);
                }
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
                e("div", { className: "book-meta" }, book.source || t(language, 'bookDetail.sourceLabel')),
                e("div", { className: "badge-row" },
                  book.pdfUrl && e("span", { className: "badge badge-pdf" }, "📄 PDF"),
                  book.audioUrl && e("span", { className: "badge badge-audio" }, "🎵 Áudio")
                )
              )
            )
      )
    ),

    e("div", { className: "app-footer-line" },
      e("span", null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
      e("button", {
        className: "footer-lang-toggle",
        onClick: onLanguageToggle,
        "aria-label": t(language, 'common.languageToggleAria'),
        style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
      }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
    )
  );
}

/* ========== BOOK DETAIL PAGE ========== */
function BookDetailPage({ bookId, onNavigate, theme, onThemeToggle, language, onLanguageToggle }) {
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
    if (!isPlaying) {
      AnalyticsTracker.trackAudioPlay('book', book.title);
    }
    audioPlayer.toggle(book.audioUrl, () => setIsPlaying(false));
    setIsPlaying(!isPlaying);
  };

  // Hide audio button when English selected (audio not ready yet)
  const showAudioButton = language === 'pt-br' && book?.audioUrl;

  if (!book) {
    return e("div", { className: "app-shell" },
      e("div", { className: "page-body" }, t(language, 'bookDetail.loading'))
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
        }, `← ${t(language, 'nav.voltar')}`)
      ),
      e("div", { className: "app-header-title" }, book.title),
      e("button", {
        className: "theme-toggle-btn",
        onClick: onThemeToggle,
        style: { fontSize: ".8rem", padding: ".4rem .6rem" }
      }, theme === "light" ? "🌙" : "☀️"),
      e("button", {
        className: "language-toggle-btn",
        onClick: onLanguageToggle,
        "aria-label": t(language, 'common.languageToggleAria'),
        style: { fontSize: ".8rem", padding: ".4rem .6rem", marginLeft: '8px' }
      }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
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
          e("span", {}, book.source || t(language, 'bookDetail.sourceLabel')),
          book.year && e("span", {}, ` – ${book.year}`)
        ),

        e("div", { className: "bookdetail-cta-row" },
          book.pdfUrl && e("a", {
            href: book.pdfUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "btn-open-pdf",
            onClick: () => AnalyticsTracker.trackPdfOpen(book.title, book.pdfUrl)
          }, t(language, 'bookDetail.openPdf')),

          showAudioButton && e("button", {
            className: "btn-audio",
            type: "button",
            "aria-pressed": isPlaying ? "true" : "false",
            onClick: handleAudioToggle
          }, isPlaying ? t(language, 'bookDetail.audioBtnPause') : t(language, 'bookDetail.audioBtnPlay'))
        ),

        // Description
        e("div", { style: { marginTop: "2rem" } },
          e("div", { className: "bookdetail-textblock" },
            book.description || t(language, 'bookDetail.descriptionLabel')
          )
        )
      )
    ),

    e("div", { className: "app-footer-line" },
      e("span", null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
      e("button", {
        className: "footer-lang-toggle",
        onClick: onLanguageToggle,
        "aria-label": t(language, 'common.languageToggleAria'),
        style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
      }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
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
  const { language, toggleLanguage } = useLanguage();

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

  // Track page views when route changes
  useEffect(() => {
    const pageNames = {
      home: 'Home',
      presentation: t(language, 'apresentacao.title'),
      books: t(language, 'home.cardPublicacoes.title'),
      book: 'Book Details'
    };
    const pageName = pageNames[route.page] || 'Unknown Page';
    AnalyticsTracker.trackPageView(route.page, pageName);
  }, [route, language]);

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
    setTheme(current => {
      const nextTheme = ThemeManager.toggle(current);
      AnalyticsTracker.trackThemeToggle(nextTheme);
      return nextTheme;
    });
  };

  // Render current page
  let pageComponent;

  if (route.page === "home") {
    pageComponent = e(HomePage, {
      onNavigate: navigate,
      theme,
      onThemeToggle: handleThemeToggle,
      language,
      onLanguageToggle: toggleLanguage
    });
  } else if (route.page === "presentation") {
    pageComponent = e(PresentationPage, {
      onNavigate: navigate,
      theme,
      onThemeToggle: handleThemeToggle,
      language,
      onLanguageToggle: toggleLanguage
    });
  } else if (route.page === "books") {
    pageComponent = e(BooksListPage, {
      onNavigate: navigate,
      theme,
      onThemeToggle: handleThemeToggle,
      language,
      onLanguageToggle: toggleLanguage
    });
  } else if (route.page === "book") {
    pageComponent = e(BookDetailPage, {
      bookId: route.params,
      onNavigate: navigate,
      theme,
      onThemeToggle: handleThemeToggle,
      language,
      onLanguageToggle: toggleLanguage
    });
  } else {
    pageComponent = e(HomePage, {
      onNavigate: navigate,
      theme,
      onThemeToggle: handleThemeToggle,
      language,
      onLanguageToggle: toggleLanguage
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
