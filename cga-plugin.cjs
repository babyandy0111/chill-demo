
module.exports = function(babel) {
  const { types: t } = babel;
  return {
    name: "cga-source-mapping-plugin",
    visitor: {
      JSXOpeningElement(path, state) {
        const filename = state.file.opts.filename;
        if (!filename || filename.includes('node_modules') || filename.includes('.next') || filename.includes('.shadow')) return;
        
        // 💡 阻擋 Fragment，避免 Invalid prop warning
        const nameNode = path.node.name;
        if (
            (nameNode.type === "JSXIdentifier" && nameNode.name === "Fragment") ||
            (nameNode.type === "JSXMemberExpression" && nameNode.object.name === "React" && nameNode.property.name === "Fragment")
        ) {
            return;
        }

        const relativePath = filename.replace('/home/user/app', '');
        if (!path.node.attributes) return;
        const hasAttr = path.node.attributes.some(attr => t.isJSXAttribute(attr) && (attr.name.name === 'data-cga-path' || attr.name.name === 'data-cga-trace'));
        if (!hasAttr) {
          path.node.attributes.push(t.jsxAttribute(t.jsxIdentifier('data-cga-path'), t.stringLiteral(relativePath)));
        }
      }
    }
  };
};