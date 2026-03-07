// src/__mocks__/prismjs.js
export default {
  highlight(code, _grammar, _lang) { return code },
  languages: new Proxy({}, { get: () => ({}) })
}