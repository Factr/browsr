const path = require("path")
const exec = require("child_process").exec
const webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin');
const _ = require('lodash')
require('colors')

const BROWSR_ENV = {
    [true]: 'production',
    [process.argv.includes('dev')]: 'development',
    [process.argv.includes('staging')]: 'staging',
}.true

const compiler = webpack({
    entry: {
        main: ["babel-polyfill", "./src/app.js"],
    },
    target: "web",
    context: __dirname,
    cache: true,
    stats: {
        colors: true,
        reasons: false,
        timings: true,
    },
    devtool: "source-map",
    output: {
        path: path.join(__dirname, `./output`),
        filename: "main.js",
        chunkFilename: "main.js",
        sourceMapFilename: "main.js.map",
    },
    plugins: [
        new ExtractTextPlugin("styles.css"),
        new webpack.DefinePlugin({ BROWSR_ENV: JSON.stringify(BROWSR_ENV) }),
        new CopyWebpackPlugin([{ from: './src/static'} ]),
    ],
    module: {
        loaders: [
            {
                test: /\.(less|css)$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader"),
            },
            {
                include: /\.json$/, loaders: ["json-loader"]
            },
            {
                include: /\.js$/,
                exclude: /node_modules/,
                loader: "babel",
                query: {
                    "plugins": [
                        "typecheck",
                        "transform-class-properties",
                        "transform-decorators-legacy",
                        "transform-object-assign",
                        "transform-object-rest-spread",
                        "transform-export-extensions",
                        "add-module-exports",
                    ],
                    "presets": [
                        "es2015",
                        "react",
                        "stage-0"
                    ],
                },
            },
            {
                test: /\.(png|ttf|eot|svg|woff(2)?)(\?=[a-z0-9]+)?$/,
                loader: "url?limit=1000",
            }
        ],
    },
    resolve: {
        modulesDirectories: [
            "src",
            "node_modules",
        ],
        extensions: ["", ".json", ".js"],
    },
})

let compilationNumber = 0

//noinspection JSUnresolvedFunction
compiler.plugin("done", function (a) {
    const comp = a.compilation
    const modulesWithErrors = _.filter(comp.modules, module => module.error)
    const anyErrors = modulesWithErrors.length
    const compilationTime = (a.endTime - a.startTime) / 1000

    if (anyErrors) {
        console.log("We have errors in some of the modules:")

        modulesWithErrors.forEach((module, index) => {
            console.log(`#${module.id} Module at ${module.resource.blue} has error\n`, module.error.message.red)
        })
    } else {
        console.log(`#${++compilationNumber} Successful webpack compilation in ${compilationTime.toFixed(1)}s`.green)
    }
})

compiler.watch({}, function (err, stats) {
    if (!err) {
        exec('webpack', function (error, stdout, stderr) {
            if (error) {
                console.error(err)
            }

            if (!process.argv.includes('--watch')) {
                process.exit(0)
            }
        })
    } else {
        console.error(err)
    }
})
