module.exports = function override(config) {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        crypto: false,
      },
    },
    plugins: [...config.plugins],
  };
};
