import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // varsIgnorePattern: uppercase vars (Icon, AnimatePresence…) are allowed unused
      // because ESLint can't track JSX component usage without eslint-plugin-react.
      // Also allow `motion` which is used as motion.div / motion.button namespace.
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]|^motion$',
        args: 'none',
        ignoreRestSiblings: true,
      }],
    },
  },
])
