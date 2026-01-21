export default [
  {
    ignores: ['node_modules/', 'dist/', 'build/']
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Globals para Node.js
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        global: 'readonly',
        Buffer: 'readonly'
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      // === INDENTACIÓN Y FORMATO ===
      'indent': ['error', 2],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'never'],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],

      // === ESPACIADO ===
      'space-before-function-paren': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'space-infix-ops': 'error',
      'arrow-spacing': ['error', { before: true, after: true }],
      'spaced-comment': ['error', 'always', { exceptions: ['-', '*'] }],
      'no-multi-spaces': 'error',
      'space-before-blocks': ['error', 'always'],
      'space-in-parens': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'func-call-spacing': ['error', 'never'],
      'template-curly-spacing': ['error', 'never'],
      'block-spacing': ['error', 'always'],

      // === LLAVES Y PARÉNTESIS ===
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'curly': ['error', 'multi-line'],
      'comma-dangle': ['error', 'never'],

      // === VARIABLES ===
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', {
        args: 'none',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
        vars: 'all'
      }],
      'no-use-before-define': ['error', {
        functions: false,
        classes: true,
        variables: true
      }],
      'no-undef': 'error',
      'no-global-assign': 'error',
      'no-implicit-globals': 'error',

      // === COMPARACIONES ===
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-eq-null': 'off', // Se permite == null por eqeqeq
      'yoda': ['error', 'never'],

      // === FUNCIONES ===
      'no-inner-declarations': ['error', 'functions'],
      'no-invalid-this': 'error',
      'no-return-assign': ['error', 'except-parens'],
      'no-self-compare': 'error',
      'no-throw-literal': 'error',
      'no-loop-func': 'error',
      'no-new-func': 'error',
      'no-useless-call': 'error',

      // === OBJETOS Y ARRAYS ===
      'dot-notation': ['error', { allowKeywords: true }],
      'no-extend-native': 'error',
      'no-multi-str': 'error',
      'no-new-wrappers': 'error',
      'no-proto': 'error',
      'no-array-constructor': 'error',
      'no-new-object': 'error',

      // === CADENAS ===
      'no-useless-escape': 'error',
      'no-template-curly-in-string': 'error',

      // === CONTROL DE FLUJO ===
      'no-cond-assign': ['error', 'except-parens'],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-duplicate-case': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-empty-character-class': 'error',
      'no-ex-assign': 'error',
      'no-extra-boolean-cast': 'error',
      'no-extra-parens': ['error', 'functions'],
      'no-func-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-negated-in-lhs': 'error',
      'no-obj-calls': 'error',
      'no-regex-spaces': 'error',
      'no-sparse-arrays': 'error',
      'no-unreachable': 'error',
      'use-isnan': 'error',
      'valid-typeof': ['error', { requireStringLiterals: true }],
      'no-unexpected-multiline': 'error',

      // === ESTILO ===
      'comma-style': ['error', 'last'],
      'operator-linebreak': ['error', 'after', {
        overrides: { '?': 'before', ':': 'before' }
      }],
      'padded-blocks': ['error', 'never'],
      'semi-spacing': ['error', { before: false, after: true }],
      'new-cap': ['error', { newIsCap: true, capIsNew: false }],
      'new-parens': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'no-tabs': 'error',

      // === IMPORTACIONES (ES6) ===
      'no-duplicate-imports': 'error',
      'no-useless-rename': 'error',
      'rest-spread-spacing': ['error', 'never'],

      // === ASYNC/AWAIT ===
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'error',
      'no-promise-executor-return': 'error',
      'require-atomic-updates': 'error',

      // === ERRORES COMUNES ===
      'no-caller': 'error',
      'no-delete-var': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-iterator': 'error',
      'no-label-var': 'error',
      'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
      'no-lone-blocks': 'error',
      'no-new': 'error',
      'no-octal': 'error',
      'no-octal-escape': 'error',
      'no-redeclare': 'error',
      'no-script-url': 'error',
      'no-self-assign': 'error',
      'no-sequences': 'error',
      'no-shadow-restricted-names': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true
      }],
      'no-useless-concat': 'error',
      'no-void': 'error',
      'no-with': 'error',
      'wrap-iife': ['error', 'any', { functionPrototypeMethods: true }],

      // === NODE.JS ESPECÍFICO ===
      'handle-callback-err': ['error', '^(err|error)$'],
      'no-buffer-constructor': 'error',
      'no-mixed-requires': 'error',
      'no-new-require': 'error',
      'no-path-concat': 'error',

      // === UNICODES Y CARACTERES ===
      'unicode-bom': ['error', 'never'],
      'no-zero-width-space': 'off' // No existe en ESLint core
    }
  }
]
