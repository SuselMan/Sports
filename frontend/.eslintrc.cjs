module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'jsx-a11y'],
  extends: [
    'airbnb',
    'airbnb/hooks',
    'airbnb-typescript',
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {
        project: './tsconfig.eslint.json',
      },
    },
  },
  rules: {
    // React 17+/Vite: don't require React in scope for JSX
    'react/react-in-jsx-scope': 'off',

    // Vite/TS imports without extensions
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],

    // Common React ergonomics
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',

    'no-underscore-dangle': 'off',
    'import/no-extraneous-dependencies': 'off',

    // Project style (avoid massive refactors)
    'import/prefer-default-export': 'off',
    'react/function-component-definition': 'off',
    'max-len': ['error', { code: 140, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],

    // Common patterns in interceptors / reducers
    'no-param-reassign': ['error', { props: false }],
  },
  overrides: [
    {
      files: ['vite.config.ts', 'src/i18n.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};


