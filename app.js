(() => {
  const { useState, useEffect, useMemo, useCallback, useRef } = React;
  const e = React.createElement;
  // Back-compat aliases: some components still call h(...) or f(...)
  const h = e;
  const f = e;
  console.debug('[app] initializing app.js');


// ---- Audio helper (safe to add once) ----
(function () {
  if (window.__audioController) return;

  const toRelative = (url) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/')) return `.${url}`;
    return url;
  };

  let current = { id: null, howl: null };

  function teardown(stop = true) {
    if (current.howl) {
      try { if (stop) current.howl.stop(); } catch {}
      try { current.howl.unload(); } catch {}
    }
    current = { id: null, howl: null };
  }

  function toggleAudio(id, src) {
    const HowlCtor = window.Howl || (window.Howler && window.Howler.Howl);
    if (!HowlCtor) { console.warn('Howler not loaded'); return; }
    if (!id || !src) return;

    src = toRelative(src);

    // Same button toggles pause/resume
    if (current.id === id && current.howl) {
      if (current.howl.playing()) current.howl.pause();
      else current.howl.play();
      return;
    }

    // New sound: stop previous, start new
    teardown();
    current = {
      id,
      howl: new HowlCtor({
        src: [src],
        html5: true,        // required for mobile + long audio on Pages
        preload: true,
        onend: () => teardown(false),
        onstop: () => teardown(false)
      })
    };
    current.howl.play();
  }

  // Delegate clicks: any element with [data-audio-src] will toggle
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-audio-src]');
    if (!el) return;
    ev.preventDefault();
    const id = el.getAttribute('data-audio-id') || el.id || el.textContent.trim();
    const src = el.getAttribute('data-audio-src');
    toggleAudio(id, src);
  }, { capture: true });

  window.__audioController = { toggleAudio, teardown, toRelative };
})();

  // Helpful runtime error overlay for debugging a blank/white page.
  function showFatalError(message, err) {
    try {
      console.error('[app] fatal error:', message, err);
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = '';
        const container = document.createElement('div');
        container.style.cssText = 'background:#111;color:#fff;padding:20px;font-family:monospace;white-space:pre-wrap;';
        const title = document.createElement('div');
        title.style.fontSize = '18px';
        title.style.fontWeight = '700';
        title.style.marginBottom = '8px';
        title.textContent = 'Erro fatal ao carregar a aplicação';
        const msg = document.createElement('div');
        msg.textContent = message;
        const details = document.createElement('pre');
        details.style.marginTop = '12px';
        details.style.maxHeight = '60vh';
        details.style.overflow = 'auto';
        details.textContent = (err && err.stack) || String(err || '');
        container.appendChild(title);
        container.appendChild(msg);
        container.appendChild(details);
        root.appendChild(container);
      }
    } catch (e2) {
      console.error('[app] failed to show fatal overlay', e2);
    }
  }

  window.addEventListener('error', function (ev) {
    showFatalError(ev.message || 'Unhandled error', ev.error || ev);
  });
  window.addEventListener('unhandledrejection', function (ev) {
    showFatalError(ev.reason ? (ev.reason.message || String(ev.reason)) : 'Unhandled promise rejection', ev.reason || ev);
  });

  // Development helper: if running on localhost, automatically unregister any
  // previously installed service workers to avoid cached/blocked resources
  // interfering with development. This only runs on localhost or 127.x.
  (function unregisterSWOnLocalhost() {
    try {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1' || host === '') {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            if (!regs || regs.length === 0) return;
            console.debug('[app] unregistering service workers for localhost', regs);
            regs.forEach((r) => {
              try {
                r.unregister().then((ok) => console.debug('[app] sw unregistered', ok));
              } catch (e) {
                console.warn('[app] failed to unregister sw', e);
              }
            });
          }).catch((e) => console.warn('[app] getRegistrations failed', e));
        }
      }
    } catch (e) {
      console.warn('[app] unregisterSWOnLocalhost failed', e);
    }
  })();
  // Detail page styles were moved to an external stylesheet:
  // assets/css/books-detail.css

  const ROUTES = {
    home: 'home',
    apresentacao: 'apresentacao',
    publicacoes: 'publicacoes'
  };

  const audioStore = (() => {
    let sound = null;
    let stopHandler = null;
    let state = { playingId: null, src: null, isPlaying: false };
    const listeners = new Set();

    function emit() {
      listeners.forEach((listener) => listener(state));
    }

    function resetState() {
      state = { playingId: null, src: null, isPlaying: false };
      emit();
    }

    function detach(ref) {
      if (!ref || !stopHandler) return;
      ref.off('end', stopHandler);
      ref.off('stop', stopHandler);
      ref.off('loaderror', stopHandler);
      ref.off('playerror', stopHandler);
    }

    function cleanup(fromEvent) {
      if (!sound) return;
      const ref = sound;
      detach(ref);
      sound = null;
      stopHandler = null;
      if (!fromEvent) {
        try {
          ref.stop();
        } catch (err) {
          console.warn('Erro ao parar áudio', err);
        }
      }
      try {
        ref.unload();
      } catch (err) {
        console.warn('Erro ao descarregar áudio', err);
      }
    }

    function handleStop() {
      cleanup(true);
      resetState();
    }

    function attach(ref) {
      stopHandler = handleStop;
      ref.on('end', stopHandler);
      ref.on('stop', stopHandler);
      ref.on('loaderror', stopHandler);
      ref.on('playerror', stopHandler);
    }

    function toggle(id, src) {
      if (!id) return;
      if (state.playingId === id && sound) {
        if (state.isPlaying) {
          sound.pause();
          state = { ...state, isPlaying: false };
          emit();
          return;
        }
        sound.play();
        state = { ...state, isPlaying: true };
        emit();
        return;
      }
      cleanup();
      if (!src) {
        resetState();
        return;
      }
      const howl = new Howl({
        src: [src],
        html5: true
      });
      sound = howl;
      attach(howl);
      state = { playingId: id, src, isPlaying: true };
      emit();
      howl.play();
    }

    function stop(id) {
      if (id && state.playingId && id !== state.playingId) {
        return;
      }
      cleanup();
      resetState();
    }

    function stopIfMatches(id) {
      if (!id) return;
      if (state.playingId === id) {
        stop();
      }
    }

    function subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          stop();
        }
      };
    }

    function getState() {
      return state;
    }

    return {
      toggle,
      stop,
      stopIfMatches,
      subscribe,
      getState
    };
  })();

  function useHowlerAudio() {
    // Keep a small piece of state for reactive updates
    const [state, setState] = useState(audioStore.getState());

    // Subscribe once to the audio store and update local state when it changes
    useEffect(() => audioStore.subscribe(setState), []);

    // Stable function wrappers for actions
    const togglePlayback = useCallback((id, src) => audioStore.toggle(id, src), []);
    const stopPlayback = useCallback((id) => audioStore.stop(id), []);
    const stopIfMatches = useCallback((id) => audioStore.stopIfMatches(id), []);

    // Return a stable object reference so consumers don't get a new object every render.
    // We keep the object identity stable via a ref and update its properties when
    // the internal state or callbacks change. This avoids cascading effect re-runs
    // where components that consume `audio` pass functions derived from it to
    // hooks (for example, `useBooksData(() => audio.stopPlayback())`) and cause
    // repeated fetch cancellations.
    const apiRef = useRef(null);
    if (!apiRef.current) {
      apiRef.current = {
        playingId: state.playingId,
        isPlaying: state.isPlaying,
        currentSrc: state.src,
        togglePlayback,
        stopPlayback,
        stopIfMatches
      };
    }

    // Keep the ref's properties up-to-date without changing object identity.
    useEffect(() => {
      const cur = apiRef.current;
      if (!cur) return;
      cur.playingId = state.playingId;
      cur.isPlaying = state.isPlaying;
      cur.currentSrc = state.src;
      cur.togglePlayback = togglePlayback;
      cur.stopPlayback = stopPlayback;
      cur.stopIfMatches = stopIfMatches;
    }, [state.playingId, state.isPlaying, state.src, togglePlayback, stopPlayback, stopIfMatches]);

    return apiRef.current;
  }

  function stripHtml(content) {
    if (!content) return '';
    return String(content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function toStringArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
    }
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
  }

  f// Replace your current resolveAssetPath with this:
