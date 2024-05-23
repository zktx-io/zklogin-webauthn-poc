const webpack = require('webpack');

module.exports = function override(config) {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        crypto: false,
        buffer: require.resolve('buffer'),
      },
    },
    plugins: [
      ...config.plugins,
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  };
};
