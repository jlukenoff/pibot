const path = require('path');

const ENTRY_POINT = path.resolve(__dirname, 'client/index.jsx');

const OUTPUT_DIR = path.resolve(__dirname, 'public');

module.exports = {
  entry: ENTRY_POINT,
  output: {
    filename: 'bundle.js',
    path: OUTPUT_DIR,
  },
  devtool: 'source-map',
  mode: 'development',
  resolve: { extensions: ['.js', '.jsx'] },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 8080,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader',
      },
      {
        test: /\.css$/,
        loader: 'css-loader',
        query: {
          modules: true,
          localIdentName: '[name]__[local]___[hash:base64:5]',
        },
      },
      {
        test: /.jsx?/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['env', 'react', 'airbnb'],
        },
      },
    ],
  },
};
