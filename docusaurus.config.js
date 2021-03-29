// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
module.exports = {
    title: 'Biometrics 4 All',
    tagline: '',
    url: 'https://docs.biometrics.gsmainclusivetechlab.io',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    favicon: 'img/favicon.ico',
    organizationName: 'gsmainclusivetechlab', // Usually your GitHub org/user name.
    projectName: 'bilt-voice', // Usually your repo name.
    themeConfig: {
        prism: {
            additionalLanguages: ['properties', 'ini'],
        },
        navbar: {
            //title: 'B4ALL - Biometrics For All - Documentation',
            
            items: [
                {
                  href: 'https://biometrics.gsmainclusivetechlab.io/',
                  label: 'B4LL - Biometrics 4 All',
                  position: 'left', // or 'right'
                },
            ]
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
                    // editUrl:
                    //     'https://github.com/gsmainclusivetechlab/bilt-voice/tree/docs',
                },
                theme: {
                    customCss: require.resolve('./src/frontend/custom.css'),
                },
            },
        ],
    ],
    plugins: [path.resolve(__dirname, 'src/frontend/webpack.js')],
};
