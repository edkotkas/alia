import { defineConfig, configs } from '@eslint/js'
import tseslint from 'typescript-eslint'

export default defineConfig(
  configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
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
      semicolon: [0, 'never'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    ignores: ['dist/**/*', 'coverage/**/*', 'reports/**/*', '.stryker-tmp/**/*']
  }
)
