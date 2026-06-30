const fs = require('fs');
const path = require('path');
const CodeGen = require('swagger-js-codegen').CodeGen;

function addNullToNullableEnums(value) {
  if (!value || typeof value !== 'object') {
    return;
  }

  const nullable =
    typeof value.description === 'string' &&
    value.description.trim().startsWith('(Nullable)');

  if (nullable && Array.isArray(value.enum) && !value.enum.includes(null)) {
    value.enum.push(null);
  }

  Object.values(value).forEach(addNullToNullableEnums);
}

function generateApi(folder, classNames) {
  for (const className of classNames) {
    const swagger = JSON.parse(
      fs.readFileSync(path.join(folder, `${className}-docs.json`))
    );
    addNullToNullableEnums(swagger);

    const tsSourceCode = CodeGen.getTypescriptCode({ className, swagger });
    fs.writeFileSync(path.join(folder, `${className}.ts`), tsSourceCode);
  }
}

if (require.main === module) {
  const [, , folder, ...classNames] = process.argv;
  generateApi(folder, classNames);
}

module.exports = { addNullToNullableEnums, generateApi };
