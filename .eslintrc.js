module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {
    'no-trailing-spaces': ["error",
      {
        "skipBlankLines": true,
      },
    ],
    semi: ["error", "always"],
    'semi-style': ["error", "last"],
    'space-before-function-paren': ["error", {
      "named": "never",
    }],
    'comma-dangle': ["error", "always-multiline"],
  },
}
