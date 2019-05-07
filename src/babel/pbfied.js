const { parse, transform } = require("@babel/core");

const PATH_REMOVE_ATTRS = ["id", "clipRule", "fillRule"];
const SVG_REMOVE_ATTRS = ["width", "height"];
const CLASS_NAME = `pb-icon`;

const pbfiedPlugin = ({ types: t }) => {
  let countPath = 0;

  return {
    name: "pbfiedPlugin",
    visitor: {
      VariableDeclarator(path) {
        const className = t.identifier("props");

        className.typeAnnotation = t.typeAnnotation(
          t.genericTypeAnnotation(t.identifier("React.SVGProps<SVGSVGElement>"))
        );

        path.node.init.params = [className];
      },
      ImportDeclaration(path) {
        if (path.node.source.value === "react") {
          path.insertAfter([
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier("cx"))],
              t.stringLiteral("classnames")
            ),
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier("styles"))],
              t.stringLiteral("./Icon.styles")
            )
          ]);
        }
      },
      JSXElement(path) {
        if (path.node.openingElement.name.name === "defs") {
          path.replaceInline(path.node.children.filter(t.isJSXElement));
        }

        if (t.isJSXIdentifier(path.node) && path.node.name.name === "use") {
          path.remove();
        }

        if (path.node.openingElement.name.name === "svg") {
          path.traverse({
            JSXOpeningElement(path) {
              if (path.node.name.name === "path") {
                countPath++;
              }
            }
          });
        }
      },
      JSXOpeningElement(path) {
        if (path.node.name.name === "svg") {
          path.node.attributes = [
            ...path.node.attributes.filter(
              a => !SVG_REMOVE_ATTRS.includes(a.name.name)
            ),
            t.jsxSpreadAttribute(t.identifier("props")),
            t.jsxAttribute(
              t.jSXIdentifier("className"),
              t.jSXExpressionContainer(
                t.callExpression(t.identifier("cx"), [
                  t.identifier("props.className"),
                  t.memberExpression(
                    t.identifier("styles"),
                    t.identifier("icon")
                  ),
                  t.stringLiteral(CLASS_NAME)
                ])
              )
            )
          ];
        }

        if (path.node.name.name === "path") {
          const removeAttrs = [...PATH_REMOVE_ATTRS];
          if (countPath === 1) {
            removeAttrs.push("fill");
          }
          path.node.attributes = [
            ...path.node.attributes.filter(
              a => !removeAttrs.includes(a.name.name)
            )
          ];
        }
      }
    }
  };
};

module.exports = pbfiedPlugin;
