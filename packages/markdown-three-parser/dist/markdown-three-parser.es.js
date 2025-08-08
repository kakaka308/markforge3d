import B from "katex";
function a(r = "") {
  return r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function O(r = "") {
  const e = {};
  let n = 0;
  return r = r.replace(/<[^>]+>/g, (o) => {
    const s = `@@HTML${n}@@`;
    return e[s] = o, n++, s;
  }), { text: r, map: e };
}
function H(r = "", e = {}) {
  return r.replace(/@@HTML(\d+)@@/g, (n, o) => e[`@@HTML${o}@@`] || "");
}
function E(r = "") {
  const e = {};
  let n = 0;
  return r = r.replace(/`([^`\n]+)`/g, (o, s) => {
    const t = `@@CODE${n}@@`;
    return e[t] = s, n++, t;
  }), { text: r, map: e };
}
function _(r = "", e = {}) {
  return r.replace(/@@CODE(\d+)@@/g, (n, o) => `<code>${a(e[`@@CODE${o}@@`] || "")}</code>`);
}
function D(r = "") {
  const e = [], n = /(\w+)=(".*?"|'.*?'|[^\s"']+)/g;
  let o;
  for (; (o = n.exec(r)) !== null; ) {
    const s = o[1];
    let t = o[2];
    (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) && (t = t.slice(1, -1)), e.push(`${s}="${a(t)}"`);
  }
  return e.join(" ");
}
function j(r, e = !1) {
  try {
    return B.renderToString(r, { throwOnError: !1, displayMode: e });
  } catch {
    return `<code class="katex-error">${a(r)}</code>`;
  }
}
function k(r, e, n) {
  const o = r.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
  if (!o) return !1;
  const s = o[1].length, t = o[2], h = o[3], c = Math.floor(s / 2), i = /^\d+\./.test(t) ? "ol" : "ul";
  for (; e.length > c + 1; ) {
    const { tag: l } = e.pop();
    n.push(`</${l}>`);
  }
  if (e.length === 0 || c >= e.length) {
    if (e.length > 0 && e[e.length - 1].tag !== i) {
      const { tag: l } = e.pop();
      n.push(`</${l}>`);
    }
    e.push({ tag: i, indent: s }), n.push(`<${i}>`);
  }
  if (e.length > 0 && e[e.length - 1].tag !== i) {
    const { tag: l } = e.pop();
    n.push(`</${l}>`), e.push({ tag: i, indent: s }), n.push(`<${i}>`);
  }
  const { text: M, map: T } = O(h), { text: $, map: m } = E(M), g = $.match(/^\[( |x|X)\]\s+(.*)/);
  if (g) {
    const l = g[1].toLowerCase() === "x", u = H(_(a(g[2]), m), T);
    n.push(`<li><input type="checkbox" ${l ? "checked" : ""} disabled> ${u}</li>`);
  } else
    n.push(`<li>${H(_(a($), m), T)}</li>`);
  return !0;
}
function w(r) {
  const { text: e, map: n } = O(r), { text: o, map: s } = E(e);
  let t = a(o);
  return t = t.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/~~(.+?)~~/g, "<del>$1</del>"), t = _(t, s), t = H(t, n), t;
}
function C(r, e) {
  if (r.length < 2) return;
  const n = r[0].split("|").map((t) => t.trim()), s = r[1].split("|").map((t) => t.trim()).map((t) => /^:-+:$/.test(t) ? "center" : /^-+:$/.test(t) ? "right" : /^:-+$/.test(t) ? "left" : null);
  e.push("<table><thead><tr>"), n.forEach((t, h) => {
    const c = s[h] ? ` style="text-align:${s[h]}"` : "";
    e.push(`<th${c}>${w(t)}</th>`);
  }), e.push("</tr></thead><tbody>");
  for (let t = 2; t < r.length; t++) {
    const h = r[t].split("|").map((c) => c.trim());
    e.push("<tr>"), h.forEach((c, p) => {
      const i = s[p] ? ` style="text-align:${s[p]}"` : "";
      e.push(`<td${i}>${w(c)}</td>`);
    }), e.push("</tr>");
  }
  e.push("</tbody></table>");
}
function P(r = "") {
  const e = r.split(`
`), n = [];
  let o = !1, s = "";
  const t = [];
  let h = [], c = !1, p = [], i = !1, M = [];
  const T = {}, $ = () => {
    if (h.length > 0) {
      let g = h.join(" "), { text: l, map: u } = O(g), { text: b, map: W } = E(l), f = a(b);
      f = f.replace(/\[\^(.+?)\]\((.+?)\)/g, (y, d, L) => {
        const x = d.trim() || `inline-footnote-${Object.keys(T).length + 1}`;
        return T[x] = a(L), `<sup id="ref-${x}"><a href="#footnote-${x}">${x}</a></sup>`;
      }), f = f.replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (y, d, L, x) => {
        const A = x ? " " + D(x) : "";
        return `<img alt="${a(d)}" src="${a(L)}"${A} />`;
      }).replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (y, d, L) => `<a href="${a(L)}" target="_blank">${a(d)}</a>`).replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/~~(.+?)~~/g, "<del>$1</del>").replace(/\[\^(.+?)\]/g, (y, d) => `<sup id="ref-${d}"><a href="#footnote-${d}">${d}</a></sup>`), f = f.replace(new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"), (y, d) => j(d, !1)), f = _(f, W), f = H(f, u), n.push(`<p>${f}</p>`), h = [];
    }
  }, m = () => {
    for (; t.length > 0; ) {
      const { tag: g } = t.pop();
      n.push(`</${g}>`);
    }
  };
  for (let g = 0; g < e.length; g++) {
    let l = e[g];
    const u = l.trim();
    if (/^```/.test(u)) {
      o ? (n.push("</code></pre>"), o = !1, s = "") : ($(), m(), c && (C(p, n), c = !1, p = []), o = !0, s = u.slice(3).trim(), n.push(`<pre><code class="language-${a(s)}">`));
      continue;
    }
    if (o) {
      n.push(a(l));
      continue;
    }
    if (u === "$$") {
      if (i) {
        const b = M.join(`
`);
        n.push(j(b, !0)), M = [], i = !1;
      } else
        $(), m(), i = !0;
      continue;
    }
    if (i) {
      M.push(l);
      continue;
    }
    if (k(l, t, n)) {
      $(), c && (C(p, n), c = !1, p = []);
      continue;
    }
    if (/^\|.*\|$/.test(u)) {
      c || ($(), m(), c = !0), p.push(u);
      continue;
    }
    if (c)
      if (/^\|.*\|$/.test(u)) {
        p.push(u);
        continue;
      } else
        C(p, n), c = !1, p = [];
    if (u === "") {
      $(), m();
      continue;
    }
    h.push(l);
  }
  return $(), m(), c && C(p, n), n.join(`
`);
}
export {
  P as default
};
