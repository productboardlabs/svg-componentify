const { transform } = require("@babel/core");
const pbfiedBabelPlugin = require("../babel/pbfied");

function pbfiedSVGRPlugin(code, config, state) {
  const { componentName: name } = state;

  const { code: generatedCode } = transform(code, {
    plugins: ["@babel/syntax-jsx", pbfiedBabelPlugin]
  });

  return generatedCode;
}

module.exports = pbfiedSVGRPlugin;
