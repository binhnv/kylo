"use strict";

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const writeFilePlugin = require('write-file-webpack-plugin');
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const sass = require('sass');
const CompressionPlugin = require("compression-webpack-plugin");
const ShakePlugin = require('webpack-common-shake').Plugin;
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');

const devServer = {
    contentBase: path.resolve("dist"),
    hot: true,
    host: process.env.host || "localhost",
    port: process.env.PORT || 3000,
    proxy: [{
        context: [
            '/api',
            '/login',
            '/logout',
            '/proxy',
            '/api-docs'
        ],
        target: 'http://127.0.0.1:8400',
        secure: false,
        changeOrigin: false,
        headers: {host: 'localhost:3000'}
    }]
};

const tsCompilerOutput = path.resolve(__dirname, 'target/classes/static');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const staticDir = path.resolve('./src/main/resources/static');
const staticJsDir = path.join(staticDir, 'js');
const staticNodeModules = path.join(staticDir, 'node_modules');
const staticBower = path.join(staticDir, 'bower_components');
const staticJsVendorDir = path.join(staticJsDir, 'vendor');
const tsConfigFile = path.join(staticDir, 'tsconfig.json');

const webpackConfig = (env) => {
    const config = {
        resolve: {
            extensions: ['.ts', '.js'],
            modules: [
                path.resolve(__dirname, 'src/main/resources/static/js/vendor'),
                path.resolve(__dirname, 'src/main/resources/static/node_modules'),
                path.resolve(__dirname, 'src/main/resources/static/bower_components'),
                path.resolve(__dirname, 'node_modules')
            ],
            alias: {
                'routes': path.join(staticJsDir, 'routes'),
                'app': path.join(staticJsDir, 'app'),
                'kylo-common': path.join(staticJsDir, 'common/module-require'),
                'kylo-common-module': path.join(staticJsDir, 'common/module'),
                'kylo-services': path.join(staticJsDir, 'services/module-require'),
                'kylo-services-module': path.join(staticJsDir, 'services/module'),
                'kylo-side-nav': path.join(staticJsDir, 'side-nav/module-require'),
                'kylo-feedmgr': path.join(staticJsDir, 'feed-mgr/module-require'),
                'kylo-opsmgr': path.join(staticJsDir, 'ops-mgr/module-require'),
                'codemirror-require/module': path.join(staticJsDir, 'codemirror-require/module'),
                'feed-mgr/catalog/catalog.module': path.join(staticJsDir, 'feed-mgr/catalog/catalog.module'),
                'dirPagination.tpl.html': path.join(staticJsDir, 'common/dir-pagination/dirPagination.tpl.html'),

                'constants/AccessConstants': path.join(staticJsDir, 'constants/AccessConstants'),
                'kylo-utils/LazyLoadUtil': path.join(staticJsDir, 'kylo-utils/LazyLoadUtil'),

                'angularCookies': path.join(staticBower, 'angular-cookies/angular-cookies.min.js'),
                'angular-cookies': path.join(staticBower, 'angular-cookies/angular-cookies.min.js'),
                'angular-material-data-table': path.join(staticBower, 'angular-material-data-table/dist/md-data-table.min'),
                'angular-material-expansion-panel': path.join(staticBower, 'angular-material-expansion-panel/dist/md-expansion-panel.min'),
                'angular-sanitize': path.join(staticBower, 'angular-sanitize/angular-sanitize.min'),
                'angular-translate-handler-log': path.join(staticBower, 'angular-translate-handler-log/angular-translate-handler-log.min.js'),
                'angular-translate-loader-static-files': path.join(staticBower, 'angular-translate-loader-static-files/angular-translate-loader-static-files.min.js'),
                'angular-translate-storage-cookie': path.join(staticBower, 'angular-translate-storage-cookie/angular-translate-storage-cookie.min.js'),
                'angular-translate-storage-local': path.join(staticBower, 'angular-translate-storage-local/angular-translate-storage-local.min.js'),
                'angular-ui-grid': path.join(staticBower, 'angular-ui-grid/ui-grid.min'),
                'angularAnimate': path.join(staticBower, 'angular-animate/angular-animate.min'),
                'angularAria': path.join(staticBower, 'angular-aria/angular-aria.min'),
                'angularMaterial': path.join(staticBower, 'angular-material/angular-material.min'),
                'angularMessages': path.join(staticBower, 'angular-messages/angular-messages.min'),
                'jquery': path.join(staticBower, 'jquery/dist/jquery.min'),
                'ng-fx': path.join(staticBower, 'ngFx/dist/ngFx.min'),
                'pascalprecht.translate': path.join(staticBower, 'angular-translate/angular-translate'),
                'tmh.dynamicLocale': path.join(staticBower, 'angular-dynamic-locale/dist/tmhDynamicLocale.min'),
                'underscore': path.join(staticBower, 'underscore/underscore-min'),
                'angular-drag-and-drop-lists': path.join(staticBower, 'angular-drag-and-drop-lists/angular-drag-and-drop-lists.min'),
                'fattable': path.join(staticBower, 'fattable/fattable'),
                'd3': path.join(staticBower, 'd3/d3.min'),
                'nvd3': path.join(staticBower, 'nvd3/build/nv.d3.min'),
                'angular-nvd3': path.join(staticBower, 'angular-nvd3/dist/angular-nvd3.min'),
                'gsap': path.join(staticBower, 'gsap/src/uncompressed/TweenMax'),
                'vis': path.join(staticBower, 'vis/dist/vis.min'),
                'angular-visjs': path.join(staticBower, 'angular-visjs/angular-vis'),
                // 'SVGMorpheus': path.join(staticBower, 'svg-morpheus/compile/minified/svg-morpheus'),
                'ocLazyLoad': path.join(staticBower, 'oclazyload/dist/ocLazyLoad'), //System.amdRequire with ocLazyLoad.require
                'jquery-ui': path.join(staticBower, 'jquery-ui/jquery-ui.min'),
                'pivottable': path.join(staticBower, 'pivottable/dist/pivot.min'),
                'pivottable-c3-renderers': path.join(staticBower, 'pivottable/dist/c3_renderers.min'),
                'c3': path.join(staticBower, 'c3/c3.min'),

                'angular-material-icons': path.join(staticJsVendorDir, 'angular-material-icons/angular-material-icons'),
                'dirPagination': path.join(staticJsVendorDir, 'dirPagination/dirPagination'),
                'ng-text-truncate': path.join(staticJsVendorDir, 'ng-text-truncate/ng-text-truncate'),
                'ment-io': path.join(staticJsVendorDir, 'ment.io/mentio'),
                // 'tern': path.join(staticJsVendorDir, 'tern/angular-tern'),

                'ng2-nvd3': path.join(staticNodeModules, 'ng2-nvd3/build/index'),
                'ng2-codemirror': path.join(staticNodeModules, 'ng2-codemirror/lib/index'),
                // 'moment': path.join(staticNodeModules, 'moment/min/moment.min'), //loaded from root node_modules

                'urlParams': path.join(staticDir, 'login/jquery.urlParam.js'),
            }
        },
        entry: {
            entryPolyfills: path.resolve('./src/main/resources/static/polyfills'),
            global: path.resolve('./src/main/resources/static/assets/global.scss'),
            app: path.resolve('./src/main/resources/static/js/main.ts'),
        },
        output: {
            filename: '[name].bundle.js',
            chunkFilename: '[name].chunk.js',
            path: path.join(__dirname, "dist")
        },
        module: {
            loaders: [
                {
                    test: /\.html$/,
                    loader: "raw-loader",
                    exclude: path.resolve("./src/main/resources/static/js/index.html")
                },
                {
                    test: /.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            // outputPath: 'fonts/',
                            // publicPath: '../'
                        }
                    }]
                }, {
                    test: /\.(jpe?g|png|svg|gif)/i,
                    loader: 'file-loader',
                    options: {
                        context: './src/main/resources/static',
                        name: '[path][name].[ext]'
                    }
                },
                {
                    test: /\.scss$/,
                    use: ['to-string-loader', 'css-loader', {
                        loader: 'sass-loader',
                        options: {implementation: sass}
                    }],
                    exclude: /(theme\.scss|global\.scss)/
                },
                {
                    test: /(theme\.scss|global\.scss)/,
                    use: ['style-loader', 'css-loader', 'postcss-loader', {
                        loader: 'sass-loader',
                        options: {implementation: sass}
                    }]
                },
                {
                    test: /\.css$/,
                    use: ['to-string-loader', 'css-loader']
                },
                {
                    test: /\.js$/,
                    use: [
                        // {
                        //     loader: 'cache-loader',
                        //     options: {
                        //         cacheDirectory: path.resolve('dist/cache-loader')
                        //     }
                        // },
                        // {
                        //     loader: 'thread-loader',
                        //     options: {
                        //         workers: require('os').cpus().length
                        //     }
                        // },
                        'babel-loader',
                        // "source-map-loader",
                        {
                            loader: path.resolve('./webpack.angular.module.loader.js'),
                            options: {
                                baseUrl: "src/main/resources/static/js",
                                modules: ["feed-mgr", "ops-mgr"]
                            }
                        },
                        {
                            loader: path.resolve('./webpack.angular.module.loader.js'),
                            options: {
                                baseUrl: "src/main/resources/static",
                                modules: ["bower_components"]
                            }
                        },
                        {
                            loader: path.resolve('./webpack.angular.template.loader.js'),
                            options: {
                                baseUrl: "src/main/resources/static"
                            }
                        }],
                    // include: [
                    // tsCompilerOutput,
                    // staticDir
                    // ],
                    exclude: [
                        nodeModulesDir,
                        staticNodeModules,
                        staticBower,
                        staticJsVendorDir
                    ]
                },
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'cache-loader',
                            options: {
                                cacheDirectory: path.resolve('dist/cache-loader')
                            }
                        },
                        {
                            loader: 'thread-loader',
                            options: {
                                // there should be 1 cpu for the fork-ts-checker-webpack-plugin
                                // workers: require('os').cpus().length - 1
                                workers: require('os').cpus().length
                            }
                        },
                        {
                            loader: 'ts-loader',
                            options: {
                                configFile: tsConfigFile,
                                transpileOnly: true,
                                happyPackMode: true
                            }
                        },
                        {
                            loader: path.resolve('./webpack.angular.module.loader.js'),
                            options: {
                                baseUrl: "src/main/resources/static/js",
                                modules: ["feed-mgr", "ops-mgr"]
                            }
                        },
                        {
                            loader: path.resolve('./webpack.angular.module.loader.js'),
                            options: {
                                baseUrl: "src/main/resources/static",
                                modules: ["bower_components"]
                            }
                        },
                        {
                            loader: path.resolve('./webpack.angular.template.loader.js'),
                            options: {
                                baseUrl: "src/main/resources/static"
                            }
                        },
                        'angular-router-loader'
                    ],
                    exclude: [
                        nodeModulesDir,
                        staticNodeModules,
                        staticBower,
                        staticJsVendorDir
                    ]
                },
                // {
                //     enforce: "pre",
                //     test: /\.js$/,
                //     exclude: /(node_modules|bower_components|vendor)/,
                //     loader: "eslint-loader",
                // },
            ]
        },
        plugins: [
            new CopyWebpackPlugin([
                {from: './src/main/resources/static/assets/images/favicons', to: 'assets/images/favicons'},
                {from: './src/main/resources/static/locales/', to: 'locales'},
                ...loginPageDependencies,
                ...templates,
                ...wranlgerDeps,
            ]),
            new HtmlWebpackPlugin({
                filename: "index.html",
                template: path.resolve("./src/main/resources/static/index.html"),
                chunks: ['common', 'entryPolyfills', 'global', 'app'],
                chunksSortMode: 'manual',
                inject: 'body'
            }),

            new webpack.optimize.CommonsChunkPlugin({
                name: "common",
                filename: "common.js",
                minChunks: (module) => {
                    // this assumes your vendor imports exist in the node_modules directory
                    return module.context && module.context.indexOf("node_modules") !== -1 && module.context.indexOf("vendor") !== -1;
                }
            }),

            new CleanWebpackPlugin(["dist"]),

            new webpack.ContextReplacementPlugin(
                //https://github.com/angular/angular/issues/20357
                /angular(\\|\/)core(\\|\/)/,
                path.resolve(__dirname, './src/main/resources/static')
            ),

            new webpack.ProvidePlugin({
                "window.jQuery": "jquery", //https://webpack.js.org/plugins/provide-plugin/#usage-jquery-with-angular-1
                "$": "jquery",
                "d3": "d3",
                // "window.moment": "moment", //Can't resolve './locale' in '.../ui-app/src/main/resources/static/node_modules/moment/min'
                // "window.SVGMorpheus": "SVGMorpheus",
                "window.vis": "vis",
                // "tern": "tern",
                // "window.tern": "tern"
            }),

            new FriendlyErrorsWebpackPlugin(),
            new ProgressPlugin(),
            // new ForkTsCheckerWebpackPlugin(),
            // new ForkTsCheckerWebpackPlugin({
            //     tsconfig: tsConfigFile
            // }),
            // new writeFilePlugin(),

            // new BundleAnalyzerPlugin()
        ]
    };

    config.devServer = devServer;
    // config.devtool = "eval";
    config.plugins.push(
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    );

    if (env && env.production) {
        config.devtool = "source-map";
        config.plugins.push(
            new CompressionPlugin({
                cache: true
            }),
            // new ShakePlugin(), //CommonJS shaking
            new UglifyJSPlugin({
                cache: path.resolve(__dirname, './dist/cache-uglifyjs-plugin'),
                parallel: 4,
                sourceMap: false,
                uglifyOptions: {
                    compress: true,
                    mangle: false,
                    warnings: false
                }
            }),
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": JSON.stringify("production")
            })
        );
    }

    return config;
};

