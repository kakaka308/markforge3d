import pe from "katex";
function _(t = "") {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function G(t = "") {
  const s = {};
  let e = 0;
  return t = t.replace(/<[^>]+>/g, (i) => {
    const g = `@@HTML${e}@@`;
    return s[g] = i, e++, g;
  }), { text: t, map: s };
}
function R(t = "", s = {}) {
  return t.replace(/@@HTML(\d+)@@/g, (e, i) => s[`@@HTML${i}@@`] || "");
}
function U(t = "") {
  const s = {};
  let e = 0;
  return t = t.replace(/`([^`\n]+)`/g, (i, g) => {
    const p = `@@CODE${e}@@`;
    return s[p] = g, e++, p;
  }), { text: t, map: s };
}
function D(t = "", s = {}) {
  return t.replace(
    /@@CODE(\d+)@@/g,
    (e, i) => `<code class="language-plaintext">${_(s[`@@CODE${i}@@`] || "")}</code>`
  );
}
function z(t, s = !1) {
  try {
    return pe.renderToString(t, {
      throwOnError: !1,
      displayMode: s,
      output: "html"
    });
  } catch {
    return `<code class="katex-error">${_(t)}</code>`;
  }
}
function de(t = "") {
  const s = [], e = /(\w+)=(".*?"|'.*?'|[^\s"']+)/g;
  let i;
  for (; (i = e.exec(t)) !== null; ) {
    const g = i[1];
    let p = i[2];
    (p.startsWith('"') && p.endsWith('"') || p.startsWith("'") && p.endsWith("'")) && (p = p.slice(1, -1)), s.push(`${g}="${_(p)}"`);
  }
  return s.join(" ");
}
function fe(t, s) {
  let { text: e, map: i } = G(t), { text: g, map: p } = U(e), u = _(g);
  return u = u.replace(
    new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
    (r, d) => z(d.trim(), !1)
  ), u = u.replace(/\[\^(.+?)\]\((.+?)\)/g, (r, d, $) => {
    const b = d.trim() || `inline-${Object.keys(s).length + 1}`;
    return s[b] = _($), `<sup id="ref-${b}"><a href="#footnote-${b}">${b}</a></sup>`;
  }), u = u.replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (r, d, $, b) => {
    const F = b ? " " + de(b) : "";
    return `<img alt="${_(d)}" src="${_($)}"${F} />`;
  }), u = u.replace(
    /\[([^\]]+?)\]\(([^)]+)\)\{embed\}/g,
    (r, d, $) => `<iframe src="${_($)}" title="${_(d)}" width="100%" height="400px" style="border:none;"></iframe>`
  ), u = u.replace(
    /\[([^\]]+?)\]\(([^)]+)\)/g,
    (r, d, $) => `<a href="${_($)}" target="_blank" rel="noopener noreferrer" data-link-text="${_(d)}" data-url="${_($)}">${_(d)}</a> <button class="embed-toggle-btn">内嵌</button>`
  ), u = u.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>"), u = u.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"), u = u.replace(/\*(.+?)\*/g, "<em>$1</em>"), u = u.replace(/~~([^~\n]+?)~~/g, "<del>$1</del>"), u = u.replace(
    /\[\^(.+?)\]/g,
    (r, d) => `<sup id="ref-${d}"><a href="#footnote-${d}">${d}</a></sup>`
  ), u = D(u, p), u = R(u, i), u;
}
function C(t, s, e) {
  if (t.length === 0) return;
  const i = t[0].lineNo ?? 0, g = t.map((u) => typeof u == "string" ? u : u.text).join(`
`);
  let p = fe(g, e);
  p = p.replace(/\n/g, "<br />"), s.push(`<p data-line="${i}">${p}</p>`), t.length = 0;
}
function te(t, s) {
  for (; s.length > 0; ) {
    const { tag: e } = s.pop();
    t.push(`</${e}>`);
  }
}
function he(t, s, e, i = 0) {
  const g = t.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
  if (!g) return !1;
  const p = g[1].length, u = g[2], r = g[3], d = Math.floor(p / 2), b = /^\d+\./.test(u) ? "ol" : "ul";
  for (; e.length > d + 1; ) {
    const { tag: m } = e.pop();
    s.push(`</${m}>`);
  }
  if (e.length <= d)
    e.push({ tag: b, indent: p }), s.push(`<${b}>`);
  else if (e[e.length - 1].tag !== b) {
    const { tag: m } = e.pop();
    s.push(`</${m}>`), e.push({ tag: b, indent: p }), s.push(`<${b}>`);
  }
  const { text: F, map: P } = G(r), { text: x, map: v } = U(F), w = x.match(/^\[( |x|X)\]\s+(.*)/);
  if (w) {
    const m = w[1].toLowerCase() === "x", k = R(D(_(w[2]), v), P);
    s.push(
      `<li data-line="${i}" data-task="true"><input type="checkbox" ${m ? "checked" : ""} data-line="${i}"> ${k}</li>`
    );
  } else {
    let m = _(x);
    m = m.replace(
      new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
      (k, a) => z(a, !1)
    ), m = D(m, v), m = R(m, P), s.push(`<li data-line="${i}">${m}</li>`);
  }
  return !0;
}
function me() {
  let t = [], s = !1, e = 0;
  return {
    start(i = 0) {
      s = !0, t = [], e = i;
    },
    addRow(i) {
      s && t.push(i.trim());
    },
    parse(i) {
      if (!s || t.length === 0) return;
      const g = t[0].split("|").map((u) => u.trim()).filter((u) => u !== ""), p = [];
      if (t.length > 1) {
        const u = t[1].split("|").map((r) => r.trim()).filter((r) => r !== "");
        for (const r of u)
          /^:-+:$/.test(r) ? p.push("center") : /^-+:$/.test(r) ? p.push("right") : /^:-+$/.test(r) ? p.push("left") : p.push("");
      }
      i.push(`<table data-line="${e}">`), i.push("<thead><tr>");
      for (let u = 0; u < g.length; u++) {
        const r = p[u] ? ` style="text-align:${p[u]}"` : "";
        i.push(`<th${r}>${_(g[u])}</th>`);
      }
      i.push("</tr></thead><tbody>");
      for (let u = 2; u < t.length; u++) {
        const r = t[u].split("|").map((d) => d.trim()).filter((d) => d !== "");
        i.push("<tr>");
        for (let d = 0; d < g.length; d++) {
          const $ = p[d] ? ` style="text-align:${p[d]}"` : "";
          i.push(`<td${$}>${_(r[d] || "")}</td>`);
        }
        i.push("</tr>");
      }
      i.push("</tbody></table>"), t = [], s = !1;
    },
    isInTable() {
      return s;
    }
  };
}
function be() {
  let t = 0;
  return {
    isInBlockquote() {
      return t > 0;
    },
    flush(s) {
      for (let e = 0; e < t; e++)
        s.push("</blockquote>");
      t = 0;
    },
    handle(s, e, i = 0) {
      const g = s.match(/^((?:>\s*)+)(.*)/);
      if (!g)
        return this.flush(e), !1;
      const p = (g[1].match(/>/g) || []).length, u = g[2].trim();
      if (p > t)
        for (let r = t; r < p; r++)
          e.push(`<blockquote data-line="${i}">`);
      else if (p < t)
        for (let r = t; r > p; r--)
          e.push("</blockquote>");
      if (t = p, u) {
        let { text: r, map: d } = G(u), { text: $, map: b } = U(r), F = _($);
        F = F.replace(
          new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
          (P, x) => z(x, !1)
        ), F = F.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>"), F = F.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"), F = F.replace(/\*(.+?)\*/g, "<em>$1</em>"), F = F.replace(/~~([^~\n]+?)~~/g, "<del>$1</del>"), F = D(F, b), F = R(F, d), e.push(`<p>${F}</p>`);
      }
      return !0;
    }
  };
}
function ye(t, s, e = 0) {
  const i = t.trim().match(/^(#{1,6})\s+(.*)/);
  if (!i) return !1;
  const g = i[1].length;
  let p = i[2], { text: u, map: r } = G(p), { text: d, map: $ } = U(u), b = _(d);
  b = b.replace(
    new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
    (P, x) => z(x, !1)
  ), b = D(b, $), b = R(b, r);
  const F = p.trim().replace(/\s+/g, "-").replace(/[^\w\u4e00-\u9fa5-]/g, "").toLowerCase();
  return s.push(`<h${g} id="${F}" data-line="${e}">${b}</h${g}>`), !0;
}
var ne = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Fe(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Y = { exports: {} }, ae;
function ve() {
  return ae || (ae = 1, function(t) {
    var s = typeof window < "u" ? window : typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope ? self : {};
    /**
     * Prism: Lightweight, robust, elegant syntax highlighting
     *
     * @license MIT <https://opensource.org/licenses/MIT>
     * @author Lea Verou <https://lea.verou.me>
     * @namespace
     * @public
     */
    var e = function(i) {
      var g = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i, p = 0, u = {}, r = {
        /**
         * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
         * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
         * additional languages or plugins yourself.
         *
         * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
         *
         * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
         * empty Prism object into the global scope before loading the Prism script like this:
         *
         * ```js
         * window.Prism = window.Prism || {};
         * Prism.manual = true;
         * // add a new <script> to load Prism's script
         * ```
         *
         * @default false
         * @type {boolean}
         * @memberof Prism
         * @public
         */
        manual: i.Prism && i.Prism.manual,
        /**
         * By default, if Prism is in a web worker, it assumes that it is in a worker it created itself, so it uses
         * `addEventListener` to communicate with its parent instance. However, if you're using Prism manually in your
         * own worker, you don't want it to do this.
         *
         * By setting this value to `true`, Prism will not add its own listeners to the worker.
         *
         * You obviously have to change this value before Prism executes. To do this, you can add an
         * empty Prism object into the global scope before loading the Prism script like this:
         *
         * ```js
         * window.Prism = window.Prism || {};
         * Prism.disableWorkerMessageHandler = true;
         * // Load Prism's script
         * ```
         *
         * @default false
         * @type {boolean}
         * @memberof Prism
         * @public
         */
        disableWorkerMessageHandler: i.Prism && i.Prism.disableWorkerMessageHandler,
        /**
         * A namespace for utility methods.
         *
         * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
         * change or disappear at any time.
         *
         * @namespace
         * @memberof Prism
         */
        util: {
          encode: function a(n) {
            return n instanceof d ? new d(n.type, a(n.content), n.alias) : Array.isArray(n) ? n.map(a) : n.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
          },
          /**
           * Returns the name of the type of the given value.
           *
           * @param {any} o
           * @returns {string}
           * @example
           * type(null)      === 'Null'
           * type(undefined) === 'Undefined'
           * type(123)       === 'Number'
           * type('foo')     === 'String'
           * type(true)      === 'Boolean'
           * type([1, 2])    === 'Array'
           * type({})        === 'Object'
           * type(String)    === 'Function'
           * type(/abc+/)    === 'RegExp'
           */
          type: function(a) {
            return Object.prototype.toString.call(a).slice(8, -1);
          },
          /**
           * Returns a unique number for the given object. Later calls will still return the same number.
           *
           * @param {Object} obj
           * @returns {number}
           */
          objId: function(a) {
            return a.__id || Object.defineProperty(a, "__id", { value: ++p }), a.__id;
          },
          /**
           * Creates a deep clone of the given object.
           *
           * The main intended use of this function is to clone language definitions.
           *
           * @param {T} o
           * @param {Record<number, any>} [visited]
           * @returns {T}
           * @template T
           */
          clone: function a(n, l) {
            l = l || {};
            var o, c;
            switch (r.util.type(n)) {
              case "Object":
                if (c = r.util.objId(n), l[c])
                  return l[c];
                o = /** @type {Record<string, any>} */
                {}, l[c] = o;
                for (var h in n)
                  n.hasOwnProperty(h) && (o[h] = a(n[h], l));
                return (
                  /** @type {any} */
                  o
                );
              case "Array":
                return c = r.util.objId(n), l[c] ? l[c] : (o = [], l[c] = o, /** @type {Array} */
                /** @type {any} */
                n.forEach(function(y, f) {
                  o[f] = a(y, l);
                }), /** @type {any} */
                o);
              default:
                return n;
            }
          },
          /**
           * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
           *
           * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
           *
           * @param {Element} element
           * @returns {string}
           */
          getLanguage: function(a) {
            for (; a; ) {
              var n = g.exec(a.className);
              if (n)
                return n[1].toLowerCase();
              a = a.parentElement;
            }
            return "none";
          },
          /**
           * Sets the Prism `language-xxxx` class of the given element.
           *
           * @param {Element} element
           * @param {string} language
           * @returns {void}
           */
          setLanguage: function(a, n) {
            a.className = a.className.replace(RegExp(g, "gi"), ""), a.classList.add("language-" + n);
          },
          /**
           * Returns the script element that is currently executing.
           *
           * This does __not__ work for line script element.
           *
           * @returns {HTMLScriptElement | null}
           */
          currentScript: function() {
            if (typeof document > "u")
              return null;
            if (document.currentScript && document.currentScript.tagName === "SCRIPT")
              return (
                /** @type {any} */
                document.currentScript
              );
            try {
              throw new Error();
            } catch (o) {
              var a = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(o.stack) || [])[1];
              if (a) {
                var n = document.getElementsByTagName("script");
                for (var l in n)
                  if (n[l].src == a)
                    return n[l];
              }
              return null;
            }
          },
          /**
           * Returns whether a given class is active for `element`.
           *
           * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
           * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
           * given class is just the given class with a `no-` prefix.
           *
           * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
           * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
           * ancestors have the given class or the negated version of it, then the default activation will be returned.
           *
           * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
           * version of it, the class is considered active.
           *
           * @param {Element} element
           * @param {string} className
           * @param {boolean} [defaultActivation=false]
           * @returns {boolean}
           */
          isActive: function(a, n, l) {
            for (var o = "no-" + n; a; ) {
              var c = a.classList;
              if (c.contains(n))
                return !0;
              if (c.contains(o))
                return !1;
              a = a.parentElement;
            }
            return !!l;
          }
        },
        /**
         * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
         *
         * @namespace
         * @memberof Prism
         * @public
         */
        languages: {
          /**
           * The grammar for plain, unformatted text.
           */
          plain: u,
          plaintext: u,
          text: u,
          txt: u,
          /**
           * Creates a deep copy of the language with the given id and appends the given tokens.
           *
           * If a token in `redef` also appears in the copied language, then the existing token in the copied language
           * will be overwritten at its original position.
           *
           * ## Best practices
           *
           * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
           * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
           * understand the language definition because, normally, the order of tokens matters in Prism grammars.
           *
           * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
           * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
           *
           * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
           * @param {Grammar} redef The new tokens to append.
           * @returns {Grammar} The new language created.
           * @public
           * @example
           * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
           *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
           *     // at its original position
           *     'comment': { ... },
           *     // CSS doesn't have a 'color' token, so this token will be appended
           *     'color': /\b(?:red|green|blue)\b/
           * });
           */
          extend: function(a, n) {
            var l = r.util.clone(r.languages[a]);
            for (var o in n)
              l[o] = n[o];
            return l;
          },
          /**
           * Inserts tokens _before_ another token in a language definition or any other grammar.
           *
           * ## Usage
           *
           * This helper method makes it easy to modify existing languages. For example, the CSS language definition
           * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
           * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
           * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
           * this:
           *
           * ```js
           * Prism.languages.markup.style = {
           *     // token
           * };
           * ```
           *
           * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
           * before existing tokens. For the CSS example above, you would use it like this:
           *
           * ```js
           * Prism.languages.insertBefore('markup', 'cdata', {
           *     'style': {
           *         // token
           *     }
           * });
           * ```
           *
           * ## Special cases
           *
           * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
           * will be ignored.
           *
           * This behavior can be used to insert tokens after `before`:
           *
           * ```js
           * Prism.languages.insertBefore('markup', 'comment', {
           *     'comment': Prism.languages.markup.comment,
           *     // tokens after 'comment'
           * });
           * ```
           *
           * ## Limitations
           *
           * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
           * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
           * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
           * deleting properties which is necessary to insert at arbitrary positions.
           *
           * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
           * Instead, it will create a new object and replace all references to the target object with the new one. This
           * can be done without temporarily deleting properties, so the iteration order is well-defined.
           *
           * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
           * you hold the target object in a variable, then the value of the variable will not change.
           *
           * ```js
           * var oldMarkup = Prism.languages.markup;
           * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
           *
           * assert(oldMarkup !== Prism.languages.markup);
           * assert(newMarkup === Prism.languages.markup);
           * ```
           *
           * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
           * object to be modified.
           * @param {string} before The key to insert before.
           * @param {Grammar} insert An object containing the key-value pairs to be inserted.
           * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
           * object to be modified.
           *
           * Defaults to `Prism.languages`.
           * @returns {Grammar} The new grammar object.
           * @public
           */
          insertBefore: function(a, n, l, o) {
            o = o || /** @type {any} */
            r.languages;
            var c = o[a], h = {};
            for (var y in c)
              if (c.hasOwnProperty(y)) {
                if (y == n)
                  for (var f in l)
                    l.hasOwnProperty(f) && (h[f] = l[f]);
                l.hasOwnProperty(y) || (h[y] = c[y]);
              }
            var A = o[a];
            return o[a] = h, r.languages.DFS(r.languages, function(E, M) {
              M === A && E != a && (this[E] = h);
            }), h;
          },
          // Traverse a language definition with Depth First Search
          DFS: function a(n, l, o, c) {
            c = c || {};
            var h = r.util.objId;
            for (var y in n)
              if (n.hasOwnProperty(y)) {
                l.call(n, y, n[y], o || y);
                var f = n[y], A = r.util.type(f);
                A === "Object" && !c[h(f)] ? (c[h(f)] = !0, a(f, l, null, c)) : A === "Array" && !c[h(f)] && (c[h(f)] = !0, a(f, l, y, c));
              }
          }
        },
        plugins: {},
        /**
         * This is the most high-level function in Prism’s API.
         * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
         * each one of them.
         *
         * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
         *
         * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
         * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
         * @memberof Prism
         * @public
         */
        highlightAll: function(a, n) {
          r.highlightAllUnder(document, a, n);
        },
        /**
         * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
         * {@link Prism.highlightElement} on each one of them.
         *
         * The following hooks will be run:
         * 1. `before-highlightall`
         * 2. `before-all-elements-highlight`
         * 3. All hooks of {@link Prism.highlightElement} for each element.
         *
         * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
         * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
         * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
         * @memberof Prism
         * @public
         */
        highlightAllUnder: function(a, n, l) {
          var o = {
            callback: l,
            container: a,
            selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
          };
          r.hooks.run("before-highlightall", o), o.elements = Array.prototype.slice.apply(o.container.querySelectorAll(o.selector)), r.hooks.run("before-all-elements-highlight", o);
          for (var c = 0, h; h = o.elements[c++]; )
            r.highlightElement(h, n === !0, o.callback);
        },
        /**
         * Highlights the code inside a single element.
         *
         * The following hooks will be run:
         * 1. `before-sanity-check`
         * 2. `before-highlight`
         * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
         * 4. `before-insert`
         * 5. `after-highlight`
         * 6. `complete`
         *
         * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
         * the element's language.
         *
         * @param {Element} element The element containing the code.
         * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
         * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
         * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
         * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
         *
         * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
         * asynchronous highlighting to work. You can build your own bundle on the
         * [Download page](https://prismjs.com/download.html).
         * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
         * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
         * @memberof Prism
         * @public
         */
        highlightElement: function(a, n, l) {
          var o = r.util.getLanguage(a), c = r.languages[o];
          r.util.setLanguage(a, o);
          var h = a.parentElement;
          h && h.nodeName.toLowerCase() === "pre" && r.util.setLanguage(h, o);
          var y = a.textContent, f = {
            element: a,
            language: o,
            grammar: c,
            code: y
          };
          function A(M) {
            f.highlightedCode = M, r.hooks.run("before-insert", f), f.element.innerHTML = f.highlightedCode, r.hooks.run("after-highlight", f), r.hooks.run("complete", f), l && l.call(f.element);
          }
          if (r.hooks.run("before-sanity-check", f), h = f.element.parentElement, h && h.nodeName.toLowerCase() === "pre" && !h.hasAttribute("tabindex") && h.setAttribute("tabindex", "0"), !f.code) {
            r.hooks.run("complete", f), l && l.call(f.element);
            return;
          }
          if (r.hooks.run("before-highlight", f), !f.grammar) {
            A(r.util.encode(f.code));
            return;
          }
          if (n && i.Worker) {
            var E = new Worker(r.filename);
            E.onmessage = function(M) {
              A(M.data);
            }, E.postMessage(JSON.stringify({
              language: f.language,
              code: f.code,
              immediateClose: !0
            }));
          } else
            A(r.highlight(f.code, f.grammar, f.language));
        },
        /**
         * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
         * and the language definitions to use, and returns a string with the HTML produced.
         *
         * The following hooks will be run:
         * 1. `before-tokenize`
         * 2. `after-tokenize`
         * 3. `wrap`: On each {@link Token}.
         *
         * @param {string} text A string with the code to be highlighted.
         * @param {Grammar} grammar An object containing the tokens to use.
         *
         * Usually a language definition like `Prism.languages.markup`.
         * @param {string} language The name of the language definition passed to `grammar`.
         * @returns {string} The highlighted HTML.
         * @memberof Prism
         * @public
         * @example
         * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
         */
        highlight: function(a, n, l) {
          var o = {
            code: a,
            grammar: n,
            language: l
          };
          if (r.hooks.run("before-tokenize", o), !o.grammar)
            throw new Error('The language "' + o.language + '" has no grammar.');
          return o.tokens = r.tokenize(o.code, o.grammar), r.hooks.run("after-tokenize", o), d.stringify(r.util.encode(o.tokens), o.language);
        },
        /**
         * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
         * and the language definitions to use, and returns an array with the tokenized code.
         *
         * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
         *
         * This method could be useful in other contexts as well, as a very crude parser.
         *
         * @param {string} text A string with the code to be highlighted.
         * @param {Grammar} grammar An object containing the tokens to use.
         *
         * Usually a language definition like `Prism.languages.markup`.
         * @returns {TokenStream} An array of strings and tokens, a token stream.
         * @memberof Prism
         * @public
         * @example
         * let code = `var foo = 0;`;
         * let tokens = Prism.tokenize(code, Prism.languages.javascript);
         * tokens.forEach(token => {
         *     if (token instanceof Prism.Token && token.type === 'number') {
         *         console.log(`Found numeric literal: ${token.content}`);
         *     }
         * });
         */
        tokenize: function(a, n) {
          var l = n.rest;
          if (l) {
            for (var o in l)
              n[o] = l[o];
            delete n.rest;
          }
          var c = new F();
          return P(c, c.head, a), b(a, c, n, c.head, 0), v(c);
        },
        /**
         * @namespace
         * @memberof Prism
         * @public
         */
        hooks: {
          all: {},
          /**
           * Adds the given callback to the list of callbacks for the given hook.
           *
           * The callback will be invoked when the hook it is registered for is run.
           * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
           *
           * One callback function can be registered to multiple hooks and the same hook multiple times.
           *
           * @param {string} name The name of the hook.
           * @param {HookCallback} callback The callback function which is given environment variables.
           * @public
           */
          add: function(a, n) {
            var l = r.hooks.all;
            l[a] = l[a] || [], l[a].push(n);
          },
          /**
           * Runs a hook invoking all registered callbacks with the given environment variables.
           *
           * Callbacks will be invoked synchronously and in the order in which they were registered.
           *
           * @param {string} name The name of the hook.
           * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
           * @public
           */
          run: function(a, n) {
            var l = r.hooks.all[a];
            if (!(!l || !l.length))
              for (var o = 0, c; c = l[o++]; )
                c(n);
          }
        },
        Token: d
      };
      i.Prism = r;
      function d(a, n, l, o) {
        this.type = a, this.content = n, this.alias = l, this.length = (o || "").length | 0;
      }
      d.stringify = function a(n, l) {
        if (typeof n == "string")
          return n;
        if (Array.isArray(n)) {
          var o = "";
          return n.forEach(function(A) {
            o += a(A, l);
          }), o;
        }
        var c = {
          type: n.type,
          content: a(n.content, l),
          tag: "span",
          classes: ["token", n.type],
          attributes: {},
          language: l
        }, h = n.alias;
        h && (Array.isArray(h) ? Array.prototype.push.apply(c.classes, h) : c.classes.push(h)), r.hooks.run("wrap", c);
        var y = "";
        for (var f in c.attributes)
          y += " " + f + '="' + (c.attributes[f] || "").replace(/"/g, "&quot;") + '"';
        return "<" + c.tag + ' class="' + c.classes.join(" ") + '"' + y + ">" + c.content + "</" + c.tag + ">";
      };
      function $(a, n, l, o) {
        a.lastIndex = n;
        var c = a.exec(l);
        if (c && o && c[1]) {
          var h = c[1].length;
          c.index += h, c[0] = c[0].slice(h);
        }
        return c;
      }
      function b(a, n, l, o, c, h) {
        for (var y in l)
          if (!(!l.hasOwnProperty(y) || !l[y])) {
            var f = l[y];
            f = Array.isArray(f) ? f : [f];
            for (var A = 0; A < f.length; ++A) {
              if (h && h.cause == y + "," + A)
                return;
              var E = f[A], M = E.inside, K = !!E.lookbehind, Q = !!E.greedy, le = E.alias;
              if (Q && !E.pattern.global) {
                var oe = E.pattern.toString().match(/[imsuy]*$/)[0];
                E.pattern = RegExp(E.pattern.source, oe + "g");
              }
              for (var V = E.pattern || E, S = o.next, j = c; S !== n.tail && !(h && j >= h.reach); j += S.value.length, S = S.next) {
                var L = S.value;
                if (n.length > a.length)
                  return;
                if (!(L instanceof d)) {
                  var q = 1, T;
                  if (Q) {
                    if (T = $(V, j, a, K), !T || T.index >= a.length)
                      break;
                    var Z = T.index, ce = T.index + T[0].length, I = j;
                    for (I += S.value.length; Z >= I; )
                      S = S.next, I += S.value.length;
                    if (I -= S.value.length, j = I, S.value instanceof d)
                      continue;
                    for (var B = S; B !== n.tail && (I < ce || typeof B.value == "string"); B = B.next)
                      q++, I += B.value.length;
                    q--, L = a.slice(j, I), T.index -= j;
                  } else if (T = $(V, 0, L, K), !T)
                    continue;
                  var Z = T.index, H = T[0], N = L.slice(0, Z), ee = L.slice(Z + H.length), J = j + L.length;
                  h && J > h.reach && (h.reach = J);
                  var W = S.prev;
                  N && (W = P(n, W, N), j += N.length), x(n, W, q);
                  var ge = new d(y, M ? r.tokenize(H, M) : H, le, H);
                  if (S = P(n, W, ge), ee && P(n, S, ee), q > 1) {
                    var X = {
                      cause: y + "," + A,
                      reach: J
                    };
                    b(a, n, l, S.prev, j, X), h && X.reach > h.reach && (h.reach = X.reach);
                  }
                }
              }
            }
          }
      }
      function F() {
        var a = { value: null, prev: null, next: null }, n = { value: null, prev: a, next: null };
        a.next = n, this.head = a, this.tail = n, this.length = 0;
      }
      function P(a, n, l) {
        var o = n.next, c = { value: l, prev: n, next: o };
        return n.next = c, o.prev = c, a.length++, c;
      }
      function x(a, n, l) {
        for (var o = n.next, c = 0; c < l && o !== a.tail; c++)
          o = o.next;
        n.next = o, o.prev = n, a.length -= c;
      }
      function v(a) {
        for (var n = [], l = a.head.next; l !== a.tail; )
          n.push(l.value), l = l.next;
        return n;
      }
      if (!i.document)
        return i.addEventListener && (r.disableWorkerMessageHandler || i.addEventListener("message", function(a) {
          var n = JSON.parse(a.data), l = n.language, o = n.code, c = n.immediateClose;
          i.postMessage(r.highlight(o, r.languages[l], l)), c && i.close();
        }, !1)), r;
      var w = r.util.currentScript();
      w && (r.filename = w.src, w.hasAttribute("data-manual") && (r.manual = !0));
      function m() {
        r.manual || r.highlightAll();
      }
      if (!r.manual) {
        var k = document.readyState;
        k === "loading" || k === "interactive" && w && w.defer ? document.addEventListener("DOMContentLoaded", m) : window.requestAnimationFrame ? window.requestAnimationFrame(m) : window.setTimeout(m, 16);
      }
      return r;
    }(s);
    t.exports && (t.exports = e), typeof ne < "u" && (ne.Prism = e), e.languages.markup = {
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
    }, e.languages.markup.tag.inside["attr-value"].inside.entity = e.languages.markup.entity, e.languages.markup.doctype.inside["internal-subset"].inside = e.languages.markup, e.hooks.add("wrap", function(i) {
      i.type === "entity" && (i.attributes.title = i.content.replace(/&amp;/, "&"));
    }), Object.defineProperty(e.languages.markup.tag, "addInlined", {
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
      value: function(g, p) {
        var u = {};
        u["language-" + p] = {
          pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
          lookbehind: !0,
          inside: e.languages[p]
        }, u.cdata = /^<!\[CDATA\[|\]\]>$/i;
        var r = {
          "included-cdata": {
            pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
            inside: u
          }
        };
        r["language-" + p] = {
          pattern: /[\s\S]+/,
          inside: e.languages[p]
        };
        var d = {};
        d[g] = {
          pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function() {
            return g;
          }), "i"),
          lookbehind: !0,
          greedy: !0,
          inside: r
        }, e.languages.insertBefore("markup", "cdata", d);
      }
    }), Object.defineProperty(e.languages.markup.tag, "addAttribute", {
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
      value: function(i, g) {
        e.languages.markup.tag.inside["special-attr"].push({
          pattern: RegExp(
            /(^|["'\s])/.source + "(?:" + i + ")" + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
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
                  alias: [g, "language-" + g],
                  inside: e.languages[g]
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
    }), e.languages.html = e.languages.markup, e.languages.mathml = e.languages.markup, e.languages.svg = e.languages.markup, e.languages.xml = e.languages.extend("markup", {}), e.languages.ssml = e.languages.xml, e.languages.atom = e.languages.xml, e.languages.rss = e.languages.xml, function(i) {
      var g = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;
      i.languages.css = {
        comment: /\/\*[\s\S]*?\*\//,
        atrule: {
          pattern: RegExp("@[\\w-](?:" + /[^;{\s"']|\s+(?!\s)/.source + "|" + g.source + ")*?" + /(?:;|(?=\s*\{))/.source),
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
          pattern: RegExp("\\burl\\((?:" + g.source + "|" + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ")\\)", "i"),
          greedy: !0,
          inside: {
            function: /^url/i,
            punctuation: /^\(|\)$/,
            string: {
              pattern: RegExp("^" + g.source + "$"),
              alias: "url"
            }
          }
        },
        selector: {
          pattern: RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|` + g.source + ")*(?=\\s*\\{)"),
          lookbehind: !0
        },
        string: {
          pattern: g,
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
      }, i.languages.css.atrule.inside.rest = i.languages.css;
      var p = i.languages.markup;
      p && (p.tag.addInlined("style", "css"), p.tag.addAttribute("style", "css"));
    }(e), e.languages.clike = {
      comment: [
        {
          pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
          lookbehind: !0,
          greedy: !0
        },
        {
          pattern: /(^|[^\\:])\/\/.*/,
          lookbehind: !0,
          greedy: !0
        }
      ],
      string: {
        pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
        greedy: !0
      },
      "class-name": {
        pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
        lookbehind: !0,
        inside: {
          punctuation: /[.\\]/
        }
      },
      keyword: /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
      boolean: /\b(?:false|true)\b/,
      function: /\b\w+(?=\()/,
      number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
      operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
      punctuation: /[{}[\];(),.:]/
    }, e.languages.javascript = e.languages.extend("clike", {
      "class-name": [
        e.languages.clike["class-name"],
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
    }), e.languages.javascript["class-name"][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/, e.languages.insertBefore("javascript", "keyword", {
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
            inside: e.languages.regex
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
          inside: e.languages.javascript
        },
        {
          pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
          lookbehind: !0,
          inside: e.languages.javascript
        },
        {
          pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
          lookbehind: !0,
          inside: e.languages.javascript
        },
        {
          pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
          lookbehind: !0,
          inside: e.languages.javascript
        }
      ],
      constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/
    }), e.languages.insertBefore("javascript", "string", {
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
              rest: e.languages.javascript
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
    }), e.languages.insertBefore("javascript", "operator", {
      "literal-property": {
        pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
        lookbehind: !0,
        alias: "property"
      }
    }), e.languages.markup && (e.languages.markup.tag.addInlined("script", "javascript"), e.languages.markup.tag.addAttribute(
      /on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
      "javascript"
    )), e.languages.js = e.languages.javascript, function() {
      if (typeof e > "u" || typeof document > "u")
        return;
      Element.prototype.matches || (Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector);
      var i = "Loading…", g = function(w, m) {
        return "✖ Error " + w + " while fetching file: " + m;
      }, p = "✖ Error: File does not exist or is empty", u = {
        js: "javascript",
        py: "python",
        rb: "ruby",
        ps1: "powershell",
        psm1: "powershell",
        sh: "bash",
        bat: "batch",
        h: "c",
        tex: "latex"
      }, r = "data-src-status", d = "loading", $ = "loaded", b = "failed", F = "pre[data-src]:not([" + r + '="' + $ + '"]):not([' + r + '="' + d + '"])';
      function P(w, m, k) {
        var a = new XMLHttpRequest();
        a.open("GET", w, !0), a.onreadystatechange = function() {
          a.readyState == 4 && (a.status < 400 && a.responseText ? m(a.responseText) : a.status >= 400 ? k(g(a.status, a.statusText)) : k(p));
        }, a.send(null);
      }
      function x(w) {
        var m = /^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(w || "");
        if (m) {
          var k = Number(m[1]), a = m[2], n = m[3];
          return a ? n ? [k, Number(n)] : [k, void 0] : [k, k];
        }
      }
      e.hooks.add("before-highlightall", function(w) {
        w.selector += ", " + F;
      }), e.hooks.add("before-sanity-check", function(w) {
        var m = (
          /** @type {HTMLPreElement} */
          w.element
        );
        if (m.matches(F)) {
          w.code = "", m.setAttribute(r, d);
          var k = m.appendChild(document.createElement("CODE"));
          k.textContent = i;
          var a = m.getAttribute("data-src"), n = w.language;
          if (n === "none") {
            var l = (/\.(\w+)$/.exec(a) || [, "none"])[1];
            n = u[l] || l;
          }
          e.util.setLanguage(k, n), e.util.setLanguage(m, n);
          var o = e.plugins.autoloader;
          o && o.loadLanguages(n), P(
            a,
            function(c) {
              m.setAttribute(r, $);
              var h = x(m.getAttribute("data-range"));
              if (h) {
                var y = c.split(/\r\n?|\n/g), f = h[0], A = h[1] == null ? y.length : h[1];
                f < 0 && (f += y.length), f = Math.max(0, Math.min(f - 1, y.length)), A < 0 && (A += y.length), A = Math.max(0, Math.min(A, y.length)), c = y.slice(f, A).join(`
`), m.hasAttribute("data-start") || m.setAttribute("data-start", String(f + 1));
              }
              k.textContent = c, e.highlightElement(k);
            },
            function(c) {
              m.setAttribute(r, b), k.textContent = c;
            }
          );
        }
      }), e.plugins.fileHighlight = {
        /**
         * Executes the File Highlight plugin for all matching `pre` elements under the given container.
         *
         * Note: Elements which are already loaded or currently loading will not be touched by this method.
         *
         * @param {ParentNode} [container=document]
         */
        highlight: function(m) {
          for (var k = (m || document).querySelectorAll(F), a = 0, n; n = k[a++]; )
            e.highlightElement(n);
        }
      };
      var v = !1;
      e.fileHighlight = function() {
        v || (console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."), v = !0), e.plugins.fileHighlight.highlight.apply(this, arguments);
      };
    }();
  }(Y)), Y.exports;
}
var $e = ve();
const O = /* @__PURE__ */ Fe($e);
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
var re = {}, se;
function xe() {
  return se || (se = 1, function(t) {
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
    var s = t.languages.extend("typescript", {});
    delete s["class-name"], t.languages.typescript["class-name"].inside = s, t.languages.insertBefore("typescript", "function", {
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
            inside: s
          }
        }
      }
    }), t.languages.ts = t.languages.typescript;
  }(Prism)), re;
}
xe();
var ie = {}, ue;
function we() {
  return ue || (ue = 1, Prism.languages.python = {
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
  }, Prism.languages.python["string-interpolation"].inside.interpolation.inside.rest = Prism.languages.python, Prism.languages.py = Prism.languages.python), ie;
}
we();
(function(t) {
  var s = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;
  t.languages.css = {
    comment: /\/\*[\s\S]*?\*\//,
    atrule: {
      pattern: RegExp("@[\\w-](?:" + /[^;{\s"']|\s+(?!\s)/.source + "|" + s.source + ")*?" + /(?:;|(?=\s*\{))/.source),
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
      pattern: RegExp("\\burl\\((?:" + s.source + "|" + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ")\\)", "i"),
      greedy: !0,
      inside: {
        function: /^url/i,
        punctuation: /^\(|\)$/,
        string: {
          pattern: RegExp("^" + s.source + "$"),
          alias: "url"
        }
      }
    },
    selector: {
      pattern: RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|` + s.source + ")*(?=\\s*\\{)"),
      lookbehind: !0
    },
    string: {
      pattern: s,
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
  value: function(s, e) {
    var i = {};
    i["language-" + e] = {
      pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
      lookbehind: !0,
      inside: Prism.languages[e]
    }, i.cdata = /^<!\[CDATA\[|\]\]>$/i;
    var g = {
      "included-cdata": {
        pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
        inside: i
      }
    };
    g["language-" + e] = {
      pattern: /[\s\S]+/,
      inside: Prism.languages[e]
    };
    var p = {};
    p[s] = {
      pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function() {
        return s;
      }), "i"),
      lookbehind: !0,
      greedy: !0,
      inside: g
    }, Prism.languages.insertBefore("markup", "cdata", p);
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
  value: function(t, s) {
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
              alias: [s, "language-" + s],
              inside: Prism.languages[s]
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
function ke() {
  let t = !1, s = "text", e = [];
  return {
    startOrEnd(i, g) {
      const p = i.trim();
      if (!/^```/.test(p)) return !1;
      if (t) {
        const u = e.join(`
`), r = O.highlight(
          u,
          O.languages[s] || O.languages.plain,
          s
        );
        g.push(`<pre class="language-${s}"><code>${r}</code></pre>`), t = !1, e = [];
      } else
        t = !0, s = p.slice(3).trim() || "text", e = [];
      return !0;
    },
    handleLine(i) {
      return t ? (e.push(i), !0) : !1;
    },
    isInBlock() {
      return t;
    },
    // 文档末尾若代码块未闭合，强制关闭
    flush(i) {
      if (t) {
        const g = e.join(`
`), p = O.highlight(
          g,
          O.languages[s] || O.languages.plain,
          s
        );
        i.push(`<pre class="language-${s}"><code>${p}</code></pre>`), t = !1, e = [];
      }
    }
  };
}
function Ae() {
  let t = !1, s = [];
  return {
    startOrEnd(e, i) {
      return e.trim() !== "$$" ? !1 : (t ? (i.push(z(s.join(`
`), !0)), t = !1, s = []) : (t = !0, s = []), !0);
    },
    handleLine(e) {
      return t ? (s.push(e), !0) : !1;
    },
    isInBlock() {
      return t;
    },
    flush(e) {
      t && (e.push(z(s.join(`
`), !0)), t = !1, s = []);
    }
  };
}
function _e() {
  let t = !1, s = [];
  return {
    startOrEnd(e, i) {
      const g = e.trim();
      return g === ":::three" ? (t = !0, s = [], !0) : g === ":::" && t ? (i.push(
        `<div class="three-preview" data-objects='${JSON.stringify(s)}'></div>`
      ), t = !1, s = [], !0) : !1;
    },
    handleObject(e) {
      if (!t) return !1;
      const g = e.trim().match(
        /^(#{1,6})\s*(cube|sphere|cone|cylinder|torus|plane|dodecahedron|icosahedron|octahedron)\s*\(([^,]+?)(?:,\s*(\d+(?:\.\d+)?))?\)/i
      );
      if (g) {
        const p = g[2].toLowerCase(), u = g[3].trim(), r = parseFloat(g[4]) || 1;
        s.push({ type: p, color: u, size: r });
      }
      return !0;
    },
    isInBlock() {
      return t;
    },
    flush(e) {
      t && (e.push(
        `<div class="three-preview" data-objects='${JSON.stringify(s)}'></div>`
      ), t = !1, s = []);
    }
  };
}
function Pe(t, s, e) {
  if (!(Object.keys(s).length === 0 && Object.keys(e).length === 0)) {
    t.push('<hr /><section class="footnotes"><ol>');
    for (const i in s)
      t.push(
        `<li id="footnote-${i}">${s[i]} <a href="#ref-${i}">↩</a></li>`
      );
    for (const i in e)
      t.push(
        `<li id="footnote-${i}">${e[i]} <a href="#ref-${i}">↩</a></li>`
      );
    t.push("</ol></section>");
  }
}
function Se(t) {
  if (!t) return "";
  const s = t.split(`
`), e = [], i = [], g = [], p = {}, u = {}, r = ke(), d = Ae(), $ = _e(), b = me(), F = be(), P = (x) => {
    for (let v = e.length - 1; v >= 0; v--)
      if (typeof e[v] == "string" && e[v].startsWith("<") && !e[v].startsWith("</")) {
        e[v] = e[v].replace(/^(<\w+)/, `$1 data-line="${x}"`);
        break;
      }
  };
  for (let x = 0; x < s.length; x++) {
    const v = s[x];
    if (/^(\*\s*\*\s*\*|---|___)\s*$/.test(v)) {
      C(g, e, u), e.push("<hr />"), P(x);
      continue;
    }
    if (r.startOrEnd(v, e)) {
      C(g, e, u), r.isInBlock() || P(x);
      continue;
    }
    if (r.isInBlock()) {
      r.handleLine(v);
      continue;
    }
    if (d.startOrEnd(v, e)) {
      C(g, e, u), d.isInBlock() || P(x);
      continue;
    }
    if (d.isInBlock()) {
      d.handleLine(v);
      continue;
    }
    if ($.startOrEnd(v, e)) {
      C(g, e, u), $.isInBlock() || P(x);
      continue;
    }
    if ($.isInBlock()) {
      $.handleObject(v);
      continue;
    }
    if (v.trim().startsWith("|")) {
      C(g, e, u), b.isInTable() || b.start(x), b.addRow(v);
      continue;
    } else b.isInTable() && b.parse(e);
    if (F.handle(v, e, x)) {
      C(g, e, u);
      continue;
    }
    if (ye(v, e, x)) {
      C(g, e, u);
      continue;
    }
    if (he(v, e, i, x)) {
      C(g, e, u);
      continue;
    }
    if (v.trim() === "") {
      C(g, e, u), i.length > 0 && te(e, i), F.flush(e);
      let w = 0, m = x + 1;
      for (; m < s.length && s[m].trim() === ""; )
        w++, m++;
      for (let k = 0; k < w; k++)
        e.push("<p><br /></p>");
      x = m - 1;
    } else
      g.push({ text: v, lineNo: x });
  }
  return C(g, e, u), te(e, i), F.flush(e), b.isInTable() && b.parse(e), r.flush(e), d.flush(e), $.flush(e), Pe(e, p, u), e.join(`
`);
}
export {
  Se as parseMarkdown
};
