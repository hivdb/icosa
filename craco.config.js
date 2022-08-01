module.exports = {
  webpack: {
    configure: {
      // See https://github.com/webpack/webpack/issues/6725
      module: {
        rules: [{
          test: /worker\.js$/,
          use: {
            loader: "worker-loader"
          }
        }]
      },
      experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true
      },
      stats: {
        children: true
      },
      resolve: {
        fallback: {
          "crypto": false,
          "path": false,
          "fs": false
        }
      }
    }
  }
};
