module.exports = {
    root: true,
    env: {
        node: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
    ],
    rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
};