function resolveAssetPath(path) {
  if (!path || typeof path !== 'string') return null;
  const trimmed = path.trim();
  if (!trimmed) return null;

  // Keep absolute URLs
  if (/^(https?:)?\/\//i.test(trimmed)) return trimmed;

  // Build a base like: https://bacanapps.github.io/biblioteca/
  const base = new URL('.', window.location.origin + window.location.pathname);

  // If someone mistakenly passed "/assets/…", strip the leading slash
  const cleaned = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;

  return new URL(cleaned, base).toString();
}

  function formatDuration(value) {
    if (value === undefined || value === null) return null;
    let seconds = null;
    if (typeof value === 'number' && Number.isFinite(value)) {
      seconds = value;
    } else if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      if (/^\d+:\d{1,2}$/.test(trimmed)) {
        const parts = trimmed.split(':');
        const mins = Number(parts[0]);
        const secs = Number(parts[1]);
        if (Number.isFinite(mins) && Number.isFinite(secs)) {
          seconds = mins * 60 + secs;
        }
      } else {
        const numeric = Number(trimmed);
        if (Number.isFinite(numeric)) {
          seconds = numeric;
        }
      }
    }
    if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) {
      return null;
    }
    const rounded = Math.round(seconds);
    if (rounded < 60) {
      return `${rounded}s`;
    }
    const minutes = Math.floor(rounded / 60);
    const remainder = rounded % 60;
    const padded = remainder < 10 ? `0${remainder}` : `${remainder}`;
    return `${minutes} m ${padded} s`;
  }

  function normalizeBooks(entries) {
    if (!Array.isArray(entries)) return [];
    const normalized = [];
    entries.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') return;
      const title = typeof entry.title === 'string' ? entry.title.trim() : '';
      if (!title) return;
      const id = String(entry.id || entry.slug || `book-${index + 1}`);
      const author = typeof entry.author === 'string' ? entry.author.trim() : '';
      const year = entry.year && Number.isFinite(Number(entry.year)) ? Number(entry.year) : null;
      const tags = toStringArray(entry.tags || entry.categories);
      const coverPath = typeof entry.cover === 'string' ? entry.cover : null;
      const cover = coverPath ? resolveAssetPath(coverPath) : null;
      const pdfUrlRaw = typeof entry.pdfUrl === 'string' ? entry.pdfUrl : null;
      const pdfUrl = pdfUrlRaw ? resolveAssetPath(pdfUrlRaw) : null;
      const audio = entry.audioDescription || entry.audio || {};
      const audioSrc =
        resolveAssetPath(
          typeof audio.src === 'string' && audio.src.trim()
            ? audio.src.trim()
            : `/assets/audio/${id}.mp3`
        ) || resolveAssetPath(`/assets/audio/${id}.mp3`);
      const durationLabel = formatDuration(
        audio.durationSec ?? audio.durationSeconds ?? audio.duration ?? entry.audioDuration
      );
      const synopsisHtml =
        typeof entry.synopsisHtml === 'string' && entry.synopsisHtml.trim()
          ? entry.synopsisHtml.trim()
          : '';
      const analysisHtml =
        typeof entry.analysisHtml === 'string' && entry.analysisHtml.trim()
          ? entry.analysisHtml.trim()
          : '';
      const transcriptHtml =
        typeof entry.transcriptHtml === 'string' && entry.transcriptHtml.trim()
          ? entry.transcriptHtml.trim()
          : '';
      const sources = Array.isArray(entry.sources)
        ? entry.sources
            .map((source) => {
              if (!source || typeof source !== 'object') return null;
              const label = typeof source.label === 'string' ? source.label.trim() : '';
              const url = typeof source.url === 'string' ? source.url.trim() : '';
              if (!label || !url) return null;
              return { label, url };
            })
            .filter(Boolean)
        : [];
      const searchText = [title, author, year ? String(year) : '', tags.join(' '), stripHtml(synopsisHtml)]
        .join(' ')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      normalized.push({
        id,
        title,
        author,
        year,
        tags,
        cover,
        pdfUrl,
        audioSrc,
        durationLabel,
        synopsisHtml,
        analysisHtml,
        transcriptHtml,
        sources,
        searchText
      });
    });
    return normalized;
  }

  function fetchBooksData(signal) {
    // Use a relative path so the data loads when the app is opened from file:// or
    // served from a nested path. Resolve an absolute URL first so failures are
    // easier to inspect in DevTools and logs.
    // Try a couple of sensible URL resolutions so the app works whether the
    // document is served from the site root, a subpath, or opened via file://.
    const candidates = [];
    try {
      // Candidate 1: origin + pathname + /data/books.json (works when index.html
      // is served from a folder or a subpath)
      const basePath = `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}`;
      candidates.push(new URL('./data/books.json', basePath).toString());
    } catch (e) {
      // ignore
    }
    try {
      // Candidate 2: relative to the current full URL (handles file:// and hash)
      candidates.push(new URL('./data/books.json', window.location.href).toString());
    } catch (e) {
      // ignore
    }
    // Candidate 3: absolute path from origin
    try {
      candidates.push(`${window.location.origin}/data/books.json`);
    } catch (e) {}

    // Expose last attempted URL for debugging UI
    fetchBooksData._lastTried = null;

    // Log service worker controller if present
    try {
      console.debug('[fetchBooksData] serviceWorker.controller=', navigator.serviceWorker && navigator.serviceWorker.controller);
    } catch (e) {}

    const attempt = (idx) => {
      if (idx >= candidates.length) {
        return Promise.reject(new Error('No candidate URLs to fetch books.json'));
      }
      let url = candidates[idx];
      // Normalize accidental trailing slashes which can turn a file path into a
      // directory request on some servers (resulting in 301/302 redirects or
      // canceled requests). Keep protocol slashes intact.
      const normalized = String(url).replace(/([^:\/])\/+$/, '$1');
      if (normalized !== url) {
        console.debug('[fetchBooksData] normalized trailing slash from', url, 'to', normalized);
        url = normalized;
      }
      fetchBooksData._lastTried = url;
      console.debug('[fetchBooksData] fetching candidate', idx, url);
      return fetch(url, { signal })
        .then((response) => {
          if (!response.ok) {
            const msg = `Falha ao carregar publicações (${response.status}) @ ${response.url}`;
            console.warn('[fetchBooksData] candidate failed', msg);
            // try next candidate
            return attempt(idx + 1);
          }
          return response.json();
        })
        .then((json) => normalizeBooks(json))
        .catch((err) => {
          // If fetch was aborted, propagate the abort so callers can handle it
          if (err && err.name === 'AbortError') throw err;
          console.error('[fetchBooksData] fetch candidate error', err);
          // try next candidate if available
          return attempt(idx + 1);
        });
    };

    return attempt(0);
  }

  function useBooksData(teardownAudio) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);

    const stopAudio = useCallback(() => {
      if (typeof teardownAudio === 'function') {
        teardownAudio();
      }
    }, [teardownAudio]);

    const load = useCallback(() => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      stopAudio();
      fetchBooksData(controller.signal)
        .then((items) => {
          setBooks(items);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name === 'AbortError') {
            return;
          }
          console.error('Erro ao carregar publicações', err);
          setError(err);
          setLoading(false);
        });
    }, [stopAudio]);

    useEffect(() => {
      load();
      return () => {
        if (abortRef.current) {
          abortRef.current.abort();
        }
        stopAudio();
      };
    }, [load, stopAudio]);

    const reload = useCallback(() => {
      load();
    }, [load]);

    return { books, loading, error, reload };
  }

  function usePresentationData() {
    const [state, setState] = useState({ data: null, loading: true, error: null });

    useEffect(() => {
      let active = true;
      // Resolve an absolute URL so failures are explicit in logs/network tab.
      const presUrl = new URL('./data/presentation.json', window.location.href).toString();
      console.debug('[usePresentationData] fetching', presUrl);
      fetch(presUrl)
        .then((response) => {
          if (!response.ok) {
            const msg = `Falha ao carregar apresentação (${response.status}) @ ${response.url}`;
            console.error('[usePresentationData] error', msg);
            throw new Error(msg);
          }
          return response.json();
        })
        .then((json) => {
          if (!active) return;
          setState({ data: json, loading: false, error: null });
        })
        .catch((err) => {
          if (!active) return;
          console.error('Erro ao carregar a apresentação', err);
          setState({ data: null, loading: false, error: err });
        });
      return () => {
        active = false;
      };
    }, []);

    return state;
  }

  function normalizeRoute(hash, fallback) {
    if (!hash) return fallback;
    const value = String(hash).replace(/^#/, '').trim().toLowerCase();
    if (!value) return fallback;
    if (value === ROUTES.apresentacao || value === 'apresentação' || value === 'presentation') {
      return ROUTES.apresentacao;
    }
    if (value === ROUTES.publicacoes || value === 'publicações' || value === 'publicacoes') {
      return ROUTES.publicacoes;
    }
    return ROUTES.home;
  }

  function useHashRoute(defaultRoute) {
    const getRoute = useCallback(() => normalizeRoute(window.location.hash, defaultRoute), [defaultRoute]);
    const [route, setRoute] = useState(getRoute);

    useEffect(() => {
      const handler = () => setRoute(getRoute());
      window.addEventListener('hashchange', handler);
      return () => window.removeEventListener('hashchange', handler);
    }, [getRoute]);

    const navigate = useCallback(
      (next) => {
        const normalized = normalizeRoute(`#${next}`, defaultRoute);
        if (normalized === ROUTES.home) {
          if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        } else {
          window.location.hash = `#${normalized}`;
        }
        setRoute(normalized);
      },
      [defaultRoute]
    );

    return [route, navigate];
  }

  function BackButton({ onClick }) {
    return e(
      'button',
      {
        type: 'button',
        className: 'back-button subtle-button',
        onClick
      },
      e('span', { 'aria-hidden': 'true', className: 'back-icon' }, '←'),
      e('span', null, 'Voltar')
    );
  }

  function HomePage({ onNavigate }) {
    return e(
      'div',
      { className: 'page home-page fade-in' },
      e(
        'section',
        { className: 'hero hero-home gradient-surface' },
        e('div', { className: 'hero-content' }, [
 //         e('span', { key: 'badge', className: 'hero-badge' }, '40 anos da resposta brasileira ao HIV'),
          e(
            'h1',
            { key: 'title', className: 'hero-title text-gradient' },
            'Biblioteca da Aids'
          ),
          e(
            'p',
            { key: 'lead', className: 'hero-lead' },
            'Explore conteúdos curados com audiodescrição e materiais oficiais que celebram a trajetória brasileira na resposta ao HIV.'
          ),
          e(
            'div',
            { key: 'highlights', className: 'hero-highlights' },
            [
//              e('span', { key: 'chip1', className: 'highlight-chip' }, 'Audiodescrição inclusiva'),
//              e('span', { key: 'chip2', className: 'highlight-chip' }, 'Conteúdo confiável'),
//              e('span', { key: 'chip3', className: 'highlight-chip' }, 'Acesso sem barreiras')
            ]
          )
        ])
      ),
      e(
        'section',
        { className: 'home-grid-section' },
        e('div', { className: 'card-grid' }, [
          e(RouteCard, {
            key: 'apresentacao',
            title: 'Apresentação',
            description:
              'Conheça o contexto da biblioteca e sua importância na luta contra a AIDS',
            icon: '📖',
            gradientClass: 'gradient-primary',
            onActivate: () => onNavigate(ROUTES.apresentacao)
          }),
          e(RouteCard, {
            key: 'publicacoes',
            title: 'Publicações',
            description:
              'Acesse materiais técnicos e literários sobre HIV e aids',
            icon: '📚',
            gradientClass: 'gradient-primary',
            onActivate: () => onNavigate(ROUTES.publicacoes)
          })
        ])
      )
    );
  }

  function RouteCard({ title, description, icon, gradientClass, onActivate }) {
    const handleKey = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onActivate();
      }
    };
    return e(
      'article',
      {
        className: `route-card glass-card card-hover ${gradientClass}`,
        role: 'button',
        tabIndex: 0,
        onClick: onActivate,
        onKeyDown: handleKey
      },
      e('div', { className: 'route-card-icon', 'aria-hidden': 'true' }, icon),
      e('h2', { className: 'route-card-title' }, title),
      e('p', { className: 'route-card-description' }, description),
      e('span', { className: 'route-card-action' }, 'Acessar →')
    );
  }

 function PresentationPage({ onBack, audio }) {
  const { data, loading, error } = usePresentationData();
  const audioId = 'presentation:audiodescription';

  useEffect(() => () => { audio.stopIfMatches(audioId); }, [audio, audioId]);

  if (loading) {
    return e('div', { className: 'page presentation-page center-state' }, e(LoadingState, null));
  }

  if (error || !data) {
    return e(
      'div',
      { className: 'page presentation-page center-state' },
      e(BackButton, { onClick: onBack }),
      e(
        'div',
        { className: 'state-card glass-card' },
        e('h2', { className: 'state-title' }, 'Não foi possível carregar a apresentação'),
        e('p', { className: 'state-message' }, 'Verifique sua conexão e tente novamente em instantes.')
      )
    );
  }

  // ✅ Correct hero + audio source for Apresentação
  const heroImage = resolveAssetPath(data.heroImage) || resolveAssetPath('./assets/img/hero.png');
  const audioSrc = resolveAssetPath(
    (data.audioDescription && data.audioDescription.src) ? data.audioDescription.src : './assets/audio/presentation.mp3'
  );

  const isActive = audio.playingId === audioId;
  const isPlaying = isActive && audio.isPlaying;
  const buttonText = isActive
    ? (isPlaying ? 'Pausar audiodescrição' : 'Retomar audiodescrição')
    : 'Ouvir audiodescrição';

  return e(
    'div',
    { className: 'page presentation-page fade-in' },
    e(
      'header',
      { className: 'page-header glass-card' },
      e(BackButton, { onClick: onBack }),
      e('h1', { className: 'page-title text-gradient' }, 'Apresentação')
    ),
    e(
      'section',
      { className: 'presentation-hero glass-card' },
      e('img', {
        className: 'presentation-hero-image',
        src: heroImage,
        alt: data.heroAlt || 'Painel em homenagem à trajetória brasileira em HIV'
      }),
      e(
        'div',
        { className: 'presentation-body' },
        e('h2', { className: 'presentation-heading' }, data.title || 'Apresentação'),
        data.introHtml
          ? e('div', { className: 'presentation-copy', dangerouslySetInnerHTML: { __html: data.introHtml } })
          : e('p', { className: 'presentation-copy' }, data.intro || ''),
        e(
          'div',
          { className: 'presentation-actions' },
          e(
            'button',
            {
              type: 'button',
              className: `audio-button button-modern ${isActive ? 'audio-button-active' : ''}`,
              onClick: () => audio.togglePlayback(audioId, audioSrc),
              'aria-pressed': String(isPlaying),
              'aria-label': `${buttonText}: ${data.title || 'Apresentação'}`
            },
            e('span', { 'aria-hidden': 'true', className: 'audio-button-icon' }, isActive ? (isPlaying ? '⏸️' : '▶️') : '🎧'),
            e('span', { className: 'audio-button-text' }, buttonText)
          )
        )
      )
    ),
    data.disclaimerHtml
      ? e('section', { className: 'presentation-disclaimer glass-card', dangerouslySetInnerHTML: { __html: data.disclaimerHtml } })
      : null
  );
}

  function BooksPage({ onBack, audio }) {
    // Provide a stable teardown callback to useBooksData so it doesn't change
    // identity each render and retrigger the data load repeatedly.
    const teardownAudio = useCallback(() => {
      if (audio && typeof audio.stopPlayback === 'function') audio.stopPlayback();
    }, [audio]);

  const { books, loading, error, reload } = useBooksData(teardownAudio);
  const [selectedBook, setSelectedBook] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState('tudo');
    const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('sobre');

    const tags = useMemo(() => {
      const bag = new Set();
      books.forEach((book) => {
        book.tags.forEach((tag) => bag.add(tag));
      });
      return ['tudo', ...Array.from(bag)];
    }, [books]);

    const filtered = useMemo(() => {
      const query = search.toLowerCase().trim();
      return books.filter((book) => {
        if (selectedTag !== 'tudo' && !book.tags.includes(selectedTag)) {
          return false;
        }
        if (!query) return true;
        return book.searchText.includes(query);
      });
    }, [books, search, selectedTag]);

    useEffect(() => {
      if (!audio.playingId) return;
      const exists = filtered.some((book) => book.id === audio.playingId);
      if (!exists) {
        audio.stopPlayback();
      }
    }, [filtered, audio]);

    const isGrid = viewMode === 'grid';

    // If a book is selected, render the detail page for that book
    if (selectedBook) {
      const item = selectedBook;
      const isActive = audio.playingId === item.id;
      const isPlaying = isActive && audio.isPlaying;
      const renderTabButton = (key, label) =>
        e(
          'button',
          {
            key,
            type: 'button',
            className: `tab-pill px-4 py-2 rounded-full text-sm font-medium ${activeTab === key ? 'gradient-secondary text-white' : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700'}`,
            onClick: () => setActiveTab(key),
            'aria-pressed': String(activeTab === key)
          },
          label
        );

      const renderTabContent = () => {
        if (activeTab === 'sobre') {
          return item.synopsisHtml
            ? e('div', { dangerouslySetInnerHTML: { __html: item.synopsisHtml }, className: 'prose prose-invert text-gray-300' })
            : e('p', { className: 'text-gray-300' }, 'Sem conteúdo.');
        }
        if (activeTab === 'analise') {
          return item.analysisHtml
            ? e('div', { dangerouslySetInnerHTML: { __html: item.analysisHtml }, className: 'prose prose-invert text-gray-300' })
            : e('p', { className: 'text-gray-300' }, 'Sem conteúdo.');
        }
        if (activeTab === 'transcricao') {
          return item.transcriptHtml
            ? e('div', { dangerouslySetInnerHTML: { __html: item.transcriptHtml }, className: 'prose prose-invert text-gray-300' })
            : e('p', { className: 'text-gray-300' }, 'Sem conteúdo.');
        }
        if (activeTab === 'fontes') {
          return item.sources && item.sources.length
            ? e('ul', { className: 'list-disc list-inside space-y-1 text-blue-400' }, item.sources.map((s, i) => e('li', { key: i }, e('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', className: 'underline' }, s.label))))
            : e('p', { className: 'text-gray-300' }, 'Sem fontes.');
        }
        return null;
      };

      return e(
        'div',
        { className: 'page books-page fade-in' },
        e(
          'header',
          { className: 'page-header glass-card' },
          e(BackButton, { onClick: () => setSelectedBook(null) }),
          e('h1', { className: 'page-title text-gradient' }, item.title)
        ),
        e(
          'section',
          { className: 'max-w-4xl mx-auto px-6 py-8' },
          e('div', { className: 'glass-effect rounded-2xl p-8 mb-8' }, [
            item.cover
              ? e('img', { src: item.cover, alt: item.title, className: 'w-full h-64 object-cover rounded-xl mb-6' })
              : e('div', { className: 'w-full h-64 bg-gray-200 rounded-xl mb-6' }),
            e('h2', { className: 'text-2xl font-bold mb-2 text-white' }, item.title),
            e('p', { className: 'text-gray-400 mb-4' }, [item.author || 'Autor não informado', item.year ? ` – ${item.year}` : null].filter(Boolean).join(' ')),
            e('div', { className: 'flex flex-wrap gap-3 mb-6' }, [
              item.pdfUrl && e('a', { href: item.pdfUrl, target: '_blank', rel: 'noopener noreferrer', className: 'gradient-secondary text-white px-4 py-2 rounded-lg text-sm button-modern flex items-center gap-1' }, e('span', null, '📄'), e('span', null, 'Abrir PDF')),
              item.audioSrc && e('button', { onClick: () => audio.togglePlayback(item.id, item.audioSrc), className: 'gradient-accent text-white px-4 py-2 rounded-lg text-sm button-modern flex items-center gap-2' }, e('span', null, isActive ? (isPlaying ? '⏸️' : '▶️') : '🎵'), e('span', null, 'Audiodescrição'))
            ]),
            e('div', { className: 'tabs-row flex flex-wrap gap-4 mb-6 items-center' }, [
              renderTabButton('sobre', 'Sobre'),
              item.analysisHtml ? renderTabButton('analise', 'Análise') : null,
              item.transcriptHtml ? renderTabButton('transcricao', 'Transcrição') : null,
              item.sources && item.sources.length ? renderTabButton('fontes', 'Fontes') : null
            ]),
            e('div', { className: 'space-y-6' }, renderTabContent())
          ])
        )
      );
    }

    return e(
      'div',
      { className: 'page books-page fade-in' },
      e(
        'header',
        { className: 'page-header glass-card' },
        e(BackButton, { onClick: onBack }),
        e('h1', { className: 'page-title page-title-secondary' }, 'Biblioteca')
      ),
      e(
        'section',
        { className: 'books-toolbar glass-card' },
        e(
          'div',
          { className: 'filter-group', role: 'group', 'aria-label': 'Filtrar por tema' },
          tags.map((tag) =>
            e(
              'button',
              {
                key: tag,
                type: 'button',
                className: `filter-chip ${selectedTag === tag ? 'filter-chip-active' : ''}`,
                onClick: () => setSelectedTag(tag),
                'aria-pressed': String(selectedTag === tag)
              },
              tag === 'tudo' ? 'Tudo' : tag
            )
          )
        ),
        e(
          'div',
          { className: 'view-toggle', role: 'group', 'aria-label': 'Alternar visualização' },
          e(
            'button',
            {
              type: 'button',
              className: `view-toggle-button ${isGrid ? 'view-toggle-active' : ''}`,
              onClick: () => setViewMode('grid'),
              'aria-pressed': String(isGrid),
              'aria-label': 'Visualizar em grade'
            },
            e('span', { 'aria-hidden': 'true' }, '▦')
          ),
          e(
            'button',
            {
              type: 'button',
              className: `view-toggle-button ${!isGrid ? 'view-toggle-active' : ''}`,
              onClick: () => setViewMode('list'),
              'aria-pressed': String(!isGrid),
              'aria-label': 'Visualizar em lista'
            },
            e('span', { 'aria-hidden': 'true' }, '≣')
          )
        )
      ),
      loading
        ? e('section', { className: 'books-state center-state' }, e(LoadingState, null))
        : null,
      error
        ? e(
            'section',
            { className: 'books-state center-state' },
            e('div', { className: 'state-card glass-card' }, [
              e('h2', { key: 'title', className: 'state-title' }, 'Não foi possível carregar as publicações'),
              e(
                'p',
                { key: 'message', className: 'state-message' },
                'Verifique sua conexão e tente novamente.'
              ),
              e(
                'button',
                {
                  key: 'retry',
                  type: 'button',
                  className: 'button-modern gradient-secondary retry-button',
                  onClick: reload
                },
                'Tentar novamente'
              )
            ])
          )
        : null,
      !loading && !error && filtered.length === 0
        ? e(
            'section',
            { className: 'books-state center-state' },
            e('div', { className: 'state-card glass-card' }, [
              e('h2', { key: 'title', className: 'state-title' }, 'Nenhuma publicação encontrada'),
              e(
                'p',
                { key: 'message', className: 'state-message' },
                'Ajuste os filtros ou tente outra palavra-chave.'
              )
            ])
          )
        : null,
      !loading && !error && filtered.length
        ? e(
            'section',
            { className: `books-results ${isGrid ? 'books-grid' : 'books-list'}` },
                  filtered.map((book) =>
                    isGrid
                      ? e(BookCardGrid, { key: book.id, book, audio, onOpen: () => setSelectedBook(book) })
                      : e(BookCardList, { key: book.id, book, audio, onOpen: () => setSelectedBook(book) })
                  )
          )
        : null
    );
  }

  function BookCardGrid({ book, audio, onOpen }) {
    const handleKey = (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        if (typeof onOpen === 'function') onOpen();
      }
    };
    return e(
      'article',
      { className: 'book-card glass-card card-hover', role: 'button', tabIndex: 0, onClick: onOpen, onKeyDown: handleKey },
      book.cover
        ? e('img', {
            className: 'book-cover',
            src: book.cover,
            alt: `Capa de ${book.title}`
          })
        : e('div', { className: 'book-cover book-cover-placeholder', 'aria-hidden': 'true' }, '📘'),
      e('div', { className: 'book-body' }, [
        e('h3', { key: 'title', className: 'book-title' }, book.title),
        e(
          'p',
          { key: 'meta', className: 'book-meta' },
          [book.author || 'Autor não informado', book.year ? `— ${book.year}` : null]
            .filter(Boolean)
            .join(' ')
        ),
        book.synopsisHtml
          ? e('div', {
              key: 'synopsis',
              className: 'book-synopsis',
              dangerouslySetInnerHTML: { __html: book.synopsisHtml }
            })
          : null,
        e(
          'div',
          { key: 'tags', className: 'book-tags' },
          book.tags.map((tag) => e('span', { key: tag, className: 'tag-chip' }, tag))
        ),
        e(BookActions, { key: 'actions', book, audio })
      ])
    );
  }

  function BookCardList({ book, audio, onOpen }) {
    const handleKey = (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        if (typeof onOpen === 'function') onOpen();
      }
    };
    return e(
      'article',
      { className: 'book-card-list glass-card card-hover', role: 'button', tabIndex: 0, onClick: onOpen, onKeyDown: handleKey },
      book.cover
        ? e('img', {
            className: 'book-cover-list',
            src: book.cover,
            alt: `Capa de ${book.title}`
          })
        : e('div', { className: 'book-cover-list book-cover-placeholder', 'aria-hidden': 'true' }, '📘'),
      e('div', { className: 'book-list-body' }, [
        e('div', { key: 'header', className: 'book-list-header' }, [
          e('h3', { key: 'title', className: 'book-title' }, book.title),
          e(
            'p',
            { key: 'meta', className: 'book-meta' },
            [book.author || 'Autor não informado', book.year ? `— ${book.year}` : null]
              .filter(Boolean)
              .join(' ')
          )
        ]),
        book.synopsisHtml
          ? e('div', {
              key: 'synopsis',
              className: 'book-synopsis',
              dangerouslySetInnerHTML: { __html: book.synopsisHtml }
            })
          : null,
        e(
          'div',
          { key: 'tags', className: 'book-tags' },
          book.tags.map((tag) => e('span', { key: tag, className: 'tag-chip' }, tag))
        ),
        e(BookActions, { key: 'actions', book, audio })
      ])
    );
  }

  function BookActions({ book, audio }) {
    const chips = [];
    if (book.pdfUrl) {
      chips.push(
        e(
          'a',
          {
            key: 'pdf',
            href: book.pdfUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'book-chip book-chip-pdf',
            'aria-label': `Abrir PDF de ${book.title} em nova aba`,
            onClick: (ev) => ev.stopPropagation()
          },
          [
            e('span', { key: 'icon', className: 'chip-icon', 'aria-hidden': 'true' }, '📄'),
            e('span', { key: 'label', className: 'chip-label' }, 'PDF')
          ]
        )
      );
    }

    const isActive = audio.playingId === book.id;
    const isPlaying = isActive && audio.isPlaying;

    chips.push(
      e(
        'button',
        {
          key: 'audio',
          type: 'button',
          className: `book-chip book-chip-audio ${isActive ? 'book-chip-active' : ''}`,
          onClick: (ev) => { ev.stopPropagation(); audio.togglePlayback(book.id, book.audioSrc); },
          'aria-pressed': String(isActive && isPlaying),
          'aria-label': `${isActive ? (isPlaying ? 'Pausar' : 'Retomar') : 'Ouvir'} audiodescrição: ${book.title}`
        },
        [
          e('span', { key: 'icon', className: 'chip-icon', 'aria-hidden': 'true' }, isActive ? (isPlaying ? '⏸️' : '▶️') : '🎵'),
          e('span', { key: 'label', className: 'chip-label' }, 'Áudio')
        ]
      )
    );

    if (book.durationLabel) {
    }

    return e('div', { className: 'book-actions' }, chips);
  }

  function LoadingState() {
    const lastTried = fetchBooksData && fetchBooksData._lastTried ? fetchBooksData._lastTried : null;
    return e(
      'div',
      { className: 'loading-state' },
      e('div', { className: 'spinner' }),
      e('p', { className: 'loading-copy' }, 'Carregando conteúdo...'),
      lastTried
        ? e('div', { style: { marginTop: '12px', fontSize: '12px', color: '#9aa' } }, `Tentando: ${lastTried}`)
        : null
    );
  }

  function App() {
    const [route, navigate] = useHashRoute(ROUTES.home);
    const audio = useHowlerAudio();

    useEffect(() => {
      audio.stopPlayback();
    }, [route, audio]);

    const goHome = useCallback(() => navigate(ROUTES.home), [navigate]);
    const goApresentacao = useCallback(() => navigate(ROUTES.apresentacao), [navigate]);
    const goPublicacoes = useCallback(() => navigate(ROUTES.publicacoes), [navigate]);

    let content = null;
    if (route === ROUTES.apresentacao) {
      content = e(PresentationPage, { onBack: goHome, audio });
    } else if (route === ROUTES.publicacoes) {
      content = e(BooksPage, { onBack: goHome, audio });
    } else {
      content = e(HomePage, {
        onNavigate: (next) => {
          if (next === ROUTES.apresentacao) goApresentacao();
          else if (next === ROUTES.publicacoes) goPublicacoes();
          else goHome();
        }
      });
    }

    return e('div', { className: 'app-shell' }, content);
  }

  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(e(App));
  }
})();
