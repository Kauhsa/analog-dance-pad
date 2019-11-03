module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react', 'prettier', 'react-hooks'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'react/prop-types': 0,
    'react/display-name': 0,
    'react-hooks/rules-of-hooks': 1,
    'react-hooks/exhaustive-deps': 1
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
