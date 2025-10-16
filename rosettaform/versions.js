(async () => {
  const iframes = Array.from(document.querySelectorAll('iframe'));
  const stripComments = html => html.replace(/<!--[\s\S]*?-->/g, '');
  const getText = async url => {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
  };
  const extractVersionFromUrl = (src) => {
    // cdnjs: .../p5.js/1.9.3/p5.min.js
    let m = src.match(/p5(?:\.js)?\/(\d+\.\d+(?:\.\d+)?)/);
    if (m) return m[1];
    // unpkg: .../p5@1.9.2/dist/p5.min.js
    m = src.match(/p5@(\d+\.\d+(?:\.\d+)?)/);
    if (m) return m[1];
    return null;
  };
  const extractScriptSrcs = (html, base) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return Array.from(doc.querySelectorAll('script[src]'))
      .map(s => new URL(s.getAttribute('src'), base).href);
  };

  const results = [];
  for (const f of iframes) {
    const src = new URL(f.getAttribute('src'), location.href).href;
    const name = src.replace(/\/+$/,'').split('/').filter(Boolean).pop();
    try {
      // resolve .../index.html
      const base = new URL(src, location.href);
      if (!base.pathname.endsWith('/')) base.pathname += '/';
      const indexUrl = new URL('index.html', base).href;

      const indexHtml = stripComments(await getText(indexUrl));
      const scripts = extractScriptSrcs(indexHtml, indexUrl);
      const p5Url = scripts.find(s => /\/p5(\.min)?\.js(\?|$)/i.test(s)) || null;

      let version = p5Url ? extractVersionFromUrl(p5Url) : null;

      // If we still don't have a version (local file, etc.), peek into the p5 file header
      if (!version && p5Url) {
        try {
          const p5Text = await getText(p5Url);
          const header = p5Text.slice(0, 1500);
          const m = header.match(/p5(?:\.js)?\s*v?(\d+\.\d+(?:\.\d+)?)/i)
                   || header.match(/Version:\s*([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i);
          if (m) version = m[1];
        } catch {}
      }

      results.push({ frame: name, index: indexUrl, p5Url, version });
    } catch (e) {
      results.push({ frame: name, index: '(fetch failed)', p5Url: null, version: null, error: String(e) });
    }
  }

  const md = [
    '| iframe | index.html | p5.js URL | p5.js version |',
    '|---|---|---|---|',
    ...results.map(r => `| ${r.frame} | ${r.index} | ${r.p5Url ?? '—'} | ${r.version ?? '—'} |`)
  ].join('\n');

  console.log(md);
  try { await navigator.clipboard.writeText(md); console.log('✅ Markdown table copied to clipboard'); } catch {}
})();
