import F from "katex";
function p(o = "") {
  return o.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function v(o = "") {
  const t = {};
  let e = 0;
  return o = o.replace(/<[^>]+>/g, (r) => {
    const s = `@@HTML${e}@@`;
    return t[s] = r, e++, s;
  }), { text: o, map: t };
}
function E(o = "", t = {}) {
  return o.replace(/@@HTML(\d+)@@/g, (e, r) => t[`@@HTML${r}@@`] || "");
}
function A(o = "") {
  const t = {};
  let e = 0;
  return o = o.replace(/`([^`\n]+)`/g, (r, s) => {
    const n = `@@CODE${e}@@`;
    return t[n] = s, e++, n;
  }), { text: o, map: t };
}
function D(o = "", t = {}) {
  return o.replace(/@@CODE(\d+)@@/g, (e, r) => `<code>${p(t[`@@CODE${r}@@`] || "")}</code>`);
}
function P(o = "") {
  const t = [], e = /(\w+)=(".*?"|'.*?'|[^\s"']+)/g;
  let r;
  for (; (r = e.exec(o)) !== null; ) {
    const s = r[1];
    let n = r[2];
    (n.startsWith('"') && n.endsWith('"') || n.startsWith("'") && n.endsWith("'")) && (n = n.slice(1, -1)), t.push(`${s}="${p(n)}"`);
  }
  return t.join(" ");
}
function W(o, t = !1) {
  try {
    return F.renderToString(o, { throwOnError: !1, displayMode: t });
  } catch {
    return `<code class="katex-error">${p(o)}</code>`;
  }
}
function I(o, t, e) {
  const r = o.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
  if (!r) return !1;
  const s = r[1].length, n = r[2], h = r[3], c = Math.floor(s / 2), u = /^\d+\./.test(n) ? "ol" : "ul";
  for (; t.length > c + 1; ) {
    const { tag: d } = t.pop();
    e.push(`</${d}>`);
  }
  if (t.length === 0 || c >= t.length) {
    if (t.length > 0 && t[t.length - 1].tag !== u) {
      const { tag: d } = t.pop();
      e.push(`</${d}>`);
    }
    t.push({ tag: u, indent: s }), e.push(`<${u}>`);
  }
  if (t.length > 0 && t[t.length - 1].tag !== u) {
    const { tag: d } = t.pop();
    e.push(`</${d}>`), t.push({ tag: u, indent: s }), e.push(`<${u}>`);
  }
  const { text: H, map: x } = v(h), { text: M, map: g } = A(H), b = M.match(/^\[( |x|X)\]\s+(.*)/);
  if (b) {
    const d = b[1].toLowerCase() === "x", a = E(D(p(b[2]), g), x);
    e.push(`<li><input type="checkbox" ${d ? "checked" : ""} disabled> ${a}</li>`);
  } else
    e.push(`<li>${E(D(p(M), g), x)}</li>`);
  return !0;
}
function O(o, t) {
  for (; o.length > 0; ) {
    const { tag: e } = o.pop();
    t.push(`</${e}>`);
  }
}
function K(o) {
  const { text: t, map: e } = v(o), { text: r, map: s } = A(t);
  let n = p(r);
  return n = n.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/~~(.+?)~~/g, "<del>$1</del>"), n = D(n, s), n = E(n, e), n;
}
function k(o, t) {
  if (o.length < 2) {
    o.length = 0;
    return;
  }
  const e = o[0].split("|").map((n) => n.trim()), s = o[1].split("|").map((n) => n.trim()).map((n) => /^:-+:$/.test(n) ? "center" : /^-+:$/.test(n) ? "right" : /^:-+$/.test(n) ? "left" : null);
  t.push("<table><thead><tr>"), e.forEach((n, h) => {
    const c = s[h] ? ` style="text-align:${s[h]}"` : "";
    t.push(`<th${c}>${K(n)}</th>`);
  }), t.push("</tr></thead><tbody>");
  for (let n = 2; n < o.length; n++) {
    const h = o[n].split("|").map((c) => c.trim());
    t.push("<tr>"), h.forEach((c, f) => {
      const u = s[f] ? ` style="text-align:${s[f]}"` : "";
      t.push(`<td${u}>${K(c)}</td>`);
    }), t.push("</tr>");
  }
  t.push("</tbody></table>"), o.length = 0;
}
function z(o = "") {
  const t = o.split(`
`), e = [];
  let r = !1, s = "";
  const n = [];
  let h = [], c = !1, f = [];
  const u = {}, H = {};
  let x = !1, M = [];
  const g = () => {
    if (h.length > 0) {
      let a = h.join("<br />"), { text: y, map: $ } = v(a), { text: _, map: j } = A(y), l = p(_);
      l = l.replace(/\[\^(.+?)\]\((.+?)\)/g, (T, i, C) => {
        const m = i.trim() || `inline-footnote-${Object.keys(H).length + 1}`;
        return H[m] = p(C), `<sup id="ref-${m}"><a href="#footnote-${m}">${m}</a></sup>`;
      }), l = l.replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (T, i, C, m) => {
        const B = m ? " " + P(m) : "";
        return `<img alt="${p(i)}" src="${p(C)}"${B} />`;
      }).replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (T, i, C) => `<a href="${p(C)}" target="_blank">${p(i)}</a>`).replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/~~(.+?)~~/g, "<del>$1</del>").replace(/\[\^(.+?)\]/g, (T, i) => `<sup id="ref-${i}"><a href="#footnote-${i}">${i}</a></sup>`), l = l.replace(new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"), (T, i) => W(i, !1)), l = D(l, j), l = E(l, $), e.push(`<p>${l}</p>`), h = [];
    }
  };
  for (let a = 0; a < t.length; a++) {
    let y = t[a];
    const $ = y.trim();
    if (/^```/.test($)) {
      r ? (e.push("</code></pre>"), r = !1, s = "") : (g(), O(n, e), c && (k(f, e), c = !1), r = !0, s = $.slice(3).trim(), e.push(`<pre><code class="language-${p(s)}">`));
      continue;
    }
    if (r) {
      e.push(p(y));
      continue;
    }
    if ($ === "$$") {
      if (g(), O(n, e), x) {
        const l = M.join(`
`);
        e.push(W(l, !0)), x = !1, M = [];
      } else
        x = !0, M = [];
      continue;
    }
    if (x) {
      M.push(y);
      continue;
    }
    if ($ === "") {
      g(), O(n, e), c && (k(f, e), c = !1), e.push("<br />");
      continue;
    }
    const _ = $.match(/^\[\^(.+?)\]:\s*(.*)/);
    if (_) {
      const l = _[1].trim(), T = _[2];
      u[l] = T;
      continue;
    }
    if ($.includes("|")) {
      g(), O(n, e), c || (c = !0, f = []), f.push($);
      continue;
    } else c && (k(f, e), c = !1);
    const j = $.match(/^(#{1,5})\s+(.*)/);
    if (j) {
      g(), O(n, e), c && (k(f, e), c = !1);
      const l = j[1].length;
      let T = j[2], { text: i, map: C } = v(T), { text: m, map: B } = A(i), L = p(m);
      L = L.replace(new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"), (X, w) => W(w, !1)), L = D(L, B), L = E(L, C), e.push(`<h${l}>${L}</h${l}>`);
      continue;
    }
    if (I(y, n, e)) {
      g();
      continue;
    }
    h.push(y);
  }
  g(), O(n, e), c && k(f, e), x && e.push(W(M.join(`
`), !0));
  const b = Object.keys(u), d = Object.keys(H);
  if (b.length > 0 || d.length > 0) {
    e.push('<hr><section class="footnotes"><ol>');
    for (const a of b)
      e.push(`<li id="footnote-${a}">${u[a]}</li>`);
    for (const a of d)
      e.push(`<li id="footnote-${a}">${H[a]}</li>`);
    e.push("</ol></section>");
  }
  return e.join(`
`);
}
export {
  z as default
};
