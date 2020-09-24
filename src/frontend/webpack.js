/* eslint-disable @typescript-eslint/no-var-requires */
const Dotenv = require('dotenv-webpack');

module.exports = function () {
    return {
        name: 'my-docusaurus-plugin',
        configureWebpack() {
            return {
                plugins: [new Dotenv()],
            };
        },
    };
};
