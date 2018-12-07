const { transform } = require("@babel/core");
const pbfied = require("../babel/pbfied");

function jsxPlugin(code, config, state) {
  const { componentName: name } = state;

  const { code: generatedCode } = transform(code, {
    plugins: ["@babel/syntax-jsx", pbfied]
  });

  return generatedCode;
}

module.exports = jsxPlugin;
