/* eslint-disable @typescript-eslint/no-var-requires */
const CodeGen = require('swagger-js-codegen').CodeGen;
const {
  addNullToNullableEnums,
} = require('../../../../../../scripts/generate-api');

describe('generate-api', () => {
  it('generates null unions for enums described as nullable', () => {
    const swagger = {
      swagger: '2.0',
      info: {},
      paths: {},
      definitions: {
        LevelInfo: {
          type: 'object',
          properties: {
            highestDiagnosticLevel: {
              type: 'string',
              description: '(Nullable) The highest diagnostic level.',
              enum: ['LEVEL_Dx1', 'NO'],
            },
          },
        },
      },
    };

    addNullToNullableEnums(swagger);

    const output = CodeGen.getTypescriptCode({
      className: 'TestAPI',
      swagger,
    });
    expect(output).toContain(
      `'highestDiagnosticLevel': "LEVEL_Dx1" | "NO" | null`
    );
  });
});
