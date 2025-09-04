import Ce from "katex";
function P(a = "") {
  return a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function ee(a = "") {
  const c = {};
  let e = 0;
  return a = a.replace(/<[^>]+>/g, (r) => {
    const u = `@@HTML${e}@@`;
    return c[u] = r, e++, u;
  }), { text: a, map: c };
}
function Z(a = "", c = {}) {
  return a.replace(/@@HTML(\d+)@@/g, (e, r) => c[`@@HTML${r}@@`] || "");
}
function te(a = "") {
  const c = {};
  let e = 0;
  return a = a.replace(/`([^`\n]+)`/g, (r, u) => {
    const d = `@@CODE${e}@@`;
    return c[d] = u, e++, d;
  }), { text: a, map: c };
}
function H(a = "", c = {}) {
  return a.replace(
    /@@CODE(\d+)@@/g,
    (e, r) => `<code class="language-plaintext">${P(c[`@@CODE${r}@@`] || "")}</code>`
  );
}
function G(a, c = !1) {
  try {
    return Ce.renderToString(a, {
      throwOnError: !1,
      displayMode: c,
      output: "html"
    });
  } catch {
    return `<code class="katex-error">${P(a)}</code>`;
  }
}
function je(a = "") {
  const c = [], e = /(\w+)=(".*?"|'.*?'|[^\s"']+)/g;
  let r;
  for (; (r = e.exec(a)) !== null; ) {
    const u = r[1];
    let d = r[2];
    (d.startsWith('"') && d.endsWith('"') || d.startsWith("'") && d.endsWith("'")) && (d = d.slice(1, -1)), c.push(`${u}="${P(d)}"`);
  }
  return c.join(" ");
}
function j(a, c, e) {
  if (a.length === 0) return;
  let r = a.join(`
`), { text: u, map: d } = ee(r), { text: f, map: s } = te(u), b = P(f).replace(
    new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
    ($, y) => G(y.trim(), !1)
  );
  b = b.replace(/\[\^(.+?)\]\((.+?)\)/g, ($, y, A) => {
    const S = y.trim() || `inline-footnote-${Object.keys(e).length + 1}`;
    return e[S] = P(A), `<sup id="ref-${S}"><a href="#footnote-${S}">${S}</a></sup>`;
  }).replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, ($, y, A, S) => {
    const T = S ? " " + je(S) : "";
    return `<img alt="${P(y)}" src="${P(A)}"${T} />`;
  }).replace(/\[([^\]]+?)\]\(([^)]+)\)/g, ($, y, A) => `<a href="${P(A)}" target="_blank">${P(y)}</a>`).replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/~~(.+?)~~/g, "<del>$1</del>").replace(/\[\^(.+?)\]/g, ($, y) => `<sup id="ref-${y}"><a href="#ref-${y}">${y}</a></sup>`), b = b.replace(/\n/g, "<br />"), b = H(b, s), b = Z(b, d), c.push(`<p>${b}</p>`), a.length = 0;
}
function Me(a, c) {
  for (; c.length > 0; ) {
    const { tag: e } = c.pop();
    a.push(`</${e}>`);
  }
}
function ze(a, c, e) {
  const r = a.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
  if (!r) return !1;
  const u = r[1].length, d = r[2], f = r[3], s = Math.floor(u / 4), b = /^\d+\./.test(d) ? "ol" : "ul";
  for (; e.length > s + 1; ) {
    const { tag: m } = e.pop();
    c.push(`</${m}>`);
  }
  if (e.length === 0 || s >= e.length) {
    if (e.length > 0 && e[e.length - 1].tag !== b) {
      const { tag: m } = e.pop();
      c.push(`</${m}>`);
    }
    e.push({ tag: b, indent: u }), c.push(`<${b}>`);
  }
  const { text: $, map: y } = ee(f), { text: A, map: S } = te($), T = A.match(/^\[( |x|X)\]\s+(.*)/);
  if (T) {
    const m = T[1].toLowerCase() === "x", F = Z(H(P(T[2]), S), y);
    c.push(`<li><input type="checkbox" ${m ? "checked" : ""} > ${F}</li>`);
  } else {
    let m = P(A);
    m = m.replace(
      new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
      (F, w) => G(w, !1)
    ), m = H(m, S), m = Z(m, y), c.push(`<li>${m}</li>`);
  }
  return !0;
}
let M = [], W = !1;
function Le() {
  W = !0, M = [];
}
function Oe(a) {
  W && M.push(a.trim());
}
function de(a) {
  if (!W || M.length === 0) return;
  const c = M[0].split("|").map((r) => r.trim()).filter((r) => r !== ""), e = [];
  if (M.length > 1) {
    const r = M[1].split("|").map((u) => u.trim()).filter((u) => u !== "");
    for (const u of r)
      /^:-+:$/.test(u) ? e.push("center") : /^-+:$/.test(u) ? e.push("right") : /^:-+$/.test(u) ? e.push("left") : e.push("");
  }
  a.push("<table>"), a.push("<thead><tr>");
  for (let r = 0; r < c.length; r++) {
    const u = e[r] ? ` style="text-align:${e[r]}"` : "";
    a.push(`<th${u}>${P(c[r])}</th>`);
  }
  a.push("</tr></thead><tbody>");
  for (let r = 2; r < M.length; r++) {
    const u = M[r].split("|").map((d) => d.trim()).filter((d) => d !== "");
    a.push("<tr>");
    for (let d = 0; d < c.length; d++) {
      const f = e[d] ? ` style="text-align:${e[d]}"` : "";
      a.push(`<td${f}>${P(u[d] || "")}</td>`);
    }
    a.push("</tr>");
  }
  a.push("</tbody></table>"), M = [], W = !1;
}
function se() {
  return W;
}
let le = !1, O = 0;
function _e(a) {
  if (O > 0) {
    for (let c = 0; c < O; c++)
      a.push("</blockquote>");
    O = 0, le = !1;
  }
}
function Ie(a, c) {
  const e = a.match(/^(\s*>+\s*)(.*)/);
  if (!e)
    return le && _e(c), !1;
  const u = e[1].replace(/\s/g, "").length, d = e[2].trim();
  if (u !== O) {
    if (u > O)
      for (let f = O; f < u; f++)
        c.push("<blockquote>");
    else
      for (let f = O; f > u; f--)
        c.push("</blockquote>");
    O = u;
  }
  if (d) {
    let { text: f, map: s } = ee(d), { text: v, map: b } = te(f), $ = P(v);
    $ = $.replace(
      new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
      (y, A) => G(A, !1)
    ), $ = H($, b), $ = Z($, s), c.push(`<p>${$}</p>`);
  }
  return le = !0, !0;
}
function De(a, c) {
  const e = a.trim().match(/^(#{1,5})\s+(.*)/);
  if (!e) return !1;
  const r = e[1].length;
  let u = e[2], { text: d, map: f } = ee(u), { text: s, map: v } = te(d), b = P(s);
  return b = b.replace(
    new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
    ($, y) => G(y, !1)
  ), b = H(b, v), b = Z(b, f), c.push(`<h${r}>${b}</h${r}>`), !0;
}
var fe = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Re(a) {
  return a && a.__esModule && Object.prototype.hasOwnProperty.call(a, "default") ? a.default : a;
}
var ie = { exports: {} }, he;
function qe() {
  return he || (he = 1, function(a) {
    var c = typeof window < "u" ? window : typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope ? self : {};
    /**
     * Prism: Lightweight, robust, elegant syntax highlighting
     *
     * @license MIT <https://opensource.org/licenses/MIT>
     * @author Lea Verou <https://lea.verou.me>
     * @namespace
     * @public
     */
    var e = function(r) {
      var u = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i, d = 0, f = {}, s = {
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
        manual: r.Prism && r.Prism.manual,
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
        disableWorkerMessageHandler: r.Prism && r.Prism.disableWorkerMessageHandler,
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
          encode: function n(t) {
            return t instanceof v ? new v(t.type, n(t.content), t.alias) : Array.isArray(t) ? t.map(n) : t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
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
          type: function(n) {
            return Object.prototype.toString.call(n).slice(8, -1);
          },
          /**
           * Returns a unique number for the given object. Later calls will still return the same number.
           *
           * @param {Object} obj
           * @returns {number}
           */
          objId: function(n) {
            return n.__id || Object.defineProperty(n, "__id", { value: ++d }), n.__id;
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
          clone: function n(t, i) {
            i = i || {};
            var l, o;
            switch (s.util.type(t)) {
              case "Object":
                if (o = s.util.objId(t), i[o])
                  return i[o];
                l = /** @type {Record<string, any>} */
                {}, i[o] = l;
                for (var p in t)
                  t.hasOwnProperty(p) && (l[p] = n(t[p], i));
                return (
                  /** @type {any} */
                  l
                );
              case "Array":
                return o = s.util.objId(t), i[o] ? i[o] : (l = [], i[o] = l, /** @type {Array} */
                /** @type {any} */
                t.forEach(function(h, g) {
                  l[g] = n(h, i);
                }), /** @type {any} */
                l);
              default:
                return t;
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
          getLanguage: function(n) {
            for (; n; ) {
              var t = u.exec(n.className);
              if (t)
                return t[1].toLowerCase();
              n = n.parentElement;
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
          setLanguage: function(n, t) {
            n.className = n.className.replace(RegExp(u, "gi"), ""), n.classList.add("language-" + t);
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
            } catch (l) {
              var n = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(l.stack) || [])[1];
              if (n) {
                var t = document.getElementsByTagName("script");
                for (var i in t)
                  if (t[i].src == n)
                    return t[i];
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
          isActive: function(n, t, i) {
            for (var l = "no-" + t; n; ) {
              var o = n.classList;
              if (o.contains(t))
                return !0;
              if (o.contains(l))
                return !1;
              n = n.parentElement;
            }
            return !!i;
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
          plain: f,
          plaintext: f,
          text: f,
          txt: f,
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
          extend: function(n, t) {
            var i = s.util.clone(s.languages[n]);
            for (var l in t)
              i[l] = t[l];
            return i;
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
          insertBefore: function(n, t, i, l) {
            l = l || /** @type {any} */
            s.languages;
            var o = l[n], p = {};
            for (var h in o)
              if (o.hasOwnProperty(h)) {
                if (h == t)
                  for (var g in i)
                    i.hasOwnProperty(g) && (p[g] = i[g]);
                i.hasOwnProperty(h) || (p[h] = o[h]);
              }
            var x = l[n];
            return l[n] = p, s.languages.DFS(s.languages, function(k, z) {
              z === x && k != n && (this[k] = p);
            }), p;
          },
          // Traverse a language definition with Depth First Search
          DFS: function n(t, i, l, o) {
            o = o || {};
            var p = s.util.objId;
            for (var h in t)
              if (t.hasOwnProperty(h)) {
                i.call(t, h, t[h], l || h);
                var g = t[h], x = s.util.type(g);
                x === "Object" && !o[p(g)] ? (o[p(g)] = !0, n(g, i, null, o)) : x === "Array" && !o[p(g)] && (o[p(g)] = !0, n(g, i, h, o));
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
        highlightAll: function(n, t) {
          s.highlightAllUnder(document, n, t);
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
        highlightAllUnder: function(n, t, i) {
          var l = {
            callback: i,
            container: n,
            selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
          };
          s.hooks.run("before-highlightall", l), l.elements = Array.prototype.slice.apply(l.container.querySelectorAll(l.selector)), s.hooks.run("before-all-elements-highlight", l);
          for (var o = 0, p; p = l.elements[o++]; )
            s.highlightElement(p, t === !0, l.callback);
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
        highlightElement: function(n, t, i) {
          var l = s.util.getLanguage(n), o = s.languages[l];
          s.util.setLanguage(n, l);
          var p = n.parentElement;
          p && p.nodeName.toLowerCase() === "pre" && s.util.setLanguage(p, l);
          var h = n.textContent, g = {
            element: n,
            language: l,
            grammar: o,
            code: h
          };
          function x(z) {
            g.highlightedCode = z, s.hooks.run("before-insert", g), g.element.innerHTML = g.highlightedCode, s.hooks.run("after-highlight", g), s.hooks.run("complete", g), i && i.call(g.element);
          }
          if (s.hooks.run("before-sanity-check", g), p = g.element.parentElement, p && p.nodeName.toLowerCase() === "pre" && !p.hasAttribute("tabindex") && p.setAttribute("tabindex", "0"), !g.code) {
            s.hooks.run("complete", g), i && i.call(g.element);
            return;
          }
          if (s.hooks.run("before-highlight", g), !g.grammar) {
            x(s.util.encode(g.code));
            return;
          }
          if (t && r.Worker) {
            var k = new Worker(s.filename);
            k.onmessage = function(z) {
              x(z.data);
            }, k.postMessage(JSON.stringify({
              language: g.language,
              code: g.code,
              immediateClose: !0
            }));
          } else
            x(s.highlight(g.code, g.grammar, g.language));
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
        highlight: function(n, t, i) {
          var l = {
            code: n,
            grammar: t,
            language: i
          };
          if (s.hooks.run("before-tokenize", l), !l.grammar)
            throw new Error('The language "' + l.language + '" has no grammar.');
          return l.tokens = s.tokenize(l.code, l.grammar), s.hooks.run("after-tokenize", l), v.stringify(s.util.encode(l.tokens), l.language);
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
        tokenize: function(n, t) {
          var i = t.rest;
          if (i) {
            for (var l in i)
              t[l] = i[l];
            delete t.rest;
          }
          var o = new y();
          return A(o, o.head, n), $(n, o, t, o.head, 0), T(o);
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
          add: function(n, t) {
            var i = s.hooks.all;
            i[n] = i[n] || [], i[n].push(t);
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
          run: function(n, t) {
            var i = s.hooks.all[n];
            if (!(!i || !i.length))
              for (var l = 0, o; o = i[l++]; )
                o(t);
          }
        },
        Token: v
      };
      r.Prism = s;
      function v(n, t, i, l) {
        this.type = n, this.content = t, this.alias = i, this.length = (l || "").length | 0;
      }
      v.stringify = function n(t, i) {
        if (typeof t == "string")
          return t;
        if (Array.isArray(t)) {
          var l = "";
          return t.forEach(function(x) {
            l += n(x, i);
          }), l;
        }
        var o = {
          type: t.type,
          content: n(t.content, i),
          tag: "span",
          classes: ["token", t.type],
          attributes: {},
          language: i
        }, p = t.alias;
        p && (Array.isArray(p) ? Array.prototype.push.apply(o.classes, p) : o.classes.push(p)), s.hooks.run("wrap", o);
        var h = "";
        for (var g in o.attributes)
          h += " " + g + '="' + (o.attributes[g] || "").replace(/"/g, "&quot;") + '"';
        return "<" + o.tag + ' class="' + o.classes.join(" ") + '"' + h + ">" + o.content + "</" + o.tag + ">";
      };
      function b(n, t, i, l) {
        n.lastIndex = t;
        var o = n.exec(i);
        if (o && l && o[1]) {
          var p = o[1].length;
          o.index += p, o[0] = o[0].slice(p);
        }
        return o;
      }
      function $(n, t, i, l, o, p) {
        for (var h in i)
          if (!(!i.hasOwnProperty(h) || !i[h])) {
            var g = i[h];
            g = Array.isArray(g) ? g : [g];
            for (var x = 0; x < g.length; ++x) {
              if (p && p.cause == h + "," + x)
                return;
              var k = g[x], z = k.inside, oe = !!k.lookbehind, ce = !!k.greedy, Pe = k.alias;
              if (ce && !k.pattern.global) {
                var Se = k.pattern.toString().match(/[imsuy]*$/)[0];
                k.pattern = RegExp(k.pattern.source, Se + "g");
              }
              for (var ge = k.pattern || k, _ = l.next, C = o; _ !== t.tail && !(p && C >= p.reach); C += _.value.length, _ = _.next) {
                var I = _.value;
                if (t.length > n.length)
                  return;
                if (!(I instanceof v)) {
                  var U = 1, E;
                  if (ce) {
                    if (E = b(ge, C, n, oe), !E || E.index >= n.length)
                      break;
                    var N = E.index, Ee = E.index + E[0].length, L = C;
                    for (L += _.value.length; N >= L; )
                      _ = _.next, L += _.value.length;
                    if (L -= _.value.length, C = L, _.value instanceof v)
                      continue;
                    for (var D = _; D !== t.tail && (L < Ee || typeof D.value == "string"); D = D.next)
                      U++, L += D.value.length;
                    U--, I = n.slice(C, L), E.index -= C;
                  } else if (E = b(ge, 0, I, oe), !E)
                    continue;
                  var N = E.index, J = E[0], ne = I.slice(0, N), pe = I.slice(N + J.length), ae = C + I.length;
                  p && ae > p.reach && (p.reach = ae);
                  var X = _.prev;
                  ne && (X = A(t, X, ne), C += ne.length), S(t, X, U);
                  var Te = new v(h, z ? s.tokenize(J, z) : J, Pe, J);
                  if (_ = A(t, X, Te), pe && A(t, _, pe), U > 1) {
                    var re = {
                      cause: h + "," + x,
                      reach: ae
                    };
                    $(n, t, i, _.prev, C, re), p && re.reach > p.reach && (p.reach = re.reach);
                  }
                }
              }
            }
          }
      }
      function y() {
        var n = { value: null, prev: null, next: null }, t = { value: null, prev: n, next: null };
        n.next = t, this.head = n, this.tail = t, this.length = 0;
      }
      function A(n, t, i) {
        var l = t.next, o = { value: i, prev: t, next: l };
        return t.next = o, l.prev = o, n.length++, o;
      }
      function S(n, t, i) {
        for (var l = t.next, o = 0; o < i && l !== n.tail; o++)
          l = l.next;
        t.next = l, l.prev = t, n.length -= o;
      }
      function T(n) {
        for (var t = [], i = n.head.next; i !== n.tail; )
          t.push(i.value), i = i.next;
        return t;
      }
      if (!r.document)
        return r.addEventListener && (s.disableWorkerMessageHandler || r.addEventListener("message", function(n) {
          var t = JSON.parse(n.data), i = t.language, l = t.code, o = t.immediateClose;
          r.postMessage(s.highlight(l, s.languages[i], i)), o && r.close();
        }, !1)), s;
      var m = s.util.currentScript();
      m && (s.filename = m.src, m.hasAttribute("data-manual") && (s.manual = !0));
      function F() {
        s.manual || s.highlightAll();
      }
      if (!s.manual) {
        var w = document.readyState;
        w === "loading" || w === "interactive" && m && m.defer ? document.addEventListener("DOMContentLoaded", F) : window.requestAnimationFrame ? window.requestAnimationFrame(F) : window.setTimeout(F, 16);
      }
      return s;
    }(c);
    a.exports && (a.exports = e), typeof fe < "u" && (fe.Prism = e), e.languages.markup = {
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
    }, e.languages.markup.tag.inside["attr-value"].inside.entity = e.languages.markup.entity, e.languages.markup.doctype.inside["internal-subset"].inside = e.languages.markup, e.hooks.add("wrap", function(r) {
      r.type === "entity" && (r.attributes.title = r.content.replace(/&amp;/, "&"));
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
      value: function(u, d) {
        var f = {};
        f["language-" + d] = {
          pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
          lookbehind: !0,
          inside: e.languages[d]
        }, f.cdata = /^<!\[CDATA\[|\]\]>$/i;
        var s = {
          "included-cdata": {
            pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
            inside: f
          }
        };
        s["language-" + d] = {
          pattern: /[\s\S]+/,
          inside: e.languages[d]
        };
        var v = {};
        v[u] = {
          pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function() {
            return u;
          }), "i"),
          lookbehind: !0,
          greedy: !0,
          inside: s
        }, e.languages.insertBefore("markup", "cdata", v);
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
      value: function(r, u) {
        e.languages.markup.tag.inside["special-attr"].push({
          pattern: RegExp(
            /(^|["'\s])/.source + "(?:" + r + ")" + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
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
                  alias: [u, "language-" + u],
                  inside: e.languages[u]
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
    }), e.languages.html = e.languages.markup, e.languages.mathml = e.languages.markup, e.languages.svg = e.languages.markup, e.languages.xml = e.languages.extend("markup", {}), e.languages.ssml = e.languages.xml, e.languages.atom = e.languages.xml, e.languages.rss = e.languages.xml, function(r) {
      var u = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;
      r.languages.css = {
        comment: /\/\*[\s\S]*?\*\//,
        atrule: {
          pattern: RegExp("@[\\w-](?:" + /[^;{\s"']|\s+(?!\s)/.source + "|" + u.source + ")*?" + /(?:;|(?=\s*\{))/.source),
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
          pattern: RegExp("\\burl\\((?:" + u.source + "|" + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ")\\)", "i"),
          greedy: !0,
          inside: {
            function: /^url/i,
            punctuation: /^\(|\)$/,
            string: {
              pattern: RegExp("^" + u.source + "$"),
              alias: "url"
            }
          }
        },
        selector: {
          pattern: RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|` + u.source + ")*(?=\\s*\\{)"),
          lookbehind: !0
        },
        string: {
          pattern: u,
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
      }, r.languages.css.atrule.inside.rest = r.languages.css;
      var d = r.languages.markup;
      d && (d.tag.addInlined("style", "css"), d.tag.addAttribute("style", "css"));
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
      var r = "Loading…", u = function(m, F) {
        return "✖ Error " + m + " while fetching file: " + F;
      }, d = "✖ Error: File does not exist or is empty", f = {
        js: "javascript",
        py: "python",
        rb: "ruby",
        ps1: "powershell",
        psm1: "powershell",
        sh: "bash",
        bat: "batch",
        h: "c",
        tex: "latex"
      }, s = "data-src-status", v = "loading", b = "loaded", $ = "failed", y = "pre[data-src]:not([" + s + '="' + b + '"]):not([' + s + '="' + v + '"])';
      function A(m, F, w) {
        var n = new XMLHttpRequest();
        n.open("GET", m, !0), n.onreadystatechange = function() {
          n.readyState == 4 && (n.status < 400 && n.responseText ? F(n.responseText) : n.status >= 400 ? w(u(n.status, n.statusText)) : w(d));
        }, n.send(null);
      }
      function S(m) {
        var F = /^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(m || "");
        if (F) {
          var w = Number(F[1]), n = F[2], t = F[3];
          return n ? t ? [w, Number(t)] : [w, void 0] : [w, w];
        }
      }
      e.hooks.add("before-highlightall", function(m) {
        m.selector += ", " + y;
      }), e.hooks.add("before-sanity-check", function(m) {
        var F = (
          /** @type {HTMLPreElement} */
          m.element
        );
        if (F.matches(y)) {
          m.code = "", F.setAttribute(s, v);
          var w = F.appendChild(document.createElement("CODE"));
          w.textContent = r;
          var n = F.getAttribute("data-src"), t = m.language;
          if (t === "none") {
            var i = (/\.(\w+)$/.exec(n) || [, "none"])[1];
            t = f[i] || i;
          }
          e.util.setLanguage(w, t), e.util.setLanguage(F, t);
          var l = e.plugins.autoloader;
          l && l.loadLanguages(t), A(
            n,
            function(o) {
              F.setAttribute(s, b);
              var p = S(F.getAttribute("data-range"));
              if (p) {
                var h = o.split(/\r\n?|\n/g), g = p[0], x = p[1] == null ? h.length : p[1];
                g < 0 && (g += h.length), g = Math.max(0, Math.min(g - 1, h.length)), x < 0 && (x += h.length), x = Math.max(0, Math.min(x, h.length)), o = h.slice(g, x).join(`
`), F.hasAttribute("data-start") || F.setAttribute("data-start", String(g + 1));
              }
              w.textContent = o, e.highlightElement(w);
            },
            function(o) {
              F.setAttribute(s, $), w.textContent = o;
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
        highlight: function(F) {
          for (var w = (F || document).querySelectorAll(y), n = 0, t; t = w[n++]; )
            e.highlightElement(t);
        }
      };
      var T = !1;
      e.fileHighlight = function() {
        T || (console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."), T = !0), e.plugins.fileHighlight.highlight.apply(this, arguments);
      };
    }();
  }(ie)), ie.exports;
}
var Be = qe();
const ue = /* @__PURE__ */ Re(Be);
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
var me = {}, be;
function Ze() {
  return be || (be = 1, function(a) {
    a.languages.typescript = a.languages.extend("javascript", {
      "class-name": {
        pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,
        lookbehind: !0,
        greedy: !0,
        inside: null
        // see below
      },
      builtin: /\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/
    }), a.languages.typescript.keyword.push(
      /\b(?:abstract|declare|is|keyof|readonly|require)\b/,
      // keywords that have to be followed by an identifier
      /\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,
      // This is for `import type *, {}`
      /\btype\b(?=\s*(?:[\{*]|$))/
    ), delete a.languages.typescript.parameter, delete a.languages.typescript["literal-property"];
    var c = a.languages.extend("typescript", {});
    delete c["class-name"], a.languages.typescript["class-name"].inside = c, a.languages.insertBefore("typescript", "function", {
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
            inside: c
          }
        }
      }
    }), a.languages.ts = a.languages.typescript;
  }(Prism)), me;
}
Ze();
var Fe = {}, ye;
function He() {
  return ye || (ye = 1, Prism.languages.python = {
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
  }, Prism.languages.python["string-interpolation"].inside.interpolation.inside.rest = Prism.languages.python, Prism.languages.py = Prism.languages.python), Fe;
}
He();
(function(a) {
  var c = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;
  a.languages.css = {
    comment: /\/\*[\s\S]*?\*\//,
    atrule: {
      pattern: RegExp("@[\\w-](?:" + /[^;{\s"']|\s+(?!\s)/.source + "|" + c.source + ")*?" + /(?:;|(?=\s*\{))/.source),
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
      pattern: RegExp("\\burl\\((?:" + c.source + "|" + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ")\\)", "i"),
      greedy: !0,
      inside: {
        function: /^url/i,
        punctuation: /^\(|\)$/,
        string: {
          pattern: RegExp("^" + c.source + "$"),
          alias: "url"
        }
      }
    },
    selector: {
      pattern: RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|` + c.source + ")*(?=\\s*\\{)"),
      lookbehind: !0
    },
    string: {
      pattern: c,
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
  }, a.languages.css.atrule.inside.rest = a.languages.css;
  var e = a.languages.markup;
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
Prism.hooks.add("wrap", function(a) {
  a.type === "entity" && (a.attributes.title = a.content.replace(/&amp;/, "&"));
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
  value: function(c, e) {
    var r = {};
    r["language-" + e] = {
      pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
      lookbehind: !0,
      inside: Prism.languages[e]
    }, r.cdata = /^<!\[CDATA\[|\]\]>$/i;
    var u = {
      "included-cdata": {
        pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
        inside: r
      }
    };
    u["language-" + e] = {
      pattern: /[\s\S]+/,
      inside: Prism.languages[e]
    };
    var d = {};
    d[c] = {
      pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function() {
        return c;
      }), "i"),
      lookbehind: !0,
      greedy: !0,
      inside: u
    }, Prism.languages.insertBefore("markup", "cdata", d);
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
  value: function(a, c) {
    Prism.languages.markup.tag.inside["special-attr"].push({
      pattern: RegExp(
        /(^|["'\s])/.source + "(?:" + a + ")" + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
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
              alias: [c, "language-" + c],
              inside: Prism.languages[c]
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
let R = !1, Y = "text", K = [];
function xe(a, c) {
  const e = a.trim();
  if (!/^```/.test(e)) return !1;
  if (R) {
    const r = K.join(`
`), u = ue.highlight(
      r,
      ue.languages[Y] || ue.languages.text,
      Y
    );
    c.push(`<pre class="language-${Y}"><code>${u}</code></pre>`), R = !1, K = [];
  } else
    R = !0, Y = e.slice(3).trim() || "text", K = [];
  return !0;
}
function We(a) {
  return R ? (K.push(a), !0) : !1;
}
function ve() {
  return R;
}
let q = !1, Q = [];
function $e(a, c) {
  return a.trim() !== "$$" ? !1 : (q ? (c.push(G(Q.join(`
`), !0)), q = !1, Q = []) : (q = !0, Q = []), !0);
}
function Ge(a) {
  return q ? (Q.push(a), !0) : !1;
}
function we() {
  return q;
}
let B = !1, V = [];
function Ae(a, c) {
  const e = a.trim();
  return e === ":::three" ? (B = !0, V = [], !0) : e === ":::" && B ? (c.push(
    `<div class="three-js-container" data-objects='${JSON.stringify(V)}'></div>`
  ), B = !1, V = [], !0) : !1;
}
function Ue(a) {
  if (!B) return !1;
  const e = a.trim().match(
    /^(#{1,5})\s*(cube|sphere|cone|cylinder|torus|plane|dodecahedron|icosahedron|octahedron)\s*\(([^,]+?)(?:,\s*(\d+(?:\.\d+)?))?\)/i
  );
  if (e) {
    const r = e[2].toLowerCase();
    let u = e[3].trim();
    !u.startsWith("0x") && u.startsWith("#") ? u = "0x" + u.substring(1) : !u.startsWith("0x") && !isNaN(parseInt(u)) && (u = "0x" + parseInt(u).toString(16));
    const d = parseFloat(e[4]) || 1;
    V.push({ type: r, color: u, size: d });
  }
  return !0;
}
function ke() {
  return B;
}
function Ne(a, c, e) {
  if (!(Object.keys(c).length === 0 && Object.keys(e).length === 0)) {
    a.push('<hr /><section class="footnotes"><ol>');
    for (const r in c)
      a.push(
        `<li id="footnote-${r}">${c[r]} <a href="#ref-${r}">↩</a></li>`
      );
    for (const r in e)
      a.push(
        `<li id="footnote-${r}">${e[r]} <a href="#ref-${r}">↩</a></li>`
      );
    a.push("</ol></section>");
  }
}
function Xe(a) {
  const c = a.split(`
`), e = [], r = [], u = [], d = {}, f = {};
  for (let s of c) {
    if (/^(\*\s*\*\s*\*|---|___)\s*$/.test(s)) {
      j(u, e, f), e.push("<hr />");
      continue;
    }
    if (xe(s, e)) {
      j(u, e, f);
      continue;
    }
    if (ve()) {
      We(s);
      continue;
    }
    if ($e(s, e)) {
      j(u, e, f);
      continue;
    }
    if (we()) {
      Ge(s);
      continue;
    }
    if (Ae(s, e)) {
      j(u, e, f);
      continue;
    }
    if (ke()) {
      Ue(s);
      continue;
    }
    if (s.trim().startsWith("|")) {
      j(u, e, f), se() || Le(), Oe(s);
      continue;
    } else se() && de(e);
    if (De(s, e)) {
      j(u, e, f);
      continue;
    }
    if (Ie(s, e)) {
      j(u, e, f);
      continue;
    }
    if (ze(s, e, r)) {
      j(u, e, f);
      continue;
    }
    s.trim() === "" ? j(u, e, f) : u.push(s);
  }
  return j(u, e, f), Me(e, r), _e(e), se() && de(e), ve() && xe("```", e), we() && $e("$$", e), ke() && Ae(":::", e), Ne(e, d, f), e.join(`
`);
}
export {
  Xe as parseMarkdown
};