module.exports = webpackConfig;


const wranlgerDeps = [
    {
        context: './src/main/resources/static',
        from: 'js/vendor/**/*.js',
        to: '[path][name].[ext]'
    },
    {
        context: './src/main/resources/static',
        from: './bower_components/angular-ui-grid/ui-grid.css',
        to: './bower_components/angular-ui-grid/ui-grid.css'
    },
    {
        context: './src/main/resources/static',
        from: './bower_components/angular-ui-grid/ui-grid.woff',
        to: './bower_components/angular-ui-grid/ui-grid.woff'
    },
    {
        context: './src/main/resources/static',
        from: './bower_components/angular-ui-grid/ui-grid.ttf',
        to: './bower_components/angular-ui-grid/ui-grid.ttf'
    },
]

const templates = [
    {
        context: './src/main/resources/static',
        from: 'js/common/dir-pagination/**/*.html',
        to: '[path][name].[ext]'
    },
    {
        context: './src/main/resources/static',
        from: 'js/feed-mgr/templates/template-stepper/register-template-stepper.html',
        to: 'js/feed-mgr/templates/template-stepper/register-template-stepper.html'
    },
    {
        context: './src/main/resources/static',
        from: 'js/feed-mgr/templates/template-stepper/processor-properties/expression-property-mentions.html',
        to: 'js/feed-mgr/templates/template-stepper/processor-properties/expression-property-mentions.html'
    },
    {
        context: './src/main/resources/static',
        from: 'js/feed-mgr/feeds/define-feed/define-feed-stepper.html',
        to: 'js/feed-mgr/feeds/define-feed/define-feed-stepper.html'
    },
    {
        context: './src/main/resources/static',
        from: 'js/ops-mgr/alerts/alerts-pagination.tpl.html',
        to: 'js/ops-mgr/alerts/alerts-pagination.tpl.html'
    },
    {
        context: './src/main/resources/static',
        from: 'js/ops-mgr/alerts/alert-type-filter-select.html',
        to: 'js/ops-mgr/alerts/alert-type-filter-select.html'
    },
    {
        context: './src/main/resources/static',
        from: 'js/feed-mgr/visual-query/transform-data/visual-query-table/visual-query-table-header.html',
        to: 'js/feed-mgr/visual-query/transform-data/visual-query-table/visual-query-table-header.html'
    },
];

