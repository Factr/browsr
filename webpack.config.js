var path = require('path');
var exec = require('child_process').exec;
var buildCmd = 'python kango/kango.py build .';
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var compiler = webpack({
    entry: './app/app.js',
    target: "web",
    cache: true,
    stats: {
        colors: true,
        reasons: false,
        timings: true
    },
    devtool: "source-map",
    output: {
        path: path.join(__dirname, "src/common"),
        filename: '[name].js',
        chunkFilename: '[name].js',
        sourceMapFilename: '[name].js.map'
    },
    plugins: [
        new ExtractTextPlugin("styles.css")
    ],
    module: {

        loaders: [
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")


            },
            {include: /\.json$/, loaders: ["json-loader"]},

            {
                test: /.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.(png|ttf|eot|svg|woff(2)?)(\?=[a-z0-9]+)?$/,
                loader: 'url?limit=100000'
            }


        ]
    },

    resolve: {
        modulesDirectories: [
            "app",
            "node_modules"
        ],
        extensions: ["", ".json", ".js"]
    }

});

compiler.watch({}, function (err, stats) {
    if (!err) {
        exec(buildCmd, function (error, stdout, stderr) {
            if (error) {
                console.error(err);
            }
            console.log(stdout);
        });
    }
    else {
        console.log(err);
    }
});
