// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
module.exports = {
    title: 'Biometrics 4 All',
    tagline: '',
    url: 'https://gsmainclusivetechlab.github.io',
    baseUrl: '/bilt-voice/',
    onBrokenLinks: 'throw',
    favicon: 'img/favicon.ico',
    organizationName: 'gsmainclusivetechlab', // Usually your GitHub org/user name.
    projectName: 'bilt-voice', // Usually your repo name.
    themeConfig: {
        prism: {
            additionalLanguages: ['properties', 'ini'],
        },
        navbar: {
            title: 'B4ALL - Biometrics For All - Documentation',
        },
        footer: {
            style: 'dark',

            copyright: `Copyright © 2020 GSMA. All rights reserved.`,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./src/frontend/sidebars.js'),
                    routeBasePath: '/',
                    editUrl:
                        'https://github.com/gsmainclusivetechlab/bilt-voice/tree/docs',
                },
                theme: {
                    customCss: require.resolve('./src/frontend/custom.css'),
                },
            },
        ],
    ],
    plugins: [path.resolve(__dirname, 'src/frontend/webpack.js')],
};
