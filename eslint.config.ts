import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs']
        },
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    rules: {
      SemicolonPreference: ['off', 'never'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/unbound-method': 'off'
    }
  },
  {
    ignores: ['dist/**/*', 'coverage/**/*', 'reports/**/*', '.stryker-tmp/**/*']
  }
)
