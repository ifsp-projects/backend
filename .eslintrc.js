const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'standard',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended',
    'prettier',
    'turbo'
  ],
  plugins: [
    '@typescript-eslint',
    'prettier',
    'eslint-plugin-import-helpers',
    'eslint-plugin-unused-imports',
    'perfectionist'
  ],
  globals: {
    React: true,
    JSX: true
  },
  env: {
    node: true,
    commonjs: true,
    es2021: true
  },
  settings: {
    'import/resolver': {
      typescript: {
        project
      }
    }
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
    'dist/'
  ],
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)']
    }
  ],
  rules: {
    'no-useless-constructor': 'off',
    'perfectionist/sort-interfaces': 'error',
    'perfectionist/sort-jsx-props': [
      'error',
      {
        type: 'natural',
        order: 'asc',
        groups: ['multiline', 'unknown', 'shorthand']
      }
    ],
    'prettier/prettier': 'error',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-empty-interface': 'off',

    'react/react-in-jsx-scope': 'off',
    'space-before-function-paren': 'off',
    'react/prop-types': 'off',
    camelcase: 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'none',
        argsIgnorePattern: '^_'
      }
    ],
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
        allowSeparatedGroups: false
      }
    ],
    'import-helpers/order-imports': [
      'warn',
      {
        newlinesBetween: 'always',
        groups: [
          ['module', '/^@ant/', '/^@fullstory/'],
          '/^@/',
          ['parent', 'sibling', 'index']
        ],
        alphabetize: { order: 'asc', ignoreCase: true }
      }
    ]
  }
}
