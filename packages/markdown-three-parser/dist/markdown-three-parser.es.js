import K from "katex";
function h(l = "") {
  return l.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function D(l = "") {
  const p = {};
  let e = 0;
  return l = l.replace(/<[^>]+>/g, (u) => {
    const m = `@@HTML${e}@@`;
    return p[m] = u, e++, m;
  }), { text: l, map: p };
}
function E(l = "", p = {}) {
  return l.replace(/@@HTML(\d+)@@/g, (e, u) => p[`@@HTML${u}@@`] || "");
}
function R(l = "") {
  const p = {};
  let e = 0;
  return l = l.replace(/`([^`\n]+)`/g, (u, m) => {
    const n = `@@CODE${e}@@`;
    return p[n] = m, e++, n;
  }), { text: l, map: p };
}
function W(l = "", p = {}) {
  return l.replace(
    /@@CODE(\d+)@@/g,
    (e, u) => `<code>${h(p[`@@CODE${u}@@`] || "")}</code>`
  );
}
function P(l = "") {
  const p = [], e = /(\w+)=(".*?"|'.*?'|[^\s"']+)/g;
  let u;
  for (; (u = e.exec(l)) !== null; ) {
    const m = u[1];
    let n = u[2];
    (n.startsWith('"') && n.endsWith('"') || n.startsWith("'") && n.endsWith("'")) && (n = n.slice(1, -1)), p.push(`${m}="${h(n)}"`);
  }
  return p.join(" ");
}
function O(l, p = !1) {
  try {
    return K.renderToString(l, { throwOnError: !1, displayMode: p });
  } catch {
    return `<code class="katex-error">${h(l)}</code>`;
  }
}
function X(l = "") {
  const p = l.split(`
`), e = [];
  let u = !1, m = "";
  const n = [];
  let C = [], d = !1, M = [];
  const v = {}, L = {};
  let j = !1, _ = [], x = 0;
  const T = () => {
    if (C.length > 0) {
      let s = C.join(`
`), { text: o, map: t } = D(s), { text: a, map: i } = R(o), r = h(a);
      r = r.replace(/\[\^(.+?)\]\((.+?)\)/g, (b, c, k) => {
        const $ = c.trim() || `inline-footnote-${Object.keys(L).length + 1}`;
        return L[$] = h(k), `<sup id="ref-${$}"><a href="#footnote-${$}">${$}</a></sup>`;
      }), r = r.replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (b, c, k, $) => {
        const g = $ ? " " + P($) : "";
        return `<img alt="${h(c)}" src="${h(k)}"${g} />`;
      }).replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (b, c, k) => `<a href="${h(k)}" target="_blank">${h(c)}</a>`).replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/~~(.+?)~~/g, "<del>$1</del>").replace(/\[\^(.+?)\]/g, (b, c) => `<sup id="ref-${c}"><a href="#footnote-${c}">${c}</a></sup>`), r = r.replace(
        new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
        (b, c) => O(c, !1)
      ), r = r.replace(/\n/g, "<br />"), r = W(r, i), r = E(r, t), e.push(`<p>${r}</p>`), C = [];
    }
  }, y = () => {
    for (; n.length > 0; ) {
      const { tag: s } = n.pop();
      e.push(`</${s}>`);
    }
  }, F = (s) => {
    const o = s.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
    if (!o) return !1;
    const t = o[1].length, a = o[2], i = o[3], r = Math.floor(t / 4), c = /^\d+\./.test(a) ? "ol" : "ul";
    for (; n.length > r + 1; ) {
      const { tag: f } = n.pop();
      e.push(`</${f}>`);
    }
    if (n.length === 0 || r >= n.length) {
      if (n.length > 0 && n[n.length - 1].tag !== c) {
        const { tag: f } = n.pop();
        e.push(`</${f}>`);
      }
      n.push({ tag: c, indent: t }), e.push(`<${c}>`);
    } else if (n.length > 0 && n[n.length - 1].tag !== c) {
      const { tag: f } = n.pop();
      e.push(`</${f}>`), n.push({ tag: c, indent: t }), e.push(`<${c}>`);
    }
    const { text: k, map: $ } = D(i), { text: g, map: B } = R(k), H = g.match(/^\[( |x|X)\]\s+(.*)/);
    if (H) {
      const f = H[1].toLowerCase() === "x", A = E(W(h(H[2]), B), $);
      e.push(`<li><input type="checkbox" ${f ? "checked" : ""} disabled> ${A}</li>`);
    } else {
      let f = h(g);
      f = f.replace(
        new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
        (A, I) => O(I, !1)
      ), f = W(f, B), f = E(f, $), e.push(`<li>${f}</li>`);
    }
    return !0;
  }, w = () => {
    if (M.length === 0) return;
    const s = M[0].split("|").map((t) => t.trim()).filter((t) => t !== ""), o = [];
    if (M.length > 1) {
      const t = M[1].split("|").map((a) => a.trim()).filter((a) => a !== "");
      for (const a of t)
        /^:-+:$/.test(a) ? o.push("center") : /^-+:$/.test(a) ? o.push("right") : /^:-+$/.test(a) ? o.push("left") : o.push("");
    }
    e.push("<table>"), e.push("<thead><tr>");
    for (let t = 0; t < s.length; t++) {
      const a = o[t] ? ` style="text-align:${o[t]}"` : "";
      e.push(`<th${a}>${h(s[t])}</th>`);
    }
    e.push("</tr></thead><tbody>");
    for (let t = 2; t < M.length; t++) {
      const a = M[t].split("|").map((i) => i.trim()).filter((i) => i !== "");
      e.push("<tr>");
      for (let i = 0; i < s.length; i++) {
        const r = o[i] ? ` style="text-align:${o[i]}"` : "";
        e.push(`<td${r}>${h(a[i] || "")}</td>`);
      }
      e.push("</tr>");
    }
    e.push("</tbody></table>"), M = [];
  };
  for (let s = 0; s < p.length; s++) {
    let o = p[s];
    const t = o.trim();
    if (/^```/.test(t)) {
      u ? (e.push("</code></pre>"), u = !1, m = "") : (T(), y(), d && (w(), d = !1), u = !0, m = t.slice(3).trim(), e.push(`<pre><code class="language-${h(m)}">`)), x = 0;
      continue;
    }
    if (u) {
      e.push(h(o)), x = 0;
      continue;
    }
    if (t === "$$") {
      T(), y(), j ? (e.push(O(_.join(`
`), !0)), j = !1, _ = []) : (j = !0, _ = [], C = []), x = 0;
      continue;
    }
    if (j) {
      _.push(o), x = 0;
      continue;
    }
    if (t === "") {
      x++, T(), y(), d && (w(), d = !1);
      continue;
    } else if (x > 0) {
      for (let i = 1; i < x; i++) e.push("<br />");
      x = 0;
    }
    if (t.includes("|")) {
      T(), y(), d || (d = !0, M = []), M.push(t);
      continue;
    } else d && (w(), d = !1);
    const a = t.match(/^(#{1,5})\s+(.*)/);
    if (a) {
      T(), y(), d && (w(), d = !1);
      const i = a[1].length;
      let r = a[2], { text: b, map: c } = D(r), { text: k, map: $ } = R(b), g = h(k);
      g = g.replace(
        new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
        (B, H) => O(H, !1)
      ), g = W(g, $), g = E(g, c), e.push(`<h${i}>${g}</h${i}>`);
      continue;
    }
    if (/^(\s*)([-*]|\d+\.)\s+/.test(o)) {
      T(), F(o);
      continue;
    }
    C.push(o);
  }
  if (T(), y(), d && w(), j && e.push(O(_.join(`
`), !0)), x > 0)
    for (let s = 1; s < x; s++) e.push("<br />");
  if (Object.keys(v).length > 0 || Object.keys(L).length > 0) {
    e.push('<hr /><section class="footnotes"><ol>');
    for (const s in v)
      e.push(`<li id="footnote-${s}">${v[s]} <a href="#ref-${s}">↩</a></li>`);
    for (const s in L)
      e.push(`<li id="footnote-${s}">${L[s]} <a href="#ref-${s}">↩</a></li>`);
    e.push("</ol></section>");
  }
  return e.join(`
`);
}
export {
  X as default
};
