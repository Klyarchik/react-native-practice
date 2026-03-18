module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // plugins: [] // если будут плагины, добавляй сюда
  };
};