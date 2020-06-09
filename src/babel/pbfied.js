// specific remove
const PATH_REMOVE_ATTRS = [];
const USE_REMOVE_ATTRS = [];
const SVG_REMOVE_ATTRS = ["width", "height"];

const CLASS_NAME = `pb-icon`;

const pbfiedPlugin = ({ types: t }, options) => {
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
      },
      JSXAttribute(path) {
        // scope all IDs to name of the Icon
        if (
          path.node.name.name === "id" &&
          t.isStringLiteral(path.node.value)
        ) {
          path.node.value.value = `${options.name}_${path.node.value.value}`;
        }

        // apply scoped IDs for url(#...)
        const isFunctionTakingId =
          t.isStringLiteral(path.node.value) &&
          /\(#[\w-]*\)/.test(path.node.value.value);

        const isXlink =
          path.node.name.name === "xlinkHref" &&
          t.isStringLiteral(path.node.value);

        if (isFunctionTakingId || isXlink) {
          path.node.value.value = path.node.value.value.replace(
            "#",
            `#${options.name}_`
          );
        }
      },
      JSXOpeningElement(path) {
        path.node.attributes = [
          ...path.node.attributes.filter(
            a => t.isJSXAttribute(a)
          )
        ];

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

        if (path.node.name.name === "use") {
          const removeAttrs = [...USE_REMOVE_ATTRS];
          path.node.attributes = [
            ...path.node.attributes.filter(
              a => !removeAttrs.includes(a.name.name)
            )
          ];
        }

        if (path.node.name.name === "path") {
          const removeAttrs = [...PATH_REMOVE_ATTRS];

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
