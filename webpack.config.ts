import * as path from 'path';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import { getTemplate, ServerlessFunctionTemplate } from './dev/parseTemplate';

const conf = {
    prodMode: process.env.NODE_ENV === 'production',
    templatePath: './template.yaml',
};
const cfn = getTemplate(conf.templatePath);

console.log(`Building for ${conf.prodMode ? 'production' : 'development'}...`);

module.exports = {
    target: 'node',
    mode: conf.prodMode ? 'production' : 'development',

    entry: Object.values(cfn.Resources)
        // Find nodejs functions
        .filter(
            (v): v is ServerlessFunctionTemplate =>
                v.Type === 'AWS::Serverless::Function'
        )
        .filter((v) => {
            const runtime =
                v.Properties.Runtime || cfn.Globals?.Function?.Runtime || '';
            return runtime.startsWith('nodejs');
        })
        .map((v) => ({
            // Isolate handler src filename
            handlerFile: v.Properties.Handler.split('.')[0],
            // Build handler dst path (dropping './dist')
            CodeUriDir: v.Properties.CodeUri.split('/').splice(2).join('/'),
        }))
        .reduce(
            (entries, v) =>
                Object.assign(
                    entries,
                    // Generate {outputPath: inputPath} object
                    {
                        [`${v.CodeUriDir}/${v.handlerFile}`]: `./src/${v.CodeUriDir}/${v.handlerFile}.ts`,
                    }
                ),
            {}
        ),

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
    },
    devtool: 'source-map',
    plugins: conf.prodMode
        ? [
              new UglifyJsPlugin({
                  parallel: true,
                  extractComments: true,
                  sourceMap: true,
              }),
          ]
        : [],
};
