/**
 * 编写一个 loader
 * @link https://webpack.js.org/contribute/writing-a-loader/
 * @param {string} source 
 * @returns 
 */
module.exports = function (source) {
  const options = this.getOptions();
  console.log(options, source);
  // Apply some transformations to the source...
  source = source.replace('var','let');
  return `export default ${JSON.stringify(source)}`;
}
