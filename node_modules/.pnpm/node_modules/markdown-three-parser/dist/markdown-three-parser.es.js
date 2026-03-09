import j from "katex";
import b from "prismjs";
function g(t = "") {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function A(t = "") {
  const n = {};
  let e = 0;
  return t = t.replace(/<[^>]+>/g, (r) => {
    const a = `@@HTML${e}@@`;
    return n[a] = r, e++, a;
  }), { text: t, map: n };
}
function _(t = "", n = {}) {
  return t.replace(/@@HTML(\d+)@@/g, (e, r) => n[`@@HTML${r}@@`] || "");
}
function v(t = "") {
  const n = {};
  let e = 0;
  return t = t.replace(/`([^`\n]+)`/g, (r, a) => {
    const i = `@@CODE${e}@@`;
    return n[i] = a, e++, i;
  }), { text: t, map: n };
}
function P(t = "", n = {}) {
  return t.replace(
    /@@CODE(\d+)@@/g,
    (e, r) => `<code class="language-plaintext">${g(n[`@@CODE${r}@@`] || "")}</code>`
  );
}
function F(t, n = !1) {
  try {
    return j.renderToString(t, {
      throwOnError: !1,
      displayMode: n,
      output: "html"
    });
  } catch {
    return `<code class="katex-error">${g(t)}</code>`;
  }
}
function T(t = "") {
  const n = [], e = /(\w+)=(".*?"|'.*?'|[^\s"']+)/g;
  let r;
  for (; (r = e.exec(t)) !== null; ) {
    const a = r[1];
    let i = r[2];
    (i.startsWith('"') && i.endsWith('"') || i.startsWith("'") && i.endsWith("'")) && (i = i.slice(1, -1)), n.push(`${a}="${g(i)}"`);
  }
  return n.join(" ");
}
function y(t, n) {
  let { text: e, map: r } = v(t), { text: a, map: i } = A(e), s = g(a);
  return s = s.replace(
    new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
    (o, l) => F(l.trim(), !1)
  ), s = s.replace(/\[\^(.+?)\]\((.+?)\)/g, (o, l, d) => {
    const u = l.trim() || `inline-${Object.keys(n).length + 1}`;
    return n[u] = g(d), `<sup id="ref-${u}"><a href="#footnote-${u}">${u}</a></sup>`;
  }), s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (o, l, d, u) => {
    const h = u ? " " + T(u) : "";
    return `<img alt="${g(l)}" src="${g(d)}"${h} />`;
  }), s = s.replace(
    /\[([^\]]+?)\]\(([^)]+)\)\{embed\}/g,
    (o, l, d) => `<iframe src="${g(d)}" title="${g(l)}" width="100%" height="400px" style="border:none;"></iframe>`
  ), s = s.replace(
    /\[([^\]]+?)\]\(([^)]+)\)/g,
    (o, l, d) => `<a href="${g(d)}" target="_blank" rel="noopener noreferrer" data-link-text="${g(l)}" data-url="${g(d)}">${g(l)}</a> <button class="embed-toggle-btn">内嵌</button>`
  ), s = s.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>"), s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"), s = s.replace(/\*(.+?)\*/g, "<em>$1</em>"), s = s.replace(/~~([^~\n]+?)~~/g, "<del>$1</del>"), s = s.replace(
    /\[\^(.+?)\]/g,
    (o, l) => `<sup id="ref-${l}"><a href="#footnote-${l}">${l}</a></sup>`
  ), s = P(s, r), s = _(s, i), s;
}
function m(t, n, e) {
  if (t.length === 0) return;
  const r = t[0].lineNo ?? 0, a = t.map((s) => typeof s == "string" ? s : s.text).join(`
`);
  let i = y(a, e);
  i = i.replace(/\n/g, "<br />"), n.push(`<p data-line="${r}">${i}</p>`), t.length = 0;
}
function w(t, n) {
  for (; n.length > 0; ) {
    const { tag: e } = n.pop();
    t.push(`</${e}>`);
  }
}
function B(t, n, e, r = 0) {
  const a = t.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
  if (!a) return !1;
  const i = a[1].length, s = a[2], o = a[3], l = Math.floor(i / 2), u = /^\d+\./.test(s) ? "ol" : "ul";
  for (; e.length > l + 1; ) {
    const { tag: f } = e.pop();
    n.push(`</${f}>`);
  }
  if (e.length <= l)
    e.push({ tag: u, indent: i }), n.push(`<${u}>`);
  else if (e[e.length - 1].tag !== u) {
    const { tag: f } = e.pop();
    n.push(`</${f}>`), e.push({ tag: u, indent: i }), n.push(`<${u}>`);
  }
  const h = o.match(/^\[( |x|X)\]\s+(.*)/);
  if (h) {
    const f = h[1].toLowerCase() === "x", p = {}, c = y(h[2], p);
    n.push(
      `<li data-line="${r}" data-task="true"><input type="checkbox" ${f ? "checked" : ""} data-line="${r}"> ${c}</li>`
    );
  } else {
    const p = y(o, {});
    n.push(`<li data-line="${r}">${p}</li>`);
  }
  return !0;
}
function C() {
  let t = [], n = !1, e = 0;
  return {
    start(r = 0) {
      n = !0, t = [], e = r;
    },
    addRow(r) {
      n && t.push(r.trim());
    },
    parse(r) {
      if (!n || t.length === 0) return;
      const a = t[0].split("|").map((s) => s.trim()).filter((s) => s !== ""), i = [];
      if (t.length > 1) {
        const s = t[1].split("|").map((o) => o.trim()).filter((o) => o !== "");
        for (const o of s)
          /^:-+:$/.test(o) ? i.push("center") : /^-+:$/.test(o) ? i.push("right") : /^:-+$/.test(o) ? i.push("left") : i.push("");
      }
      r.push(`<table data-line="${e}">`), r.push("<thead><tr>");
      for (let s = 0; s < a.length; s++) {
        const o = i[s] ? ` style="text-align:${i[s]}"` : "";
        r.push(`<th${o}>${g(a[s])}</th>`);
      }
      r.push("</tr></thead><tbody>");
      for (let s = 2; s < t.length; s++) {
        const o = t[s].split("|").map((l) => l.trim()).filter((l) => l !== "");
        r.push("<tr>");
        for (let l = 0; l < a.length; l++) {
          const d = i[l] ? ` style="text-align:${i[l]}"` : "";
          r.push(`<td${d}>${g(o[l] || "")}</td>`);
        }
        r.push("</tr>");
      }
      r.push("</tbody></table>"), t = [], n = !1;
    },
    isInTable() {
      return n;
    }
  };
}
function O() {
  let t = 0;
  return {
    isInBlockquote() {
      return t > 0;
    },
    flush(n) {
      for (let e = 0; e < t; e++)
        n.push("</blockquote>");
      t = 0;
    },
    handle(n, e, r = 0) {
      const a = n.match(/^((?:>\s*)+)(.*)/);
      if (!a)
        return this.flush(e), !1;
      const i = (a[1].match(/>/g) || []).length, s = a[2].trim();
      if (i > t)
        for (let o = t; o < i; o++)
          e.push(`<blockquote data-line="${r}">`);
      else if (i < t)
        for (let o = t; o > i; o--)
          e.push("</blockquote>");
      if (t = i, s) {
        const l = y(s, {});
        e.push(`<p>${l}</p>`);
      }
      return !0;
    }
  };
}
function I(t, n, e = 0) {
  const r = t.trim().match(/^(#{1,6})\s+(.*)/);
  if (!r) return !1;
  const a = r[1].length;
  let i = r[2], { text: s, map: o } = A(i), { text: l, map: d } = v(s), u = g(l);
  u = u.replace(
    new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
    (p, c) => F(c, !1)
  ), u = u.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>"), u = u.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"), u = u.replace(/\*(.+?)\*/g, "<em>$1</em>"), u = u.replace(/~~([^~\n]+?)~~/g, "<del>$1</del>"), u = P(u, d), u = _(u, o);
  const f = i.trim().replace(/\*{1,3}(.+?)\*{1,3}/g, "$1").replace(/~~(.+?)~~/g, "$1").replace(/`(.+?)`/g, "$1").replace(/\s+/g, "-").replace(/[^\w\u4e00-\u9fa5-]/g, "").toLowerCase();
  return n.push(`<h${a} id="${f}" data-line="${e}">${u}</h${a}>`), !0;
}
Prism.languages.javascript = Prism.languages.extend("clike", {
  "class-name": [
    Prism.languages.clike["class-name"],
    {
      pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
      lookbehind: !0
    }
  ],
  keyword: [
    {
      pattern: /((?:^|\})\s*)catch\b/,
      lookbehind: !0
    },
    {
      pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
      lookbehind: !0
    }
  ],
  // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
  function: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
  number: {
    pattern: RegExp(
      /(^|[^\w$])/.source + "(?:" + // constant
      (/NaN|Infinity/.source + "|" + // binary integer
      /0[bB][01]+(?:_[01]+)*n?/.source + "|" + // octal integer
      /0[oO][0-7]+(?:_[0-7]+)*n?/.source + "|" + // hexadecimal integer
      /0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source + "|" + // decimal bigint
      /\d+(?:_\d+)*n/.source + "|" + // decimal number (integer or float) but no bigint
      /(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source) + ")" + /(?![\w$])/.source
    ),
    lookbehind: !0
  },
  operator: /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
});
Prism.languages.javascript["class-name"][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;
Prism.languages.insertBefore("javascript", "keyword", {
  regex: {
    pattern: RegExp(
      // lookbehind
      // eslint-disable-next-line regexp/no-dupe-characters-character-class
      /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source + // Regex pattern:
      // There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
      // classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
      // with the only syntax, so we have to define 2 different regex patterns.
      /\//.source + "(?:" + /(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source + "|" + // `v` flag syntax. This supports 3 levels of nested character classes.
      /(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source + ")" + // lookahead
      /(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
    ),
    lookbehind: !0,
    greedy: !0,
    inside: {
      "regex-source": {
        pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
        lookbehind: !0,
        alias: "language-regex",
        inside: Prism.languages.regex
      },
      "regex-delimiter": /^\/|\/$/,
      "regex-flags": /^[a-z]+$/
    }
  },
  // This must be declared before keyword because we use "function" inside the look-forward
  "function-variable": {
    pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
    alias: "function"
  },
  parameter: [
    {
      pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
      lookbehind: !0,
      inside: Prism.languages.javascript
    },
    {
      pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
      lookbehind: !0,
      inside: Prism.languages.javascript
    },
    {
      pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
      lookbehind: !0,
      inside: Prism.languages.javascript
    },
    {
      pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
      lookbehind: !0,
      inside: Prism.languages.javascript
    }
  ],
  constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/
});
Prism.languages.insertBefore("javascript", "string", {
  hashbang: {
    pattern: /^#!.*/,
    greedy: !0,
    alias: "comment"
  },
  "template-string": {
    pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
    greedy: !0,
    inside: {
      "template-punctuation": {
        pattern: /^`|`$/,
        alias: "string"
      },
      interpolation: {
        pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
        lookbehind: !0,
        inside: {
          "interpolation-punctuation": {
            pattern: /^\$\{|\}$/,
            alias: "punctuation"
          },
          rest: Prism.languages.javascript
        }
      },
      string: /[\s\S]+/
    }
  },
  "string-property": {
    pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
    lookbehind: !0,
    greedy: !0,
    alias: "property"
  }
});
Prism.languages.insertBefore("javascript", "operator", {
  "literal-property": {
    pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
    lookbehind: !0,
    alias: "property"
  }
});
Prism.languages.markup && (Prism.languages.markup.tag.addInlined("script", "javascript"), Prism.languages.markup.tag.addAttribute(
  /on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
  "javascript"
));
Prism.languages.js = Prism.languages.javascript;
(function(t) {
  t.languages.typescript = t.languages.extend("javascript", {
    "class-name": {
      pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,
      lookbehind: !0,
      greedy: !0,
      inside: null
      // see below
    },
    builtin: /\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/
  }), t.languages.typescript.keyword.push(
    /\b(?:abstract|declare|is|keyof|readonly|require)\b/,
    // keywords that have to be followed by an identifier
    /\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,
    // This is for `import type *, {}`
    /\btype\b(?=\s*(?:[\{*]|$))/
  ), delete t.languages.typescript.parameter, delete t.languages.typescript["literal-property"];
  var n = t.languages.extend("typescript", {});
  delete n["class-name"], t.languages.typescript["class-name"].inside = n, t.languages.insertBefore("typescript", "function", {
    decorator: {
      pattern: /@[$\w\xA0-\uFFFF]+/,
      inside: {
        at: {
          pattern: /^@/,
          alias: "operator"
        },
        function: /^[\s\S]+/
      }
    },
    "generic-function": {
      // e.g. foo<T extends "bar" | "baz">( ...
      pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,
      greedy: !0,
      inside: {
        function: /^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,
        generic: {
          pattern: /<[\s\S]+/,
          // everything after the first <
          alias: "class-name",
          inside: n
        }
      }
    }
  }), t.languages.ts = t.languages.typescript;
})(Prism);
Prism.languages.python = {
  comment: {
    pattern: /(^|[^\\])#.*/,
    lookbehind: !0,
    greedy: !0
  },
  "string-interpolation": {
    pattern: /(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
    greedy: !0,
    inside: {
      interpolation: {
        // "{" <expression> <optional "!s", "!r", or "!a"> <optional ":" format specifier> "}"
        pattern: /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,
        lookbehind: !0,
        inside: {
          "format-spec": {
            pattern: /(:)[^:(){}]+(?=\}$)/,
            lookbehind: !0
          },
          "conversion-option": {
            pattern: /![sra](?=[:}]$)/,
            alias: "punctuation"
          },
          rest: null
        }
      },
      string: /[\s\S]+/
    }
  },
  "triple-quoted-string": {
    pattern: /(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,
    greedy: !0,
    alias: "string"
  },
  string: {
    pattern: /(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,
    greedy: !0
  },
  function: {
    pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
    lookbehind: !0
  },
  "class-name": {
    pattern: /(\bclass\s+)\w+/i,
    lookbehind: !0
  },
  decorator: {
    pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m,
    lookbehind: !0,
    alias: ["annotation", "punctuation"],
    inside: {
      punctuation: /\./
    }
  },
  keyword: /\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
  builtin: /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
  boolean: /\b(?:False|None|True)\b/,
  number: /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,
  operator: /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
  punctuation: /[{}[\];(),.:]/
};
Prism.languages.python["string-interpolation"].inside.interpolation.inside.rest = Prism.languages.python;
Prism.languages.py = Prism.languages.python;
(function(t) {
  var n = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;
  t.languages.css = {
    comment: /\/\*[\s\S]*?\*\//,
    atrule: {
      pattern: RegExp("@[\\w-](?:" + /[^;{\s"']|\s+(?!\s)/.source + "|" + n.source + ")*?" + /(?:;|(?=\s*\{))/.source),
      inside: {
        rule: /^@[\w-]+/,
        "selector-function-argument": {
          pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
          lookbehind: !0,
          alias: "selector"
        },
        keyword: {
          pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
          lookbehind: !0
        }
        // See rest below
      }
    },
    url: {
      // https://drafts.csswg.org/css-values-3/#urls
      pattern: RegExp("\\burl\\((?:" + n.source + "|" + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ")\\)", "i"),
      greedy: !0,
      inside: {
        function: /^url/i,
        punctuation: /^\(|\)$/,
        string: {
          pattern: RegExp("^" + n.source + "$"),
          alias: "url"
        }
      }
    },
    selector: {
      pattern: RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|` + n.source + ")*(?=\\s*\\{)"),
      lookbehind: !0
    },
    string: {
      pattern: n,
      greedy: !0
    },
    property: {
      pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
      lookbehind: !0
    },
    important: /!important\b/i,
    function: {
      pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
      lookbehind: !0
    },
    punctuation: /[(){};:,]/
  }, t.languages.css.atrule.inside.rest = t.languages.css;
  var e = t.languages.markup;
  e && (e.tag.addInlined("style", "css"), e.tag.addAttribute("style", "css"));
})(Prism);
Prism.languages.markup = {
  comment: {
    pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
    greedy: !0
  },
  prolog: {
    pattern: /<\?[\s\S]+?\?>/,
    greedy: !0
  },
  doctype: {
    // https://www.w3.org/TR/xml/#NT-doctypedecl
    pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
    greedy: !0,
    inside: {
      "internal-subset": {
        pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
        lookbehind: !0,
        greedy: !0,
        inside: null
        // see below
      },
      string: {
        pattern: /"[^"]*"|'[^']*'/,
        greedy: !0
      },
      punctuation: /^<!|>$|[[\]]/,
      "doctype-tag": /^DOCTYPE/i,
      name: /[^\s<>'"]+/
    }
  },
  cdata: {
    pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
    greedy: !0
  },
  tag: {
    pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
    greedy: !0,
    inside: {
      tag: {
        pattern: /^<\/?[^\s>\/]+/,
        inside: {
          punctuation: /^<\/?/,
          namespace: /^[^\s>\/:]+:/
        }
      },
      "special-attr": [],
      "attr-value": {
        pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
        inside: {
          punctuation: [
            {
              pattern: /^=/,
              alias: "attr-equals"
            },
            {
              pattern: /^(\s*)["']|["']$/,
              lookbehind: !0
            }
          ]
        }
      },
      punctuation: /\/?>/,
      "attr-name": {
        pattern: /[^\s>\/]+/,
        inside: {
          namespace: /^[^\s>\/:]+:/
        }
      }
    }
  },
  entity: [
    {
      pattern: /&[\da-z]{1,8};/i,
      alias: "named-entity"
    },
    /&#x?[\da-f]{1,8};/i
  ]
};
Prism.languages.markup.tag.inside["attr-value"].inside.entity = Prism.languages.markup.entity;
Prism.languages.markup.doctype.inside["internal-subset"].inside = Prism.languages.markup;
Prism.hooks.add("wrap", function(t) {
  t.type === "entity" && (t.attributes.title = t.content.replace(/&amp;/, "&"));
});
Object.defineProperty(Prism.languages.markup.tag, "addInlined", {
  /**
   * Adds an inlined language to markup.
   *
   * An example of an inlined language is CSS with `<style>` tags.
   *
   * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
   * case insensitive.
   * @param {string} lang The language key.
   * @example
   * addInlined('style', 'css');
   */
  value: function(n, e) {
    var r = {};
    r["language-" + e] = {
      pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
      lookbehind: !0,
      inside: Prism.languages[e]
    }, r.cdata = /^<!\[CDATA\[|\]\]>$/i;
    var a = {
      "included-cdata": {
        pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
        inside: r
      }
    };
    a["language-" + e] = {
      pattern: /[\s\S]+/,
      inside: Prism.languages[e]
    };
    var i = {};
    i[n] = {
      pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function() {
        return n;
      }), "i"),
      lookbehind: !0,
      greedy: !0,
      inside: a
    }, Prism.languages.insertBefore("markup", "cdata", i);
  }
});
Object.defineProperty(Prism.languages.markup.tag, "addAttribute", {
  /**
   * Adds an pattern to highlight languages embedded in HTML attributes.
   *
   * An example of an inlined language is CSS with `style` attributes.
   *
   * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
   * case insensitive.
   * @param {string} lang The language key.
   * @example
   * addAttribute('style', 'css');
   */
  value: function(t, n) {
    Prism.languages.markup.tag.inside["special-attr"].push({
      pattern: RegExp(
        /(^|["'\s])/.source + "(?:" + t + ")" + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
        "i"
      ),
      lookbehind: !0,
      inside: {
        "attr-name": /^[^\s=]+/,
        "attr-value": {
          pattern: /=[\s\S]+/,
          inside: {
            value: {
              pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
              lookbehind: !0,
              alias: [n, "language-" + n],
              inside: Prism.languages[n]
            },
            punctuation: [
              {
                pattern: /^=/,
                alias: "attr-equals"
              },
              /"|'/
            ]
          }
        }
      }
    });
  }
});
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;
Prism.languages.xml = Prism.languages.extend("markup", {});
Prism.languages.ssml = Prism.languages.xml;
Prism.languages.atom = Prism.languages.xml;
Prism.languages.rss = Prism.languages.xml;
function z() {
  let t = !1, n = "text", e = [];
  return {
    startOrEnd(r, a) {
      const i = r.trim();
      if (!/^```/.test(i)) return !1;
      if (t) {
        const s = e.join(`
`), o = b.highlight(
          s,
          b.languages[n] || b.languages.plain,
          n
        );
        a.push(`<pre class="language-${n}"><code>${o}</code></pre>`), t = !1, e = [];
      } else
        t = !0, n = i.slice(3).trim() || "text", e = [];
      return !0;
    },
    handleLine(r) {
      return t ? (e.push(r), !0) : !1;
    },
    isInBlock() {
      return t;
    },
    // 文档末尾若代码块未闭合，强制关闭
    flush(r) {
      if (t) {
        const a = e.join(`
`), i = b.highlight(
          a,
          b.languages[n] || b.languages.plain,
          n
        );
        r.push(`<pre class="language-${n}"><code>${i}</code></pre>`), t = !1, e = [];
      }
    }
  };
}
function E() {
  let t = !1, n = [];
  return {
    startOrEnd(e, r) {
      return e.trim() !== "$$" ? !1 : (t ? (r.push(F(n.join(`
`), !0)), t = !1, n = []) : (t = !0, n = []), !0);
    },
    handleLine(e) {
      return t ? (n.push(e), !0) : !1;
    },
    isInBlock() {
      return t;
    },
    flush(e) {
      t && (e.push(F(n.join(`
`), !0)), t = !1, n = []);
    }
  };
}
function L() {
  let t = !1, n = [];
  return {
    startOrEnd(e, r) {
      const a = e.trim();
      return a === ":::three" ? (t = !0, n = [], !0) : a === ":::" && t ? (r.push(
        `<div class="three-preview" data-objects='${JSON.stringify(n)}'></div>`
      ), t = !1, n = [], !0) : !1;
    },
    handleObject(e) {
      if (!t) return !1;
      const a = e.trim().match(
        /^(#{1,6})\s*(cube|sphere|cone|cylinder|torus|plane|dodecahedron|icosahedron|octahedron)\s*\(([^,]+?)(?:,\s*(\d+(?:\.\d+)?))?\)/i
      );
      if (a) {
        const i = a[2].toLowerCase(), s = a[3].trim(), o = parseFloat(a[4]) || 1;
        n.push({ type: i, color: s, size: o });
      }
      return !0;
    },
    isInBlock() {
      return t;
    },
    flush(e) {
      t && (e.push(
        `<div class="three-preview" data-objects='${JSON.stringify(n)}'></div>`
      ), t = !1, n = []);
    }
  };
}
function M(t, n, e) {
  if (!(Object.keys(n).length === 0 && Object.keys(e).length === 0)) {
    t.push('<hr /><section class="footnotes"><ol>');
    for (const r in n)
      t.push(
        `<li id="footnote-${r}">${n[r]} <a href="#ref-${r}">↩</a></li>`
      );
    for (const r in e)
      t.push(
        `<li id="footnote-${r}">${e[r]} <a href="#ref-${r}">↩</a></li>`
      );
    t.push("</ol></section>");
  }
}
function q(t) {
  if (!t) return "";
  const n = t.split(`
`), e = [], r = [], a = [], i = {}, s = {}, o = z(), l = E(), d = L(), u = C(), h = O(), f = (p) => {
    for (let c = e.length - 1; c >= 0; c--)
      if (typeof e[c] == "string" && e[c].startsWith("<") && !e[c].startsWith("</")) {
        e[c] = e[c].replace(/^(<\w+)/, `$1 data-line="${p}"`);
        break;
      }
  };
  for (let p = 0; p < n.length; p++) {
    const c = n[p];
    if (/^(\*\s*\*\s*\*|---|___)\s*$/.test(c)) {
      m(a, e, s), e.push("<hr />"), f(p);
      continue;
    }
    if (o.startOrEnd(c, e)) {
      m(a, e, s), o.isInBlock() || f(p);
      continue;
    }
    if (o.isInBlock()) {
      o.handleLine(c);
      continue;
    }
    if (l.startOrEnd(c, e)) {
      m(a, e, s), l.isInBlock() || f(p);
      continue;
    }
    if (l.isInBlock()) {
      l.handleLine(c);
      continue;
    }
    if (d.startOrEnd(c, e)) {
      m(a, e, s), d.isInBlock() || f(p);
      continue;
    }
    if (d.isInBlock()) {
      d.handleObject(c);
      continue;
    }
    if (c.trim().startsWith("|")) {
      m(a, e, s), u.isInTable() || u.start(p), u.addRow(c);
      continue;
    } else u.isInTable() && u.parse(e);
    if (/^>/.test(c.trimStart()) && m(a, e, s), !h.handle(c, e, p)) {
      if (I(c, e, p)) {
        m(a, e, s);
        continue;
      }
      if (B(c, e, r, p)) {
        m(a, e, s);
        continue;
      }
      if (c.trim() === "") {
        m(a, e, s), r.length > 0 && w(e, r), h.flush(e);
        let k = 0, $ = p + 1;
        for (; $ < n.length && n[$].trim() === ""; )
          k++, $++;
        for (let x = 0; x < k; x++)
          e.push("<p><br /></p>");
        p = $ - 1;
      } else
        a.push({ text: c, lineNo: p });
    }
  }
  return m(a, e, s), w(e, r), h.flush(e), u.isInTable() && u.parse(e), o.flush(e), l.flush(e), d.flush(e), M(e, i, s), e.join(`
`);
}
export {
  q as parseMarkdown
};