const loginPageDependencies = [
    {
        context: './src/main/resources/static',
        from: 'login',
        to: 'login'
    },
    {
        context: './src/main/resources/static',
        from: 'login.html',
        to: 'login.html'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/oclazyload/dist/ocLazyLoad.require.js',
        to: 'bower_components/oclazyload/dist/ocLazyLoad.require.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-animate/angular-animate.js',
        to: 'bower_components/angular-animate/angular-animate.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-aria/angular-aria.js',
        to: 'bower_components/angular-aria/angular-aria.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-messages/angular-messages.js',
        to: 'bower_components/angular-messages/angular-messages.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/requirejs/require.js',
        to: 'bower_components/requirejs/require.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular/angular.js',
        to: 'bower_components/angular/angular.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/underscore/underscore.js',
        to: 'bower_components/underscore/underscore.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/jquery/dist/jquery.js',
        to: 'bower_components/jquery/dist/jquery.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-material/angular-material.min.css',
        to: 'bower_components/angular-material/angular-material.min.css'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-material/angular-material.js',
        to: 'bower_components/angular-material/angular-material.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-cookies/angular-cookies.js',
        to: 'bower_components/angular-cookies/angular-cookies.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-material-icons/angular-material-icons.js',
        to: 'bower_components/angular-material-icons/angular-material-icons.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-translate/angular-translate.js',
        to: 'bower_components/angular-translate/angular-translate.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
        to: 'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-translate-storage-local/angular-translate-storage-local.min.js',
        to: 'bower_components/angular-translate-storage-local/angular-translate-storage-local.min.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-translate-handler-log/angular-translate-handler-log.min.js',
        to: 'bower_components/angular-translate-handler-log/angular-translate-handler-log.min.js'
    },
    {
        context: './src/main/resources/static',
        from: 'bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
        to: 'bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js'
    },
    {
        context: './src/main/resources/static',
        from: 'assets/env.js',
        to: 'assets/env.js'
    },
    {
        context: './src/main/resources/static',
        from: 'assets/login.css',
        to: 'assets/login.css'
    }
];