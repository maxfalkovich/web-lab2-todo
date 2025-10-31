export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === 'className') node.className = String(v);
    else if (k === 'dataset' && typeof v === 'object') {
      for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = String(dv);
    } else if (k === 'text') {
      node.textContent = String(v);
    } else if (k === 'style' && typeof v === 'object') {
      Object.assign(node.style, v);
    } else if (k === 'for') {
      node.htmlFor = String(v);
    } else if (k.startsWith('aria-')) {
      node.setAttribute(k, String(v));
    } else if (k in node) {
      try { node[k] = v; } catch { node.setAttribute(k, String(v)); }
    } else {
      node.setAttribute(k, String(v));
    }
  }

  const kids = Array.isArray(children) ? children : [children];
  for (const ch of kids) {
    if (ch == null) continue;
    if (typeof ch === 'string' || typeof ch === 'number') {
      node.appendChild(document.createTextNode(String(ch)));
    } else {
      node.appendChild(ch);
    }
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function uuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 't_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Даты
export function isoToRu(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${dd}.${mm}.${y}`;
}

export function ruToIso(ru) {
  if (!ru) return null;
  const parts = ru.split('.');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts.map(p => p.trim());
    if (dd && mm && yyyy) return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(ru)) return ru;
  return null;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
