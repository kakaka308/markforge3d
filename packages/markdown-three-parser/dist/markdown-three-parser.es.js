import ce from "katex";
var ne = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function ge(g) {
  return g && g.__esModule && Object.prototype.hasOwnProperty.call(g, "default") ? g.default : g;
}
var ee = { exports: {} }, re;
function pe() {
  return re || (re = 1, function(g) {
    var f = typeof window < "u" ? window : typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope ? self : {};
    /**
     * Prism: Lightweight, robust, elegant syntax highlighting
     *
     * @license MIT <https://opensource.org/licenses/MIT>
     * @author Lea Verou <https://lea.verou.me>
     * @namespace
     * @public
     */
    var t = function(p) {
      var m = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i, d = 0, T = {}, i = {
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
        manual: p.Prism && p.Prism.manual,
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
        disableWorkerMessageHandler: p.Prism && p.Prism.disableWorkerMessageHandler,
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
          encode: function a(e) {
            return e instanceof _ ? new _(e.type, a(e.content), e.alias) : Array.isArray(e) ? e.map(a) : e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
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
            return a.__id || Object.defineProperty(a, "__id", { value: ++d }), a.__id;
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
          clone: function a(e, n) {
            n = n || {};
            var s, r;
            switch (i.util.type(e)) {
              case "Object":
                if (r = i.util.objId(e), n[r])
                  return n[r];
                s = /** @type {Record<string, any>} */
                {}, n[r] = s;
                for (var o in e)
                  e.hasOwnProperty(o) && (s[o] = a(e[o], n));
                return (
                  /** @type {any} */
                  s
                );
              case "Array":
                return r = i.util.objId(e), n[r] ? n[r] : (s = [], n[r] = s, /** @type {Array} */
                /** @type {any} */
                e.forEach(function(u, l) {
                  s[l] = a(u, n);
                }), /** @type {any} */
                s);
              default:
                return e;
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
              var e = m.exec(a.className);
              if (e)
                return e[1].toLowerCase();
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
          setLanguage: function(a, e) {
            a.className = a.className.replace(RegExp(m, "gi"), ""), a.classList.add("language-" + e);
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
            } catch (s) {
              var a = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(s.stack) || [])[1];
              if (a) {
                var e = document.getElementsByTagName("script");
                for (var n in e)
                  if (e[n].src == a)
                    return e[n];
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
          isActive: function(a, e, n) {
            for (var s = "no-" + e; a; ) {
              var r = a.classList;
              if (r.contains(e))
                return !0;
              if (r.contains(s))
                return !1;
              a = a.parentElement;
            }
            return !!n;
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
          plain: T,
          plaintext: T,
          text: T,
          txt: T,
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
          extend: function(a, e) {
            var n = i.util.clone(i.languages[a]);
            for (var s in e)
              n[s] = e[s];
            return n;
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
          insertBefore: function(a, e, n, s) {
            s = s || /** @type {any} */
            i.languages;
            var r = s[a], o = {};
            for (var u in r)
              if (r.hasOwnProperty(u)) {
                if (u == e)
                  for (var l in n)
                    n.hasOwnProperty(l) && (o[l] = n[l]);
                n.hasOwnProperty(u) || (o[u] = r[u]);
              }
            var c = s[a];
            return s[a] = o, i.languages.DFS(i.languages, function(h, w) {
              w === c && h != a && (this[h] = o);
            }), o;
          },
          // Traverse a language definition with Depth First Search
          DFS: function a(e, n, s, r) {
            r = r || {};
            var o = i.util.objId;
            for (var u in e)
              if (e.hasOwnProperty(u)) {
                n.call(e, u, e[u], s || u);
                var l = e[u], c = i.util.type(l);
                c === "Object" && !r[o(l)] ? (r[o(l)] = !0, a(l, n, null, r)) : c === "Array" && !r[o(l)] && (r[o(l)] = !0, a(l, n, u, r));
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
        highlightAll: function(a, e) {
          i.highlightAllUnder(document, a, e);
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
        highlightAllUnder: function(a, e, n) {
          var s = {
            callback: n,
            container: a,
            selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
          };
          i.hooks.run("before-highlightall", s), s.elements = Array.prototype.slice.apply(s.container.querySelectorAll(s.selector)), i.hooks.run("before-all-elements-highlight", s);
          for (var r = 0, o; o = s.elements[r++]; )
            i.highlightElement(o, e === !0, s.callback);
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
        highlightElement: function(a, e, n) {
          var s = i.util.getLanguage(a), r = i.languages[s];
          i.util.setLanguage(a, s);
          var o = a.parentElement;
          o && o.nodeName.toLowerCase() === "pre" && i.util.setLanguage(o, s);
          var u = a.textContent, l = {
            element: a,
            language: s,
            grammar: r,
            code: u
          };
          function c(w) {
            l.highlightedCode = w, i.hooks.run("before-insert", l), l.element.innerHTML = l.highlightedCode, i.hooks.run("after-highlight", l), i.hooks.run("complete", l), n && n.call(l.element);
          }
          if (i.hooks.run("before-sanity-check", l), o = l.element.parentElement, o && o.nodeName.toLowerCase() === "pre" && !o.hasAttribute("tabindex") && o.setAttribute("tabindex", "0"), !l.code) {
            i.hooks.run("complete", l), n && n.call(l.element);
            return;
          }
          if (i.hooks.run("before-highlight", l), !l.grammar) {
            c(i.util.encode(l.code));
            return;
          }
          if (e && p.Worker) {
            var h = new Worker(i.filename);
            h.onmessage = function(w) {
              c(w.data);
            }, h.postMessage(JSON.stringify({
              language: l.language,
              code: l.code,
              immediateClose: !0
            }));
          } else
            c(i.highlight(l.code, l.grammar, l.language));
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
        highlight: function(a, e, n) {
          var s = {
            code: a,
            grammar: e,
            language: n
          };
          if (i.hooks.run("before-tokenize", s), !s.grammar)
            throw new Error('The language "' + s.language + '" has no grammar.');
          return s.tokens = i.tokenize(s.code, s.grammar), i.hooks.run("after-tokenize", s), _.stringify(i.util.encode(s.tokens), s.language);
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
        tokenize: function(a, e) {
          var n = e.rest;
          if (n) {
            for (var s in n)
              e[s] = n[s];
            delete e.rest;
          }
          var r = new O();
          return L(r, r.head, a), D(a, r, e, r.head, 0), R(r);
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
          add: function(a, e) {
            var n = i.hooks.all;
            n[a] = n[a] || [], n[a].push(e);
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
          run: function(a, e) {
            var n = i.hooks.all[a];
            if (!(!n || !n.length))
              for (var s = 0, r; r = n[s++]; )
                r(e);
          }
        },
        Token: _
      };
      p.Prism = i;
      function _(a, e, n, s) {
        this.type = a, this.content = e, this.alias = n, this.length = (s || "").length | 0;
      }
      _.stringify = function a(e, n) {
        if (typeof e == "string")
          return e;
        if (Array.isArray(e)) {
          var s = "";
          return e.forEach(function(c) {
            s += a(c, n);
          }), s;
        }
        var r = {
          type: e.type,
          content: a(e.content, n),
          tag: "span",
          classes: ["token", e.type],
          attributes: {},
          language: n
        }, o = e.alias;
        o && (Array.isArray(o) ? Array.prototype.push.apply(r.classes, o) : r.classes.push(o)), i.hooks.run("wrap", r);
        var u = "";
        for (var l in r.attributes)
          u += " " + l + '="' + (r.attributes[l] || "").replace(/"/g, "&quot;") + '"';
        return "<" + r.tag + ' class="' + r.classes.join(" ") + '"' + u + ">" + r.content + "</" + r.tag + ">";
      };
      function I(a, e, n, s) {
        a.lastIndex = e;
        var r = a.exec(n);
        if (r && s && r[1]) {
          var o = r[1].length;
          r.index += o, r[0] = r[0].slice(o);
        }
        return r;
      }
      function D(a, e, n, s, r, o) {
        for (var u in n)
          if (!(!n.hasOwnProperty(u) || !n[u])) {
            var l = n[u];
            l = Array.isArray(l) ? l : [l];
            for (var c = 0; c < l.length; ++c) {
              if (o && o.cause == u + "," + c)
                return;
              var h = l[c], w = h.inside, P = !!h.lookbehind, A = !!h.greedy, x = h.alias;
              if (A && !h.pattern.global) {
                var $ = h.pattern.toString().match(/[imsuy]*$/)[0];
                h.pattern = RegExp(h.pattern.source, $ + "g");
              }
              for (var C = h.pattern || h, b = s.next, k = r; b !== e.tail && !(o && k >= o.reach); k += b.value.length, b = b.next) {
                var z = b.value;
                if (e.length > a.length)
                  return;
                if (!(z instanceof _)) {
                  var y = 1, j;
                  if (A) {
                    if (j = I(C, k, a, P), !j || j.index >= a.length)
                      break;
                    var U = j.index, B = j.index + j[0].length, q = k;
                    for (q += b.value.length; U >= q; )
                      b = b.next, q += b.value.length;
                    if (q -= b.value.length, k = q, b.value instanceof _)
                      continue;
                    for (var H = b; H !== e.tail && (q < B || typeof H.value == "string"); H = H.next)
                      y++, q += H.value.length;
                    y--, z = a.slice(k, q), j.index -= k;
                  } else if (j = I(C, 0, z, P), !j)
                    continue;
                  var U = j.index, N = j[0], K = z.slice(0, U), ae = z.slice(U + N.length), Q = k + z.length;
                  o && Q > o.reach && (o.reach = Q);
                  var J = b.prev;
                  K && (J = L(e, J, K), k += K.length), E(e, J, y);
                  var oe = new _(u, w ? i.tokenize(N, w) : N, x, N);
                  if (b = L(e, J, oe), ae && L(e, b, ae), y > 1) {
                    var V = {
                      cause: u + "," + c,
                      reach: Q
                    };
                    D(a, e, n, b.prev, k, V), o && V.reach > o.reach && (o.reach = V.reach);
                  }
                }
              }
            }
          }
      }
      function O() {
        var a = { value: null, prev: null, next: null }, e = { value: null, prev: a, next: null };
        a.next = e, this.head = a, this.tail = e, this.length = 0;
      }
      function L(a, e, n) {
        var s = e.next, r = { value: n, prev: e, next: s };
        return e.next = r, s.prev = r, a.length++, r;
      }
      function E(a, e, n) {
        for (var s = e.next, r = 0; r < n && s !== a.tail; r++)
          s = s.next;
        e.next = s, s.prev = e, a.length -= r;
      }
      function R(a) {
        for (var e = [], n = a.head.next; n !== a.tail; )
          e.push(n.value), n = n.next;
        return e;
      }
      if (!p.document)
        return p.addEventListener && (i.disableWorkerMessageHandler || p.addEventListener("message", function(a) {
          var e = JSON.parse(a.data), n = e.language, s = e.code, r = e.immediateClose;
          p.postMessage(i.highlight(s, i.languages[n], n)), r && p.close();
        }, !1)), i;
      var v = i.util.currentScript();
      v && (i.filename = v.src, v.hasAttribute("data-manual") && (i.manual = !0));
      function F() {
        i.manual || i.highlightAll();
      }
      if (!i.manual) {
        var S = document.readyState;
        S === "loading" || S === "interactive" && v && v.defer ? document.addEventListener("DOMContentLoaded", F) : window.requestAnimationFrame ? window.requestAnimationFrame(F) : window.setTimeout(F, 16);
      }
      return i;
    }(f);
    g.exports && (g.exports = t), typeof ne < "u" && (ne.Prism = t), t.languages.markup = {
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
    }, t.languages.markup.tag.inside["attr-value"].inside.entity = t.languages.markup.entity, t.languages.markup.doctype.inside["internal-subset"].inside = t.languages.markup, t.hooks.add("wrap", function(p) {
      p.type === "entity" && (p.attributes.title = p.content.replace(/&amp;/, "&"));
    }), Object.defineProperty(t.languages.markup.tag, "addInlined", {
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
      value: function(m, d) {
        var T = {};
        T["language-" + d] = {
          pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
          lookbehind: !0,
          inside: t.languages[d]
        }, T.cdata = /^<!\[CDATA\[|\]\]>$/i;
        var i = {
          "included-cdata": {
            pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
            inside: T
          }
        };
        i["language-" + d] = {
          pattern: /[\s\S]+/,
          inside: t.languages[d]
        };
        var _ = {};
        _[m] = {
          pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function() {
            return m;
          }), "i"),
          lookbehind: !0,
          greedy: !0,
          inside: i
        }, t.languages.insertBefore("markup", "cdata", _);
      }
    }), Object.defineProperty(t.languages.markup.tag, "addAttribute", {
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
      value: function(p, m) {
        t.languages.markup.tag.inside["special-attr"].push({
          pattern: RegExp(
            /(^|["'\s])/.source + "(?:" + p + ")" + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
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
                  alias: [m, "language-" + m],
                  inside: t.languages[m]
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
    }), t.languages.html = t.languages.markup, t.languages.mathml = t.languages.markup, t.languages.svg = t.languages.markup, t.languages.xml = t.languages.extend("markup", {}), t.languages.ssml = t.languages.xml, t.languages.atom = t.languages.xml, t.languages.rss = t.languages.xml, function(p) {
      var m = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;
      p.languages.css = {
        comment: /\/\*[\s\S]*?\*\//,
        atrule: {
          pattern: RegExp("@[\\w-](?:" + /[^;{\s"']|\s+(?!\s)/.source + "|" + m.source + ")*?" + /(?:;|(?=\s*\{))/.source),
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
          pattern: RegExp("\\burl\\((?:" + m.source + "|" + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ")\\)", "i"),
          greedy: !0,
          inside: {
            function: /^url/i,
            punctuation: /^\(|\)$/,
            string: {
              pattern: RegExp("^" + m.source + "$"),
              alias: "url"
            }
          }
        },
        selector: {
          pattern: RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|` + m.source + ")*(?=\\s*\\{)"),
          lookbehind: !0
        },
        string: {
          pattern: m,
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
      }, p.languages.css.atrule.inside.rest = p.languages.css;
      var d = p.languages.markup;
      d && (d.tag.addInlined("style", "css"), d.tag.addAttribute("style", "css"));
    }(t), t.languages.clike = {
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
    }, t.languages.javascript = t.languages.extend("clike", {
      "class-name": [
        t.languages.clike["class-name"],
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
    }), t.languages.javascript["class-name"][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/, t.languages.insertBefore("javascript", "keyword", {
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
            inside: t.languages.regex
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
          inside: t.languages.javascript
        },
        {
          pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
          lookbehind: !0,
          inside: t.languages.javascript
        },
        {
          pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
          lookbehind: !0,
          inside: t.languages.javascript
        },
        {
          pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
          lookbehind: !0,
          inside: t.languages.javascript
        }
      ],
      constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/
    }), t.languages.insertBefore("javascript", "string", {
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
              rest: t.languages.javascript
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
    }), t.languages.insertBefore("javascript", "operator", {
      "literal-property": {
        pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
        lookbehind: !0,
        alias: "property"
      }
    }), t.languages.markup && (t.languages.markup.tag.addInlined("script", "javascript"), t.languages.markup.tag.addAttribute(
      /on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
      "javascript"
    )), t.languages.js = t.languages.javascript, function() {
      if (typeof t > "u" || typeof document > "u")
        return;
      Element.prototype.matches || (Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector);
      var p = "Loading…", m = function(v, F) {
        return "✖ Error " + v + " while fetching file: " + F;
      }, d = "✖ Error: File does not exist or is empty", T = {
        js: "javascript",
        py: "python",
        rb: "ruby",
        ps1: "powershell",
        psm1: "powershell",
        sh: "bash",
        bat: "batch",
        h: "c",
        tex: "latex"
      }, i = "data-src-status", _ = "loading", I = "loaded", D = "failed", O = "pre[data-src]:not([" + i + '="' + I + '"]):not([' + i + '="' + _ + '"])';
      function L(v, F, S) {
        var a = new XMLHttpRequest();
        a.open("GET", v, !0), a.onreadystatechange = function() {
          a.readyState == 4 && (a.status < 400 && a.responseText ? F(a.responseText) : a.status >= 400 ? S(m(a.status, a.statusText)) : S(d));
        }, a.send(null);
      }
      function E(v) {
        var F = /^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(v || "");
        if (F) {
          var S = Number(F[1]), a = F[2], e = F[3];
          return a ? e ? [S, Number(e)] : [S, void 0] : [S, S];
        }
      }
      t.hooks.add("before-highlightall", function(v) {
        v.selector += ", " + O;
      }), t.hooks.add("before-sanity-check", function(v) {
        var F = (
          /** @type {HTMLPreElement} */
          v.element
        );
        if (F.matches(O)) {
          v.code = "", F.setAttribute(i, _);
          var S = F.appendChild(document.createElement("CODE"));
          S.textContent = p;
          var a = F.getAttribute("data-src"), e = v.language;
          if (e === "none") {
            var n = (/\.(\w+)$/.exec(a) || [, "none"])[1];
            e = T[n] || n;
          }
          t.util.setLanguage(S, e), t.util.setLanguage(F, e);
          var s = t.plugins.autoloader;
          s && s.loadLanguages(e), L(
            a,
            function(r) {
              F.setAttribute(i, I);
              var o = E(F.getAttribute("data-range"));
              if (o) {
                var u = r.split(/\r\n?|\n/g), l = o[0], c = o[1] == null ? u.length : o[1];
                l < 0 && (l += u.length), l = Math.max(0, Math.min(l - 1, u.length)), c < 0 && (c += u.length), c = Math.max(0, Math.min(c, u.length)), r = u.slice(l, c).join(`
`), F.hasAttribute("data-start") || F.setAttribute("data-start", String(l + 1));
              }
              S.textContent = r, t.highlightElement(S);
            },
            function(r) {
              F.setAttribute(i, D), S.textContent = r;
            }
          );
        }
      }), t.plugins.fileHighlight = {
        /**
         * Executes the File Highlight plugin for all matching `pre` elements under the given container.
         *
         * Note: Elements which are already loaded or currently loading will not be touched by this method.
         *
         * @param {ParentNode} [container=document]
         */
        highlight: function(F) {
          for (var S = (F || document).querySelectorAll(O), a = 0, e; e = S[a++]; )
            t.highlightElement(e);
        }
      };
      var R = !1;
      t.fileHighlight = function() {
        R || (console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."), R = !0), t.plugins.fileHighlight.highlight.apply(this, arguments);
      };
    }();
  }(ee)), ee.exports;
}
var de = pe();
const te = /* @__PURE__ */ ge(de);
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
var se = {}, ie;
function fe() {
  return ie || (ie = 1, function(g) {
    g.languages.typescript = g.languages.extend("javascript", {
      "class-name": {
        pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,
        lookbehind: !0,
        greedy: !0,
        inside: null
        // see below
      },
      builtin: /\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/
    }), g.languages.typescript.keyword.push(
      /\b(?:abstract|declare|is|keyof|readonly|require)\b/,
      // keywords that have to be followed by an identifier
      /\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,
      // This is for `import type *, {}`
      /\btype\b(?=\s*(?:[\{*]|$))/
    ), delete g.languages.typescript.parameter, delete g.languages.typescript["literal-property"];
    var f = g.languages.extend("typescript", {});
    delete f["class-name"], g.languages.typescript["class-name"].inside = f, g.languages.insertBefore("typescript", "function", {
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
            inside: f
          }
        }
      }
    }), g.languages.ts = g.languages.typescript;
  }(Prism)), se;
}
fe();
var le = {}, ue;
function he() {
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
  }, Prism.languages.python["string-interpolation"].inside.interpolation.inside.rest = Prism.languages.python, Prism.languages.py = Prism.languages.python), le;
}
he();
(function(g) {
  var f = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;
  g.languages.css = {
    comment: /\/\*[\s\S]*?\*\//,
    atrule: {
      pattern: RegExp("@[\\w-](?:" + /[^;{\s"']|\s+(?!\s)/.source + "|" + f.source + ")*?" + /(?:;|(?=\s*\{))/.source),
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
      pattern: RegExp("\\burl\\((?:" + f.source + "|" + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ")\\)", "i"),
      greedy: !0,
      inside: {
        function: /^url/i,
        punctuation: /^\(|\)$/,
        string: {
          pattern: RegExp("^" + f.source + "$"),
          alias: "url"
        }
      }
    },
    selector: {
      pattern: RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|` + f.source + ")*(?=\\s*\\{)"),
      lookbehind: !0
    },
    string: {
      pattern: f,
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
  }, g.languages.css.atrule.inside.rest = g.languages.css;
  var t = g.languages.markup;
  t && (t.tag.addInlined("style", "css"), t.tag.addAttribute("style", "css"));
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
Prism.hooks.add("wrap", function(g) {
  g.type === "entity" && (g.attributes.title = g.content.replace(/&amp;/, "&"));
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
  value: function(f, t) {
    var p = {};
    p["language-" + t] = {
      pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
      lookbehind: !0,
      inside: Prism.languages[t]
    }, p.cdata = /^<!\[CDATA\[|\]\]>$/i;
    var m = {
      "included-cdata": {
        pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
        inside: p
      }
    };
    m["language-" + t] = {
      pattern: /[\s\S]+/,
      inside: Prism.languages[t]
    };
    var d = {};
    d[f] = {
      pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function() {
        return f;
      }), "i"),
      lookbehind: !0,
      greedy: !0,
      inside: m
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
  value: function(g, f) {
    Prism.languages.markup.tag.inside["special-attr"].push({
      pattern: RegExp(
        /(^|["'\s])/.source + "(?:" + g + ")" + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
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
              alias: [f, "language-" + f],
              inside: Prism.languages[f]
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
function M(g = "") {
  return g.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function X(g = "") {
  const f = {};
  let t = 0;
  return g = g.replace(/<[^>]+>/g, (p) => {
    const m = `@@HTML${t}@@`;
    return f[m] = p, t++, m;
  }), { text: g, map: f };
}
function W(g = "", f = {}) {
  return g.replace(/@@HTML(\d+)@@/g, (t, p) => f[`@@HTML${p}@@`] || "");
}
function Y(g = "") {
  const f = {};
  let t = 0;
  return g = g.replace(/`([^`\n]+)`/g, (p, m) => {
    const d = `@@CODE${t}@@`;
    return f[d] = m, t++, d;
  }), { text: g, map: f };
}
function G(g = "", f = {}) {
  return g.replace(
    /@@CODE(\d+)@@/g,
    (t, p) => `<code class="language-plaintext">${M(f[`@@CODE${p}@@`] || "")}</code>`
  );
}
function me(g = "") {
  const f = [], t = /(\w+)=(".*?"|'.*?'|[^\s"']+)/g;
  let p;
  for (; (p = t.exec(g)) !== null; ) {
    const m = p[1];
    let d = p[2];
    (d.startsWith('"') && d.endsWith('"') || d.startsWith("'") && d.endsWith("'")) && (d = d.slice(1, -1)), f.push(`${m}="${M(d)}"`);
  }
  return f.join(" ");
}
function Z(g, f = !1) {
  try {
    return ce.renderToString(g, {
      throwOnError: !1,
      displayMode: f,
      output: "html"
    });
  } catch {
    return `<code class="katex-error">${M(g)}</code>`;
  }
}
function Fe(g = "") {
  const f = g.split(`
`), t = [];
  let p = !1, m = "";
  const d = [];
  let T = [], i = !1, _ = [];
  const I = {}, D = {};
  let O = !1, L = [], E = 0, R = !1, v = 0, F = [], S = !1, a = [];
  const e = () => {
    if (T.length > 0) {
      let u = T.join(`
`), { text: l, map: c } = X(u), { text: h, map: w } = Y(l), A = M(h).replace(
        new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
        (x, $) => Z($.trim(), !1)
      );
      A = A.replace(/\[\^(.+?)\]\((.+?)\)/g, (x, $, C) => {
        const b = $.trim() || `inline-footnote-${Object.keys(D).length + 1}`;
        return D[b] = M(C), `<sup id="ref-${b}"><a href="#footnote-${b}">${b}</a></sup>`;
      }).replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (x, $, C, b) => {
        const k = b ? " " + me(b) : "";
        return `<img alt="${M($)}" src="${M(C)}"${k} />`;
      }).replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (x, $, C) => `<a href="${M(C)}" target="_blank">${M($)}</a>`).replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/~~(.+?)~~/g, "<del>$1</del>").replace(/\[\^(.+?)\]/g, (x, $) => `<sup id="ref-${$}"><a href="#ref-${$}">${$}</a></sup>`), A = A.replace(/\n/g, "<br />"), A = G(A, w), A = W(A, c), t.push(`<p>${A}</p>`), T = [];
    }
  }, n = () => {
    for (; d.length > 0; ) {
      const { tag: u } = d.pop();
      t.push(`</${u}>`);
    }
  }, s = (u) => {
    const l = u.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
    if (!l) return !1;
    const c = l[1].length, h = l[2], w = l[3], P = Math.floor(c / 4), x = /^\d+\./.test(h) ? "ol" : "ul";
    for (; d.length > P + 1; ) {
      const { tag: y } = d.pop();
      t.push(`</${y}>`);
    }
    if (d.length === 0 || P >= d.length) {
      if (d.length > 0 && d[d.length - 1].tag !== x) {
        const { tag: y } = d.pop();
        t.push(`</${y}>`);
      }
      d.push({ tag: x, indent: c }), t.push(`<${x}>`);
    } else if (d.length > 0 && d[d.length - 1].tag !== x) {
      const { tag: y } = d.pop();
      t.push(`</${y}>`), d.push({ tag: x, indent: c }), t.push(`<${x}>`);
    }
    const { text: $, map: C } = X(w), { text: b, map: k } = Y($), z = b.match(/^\[( |x|X)\]\s+(.*)/);
    if (z) {
      const y = z[1].toLowerCase() === "x", j = W(G(M(z[2]), k), C);
      t.push(`<li><input type="checkbox" ${y ? "checked" : ""} > ${j}</li>`);
    } else {
      let y = M(b);
      y = y.replace(
        new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
        (j, B) => Z(B, !1)
      ), y = G(y, k), y = W(y, C), t.push(`<li>${y}</li>`);
    }
    return !0;
  }, r = () => {
    if (_.length === 0) return;
    const u = _[0].split("|").map((c) => c.trim()).filter((c) => c !== ""), l = [];
    if (_.length > 1) {
      const c = _[1].split("|").map((h) => h.trim()).filter((h) => h !== "");
      for (const h of c)
        /^:-+:$/.test(h) ? l.push("center") : /^-+:$/.test(h) ? l.push("right") : /^:-+$/.test(h) ? l.push("left") : l.push("");
    }
    t.push("<table>"), t.push("<thead><tr>");
    for (let c = 0; c < u.length; c++) {
      const h = l[c] ? ` style="text-align:${l[c]}"` : "";
      t.push(`<th${h}>${M(u[c])}</th>`);
    }
    t.push("</tr></thead><tbody>");
    for (let c = 2; c < _.length; c++) {
      const h = _[c].split("|").map((w) => w.trim()).filter((w) => w !== "");
      t.push("<tr>");
      for (let w = 0; w < u.length; w++) {
        const P = l[w] ? ` style="text-align:${l[w]}"` : "";
        t.push(`<td${P}>${M(h[w] || "")}</td>`);
      }
      t.push("</tr>");
    }
    t.push("</tbody></table>"), _ = [];
  }, o = () => {
    if (v > 0) {
      for (let u = 0; u < v; u++)
        t.push("</blockquote>");
      v = 0, R = !1;
    }
  };
  for (let u = 0; u < f.length; u++) {
    let l = f[u];
    const c = l.trim();
    if (c === ":::three") {
      e(), n(), o(), i && (r(), i = !1), S = !0, a = [], E = 0;
      continue;
    }
    if (c === ":::" && S) {
      e(), t.push(`<div class="three-js-container" data-objects='${JSON.stringify(a)}'></div>`), S = !1, a = [], E = 0;
      continue;
    }
    if (S) {
      const P = c.match(/^(#{1,5})\s*(cube|sphere|cone|cylinder|torus|plane|dodecahedron|icosahedron|octahedron)\s*\(([^,]+?)(?:,\s*(\d+(?:\.\d+)?))?\)/i);
      if (P) {
        const A = P[2].toLowerCase();
        let x = P[3].trim();
        !x.startsWith("0x") && x.startsWith("#") ? x = "0x" + x.substring(1) : !x.startsWith("0x") && !isNaN(parseInt(x)) && (x = "0x" + parseInt(x).toString(16));
        const $ = parseFloat(P[4]) || 1;
        a.push({ type: A, color: x, size: $ });
      }
      E = 0;
      continue;
    }
    if (/^```/.test(c)) {
      if (p) {
        const P = F.join(`
`), A = te.highlight(
          P,
          te.languages[m] || te.languages.text,
          m
        );
        t.push(`<pre class="language-${m}"><code>${A}</code></pre>`), p = !1, F = [];
      } else
        e(), n(), o(), i && (r(), i = !1), p = !0, m = c.slice(3).trim() || "text", F = [];
      E = 0;
      continue;
    }
    if (p) {
      F.push(l);
      continue;
    }
    if (c === "$$") {
      e(), n(), o(), O ? (t.push(Z(L.join(`
`), !0)), O = !1, L = []) : (O = !0, L = [], T = []), E = 0;
      continue;
    }
    if (O) {
      L.push(l), E = 0;
      continue;
    }
    if (c === "") {
      E++, e(), E > 1 && (n(), o()), i && (r(), i = !1);
      continue;
    } else if (E > 0) {
      for (let P = 1; P < E; P++) t.push("<br />");
      E = 0;
    }
    if (/^[-*_]{3,}\s*$/.test(c)) {
      e(), n(), o(), i && (r(), i = !1), t.push("<hr />");
      continue;
    }
    const h = l.match(/^(\s*>+\s*)(.*)/);
    if (h) {
      e(), n(), i && (r(), i = !1);
      const A = h[1].replace(/\s/g, "").length, x = h[2].trim();
      if (A !== v) {
        if (A > v)
          for (let $ = v; $ < A; $++)
            t.push("<blockquote>");
        else
          for (let $ = v; $ > A; $--)
            t.push("</blockquote>");
        v = A;
      }
      if (x) {
        const $ = x;
        let { text: C, map: b } = X($), { text: k, map: z } = Y(C), y = M(k);
        y = y.replace(
          new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
          (j, B) => Z(B, !1)
        ), y = G(y, z), y = W(y, b), t.push(`<p>${y}</p>`);
      }
      R = !0;
      continue;
    } else R && o();
    if (c.includes("|") && c.split("|").length > 1) {
      e(), n(), o(), i || (i = !0, _ = []), _.push(c);
      continue;
    } else i && (r(), i = !1);
    const w = c.match(/^(#{1,5})\s+(.*)/);
    if (w) {
      e(), n(), o(), i && (r(), i = !1);
      const P = w[1].length;
      let A = w[2], { text: x, map: $ } = X(A), { text: C, map: b } = Y(x), k = M(C);
      k = k.replace(
        new RegExp("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)", "g"),
        (z, y) => Z(y, !1)
      ), k = G(k, b), k = W(k, $), t.push(`<h${P}>${k}</h${P}>`);
      continue;
    }
    if (/^(\s*)([-*]|\d+\.)\s+/.test(l)) {
      e(), s(l);
      continue;
    }
    T.push(l);
  }
  if (e(), n(), o(), i && r(), O && t.push(Z(L.join(`
`), !0)), E > 0)
    for (let u = 1; u < E; u++) t.push("<br />");
  if (Object.keys(I).length > 0 || Object.keys(D).length > 0) {
    t.push('<hr /><section class="footnotes"><ol>');
    for (const u in I)
      t.push(`<li id="footnote-${u}">${I[u]} <a href="#ref-${u}">↩</a></li>`);
    for (const u in D)
      t.push(`<li id="footnote-${u}">${D[u]} <a href="#ref-${u}">↩</a></li>`);
    t.push("</ol></section>");
  }
  return t.join(`
`);
}
export {
  Fe as parseMarkdown
};
