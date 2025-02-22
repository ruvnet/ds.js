import { Module } from '../../src/core/module';
import { Signature } from '../../src/core/signature';

// Create a concrete test module for testing
class TestModule extends Module<{ input: string }, { output: string }> {
  constructor() {
    super({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'input', type: 'string', required: true }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: ({ input }) => `Test prompt with ${input}`,
      strategy: 'Predict'
    });
  }

  async run(input: { input: string }): Promise<{ output: string }> {
    this.validateInput(input);
    const result = { output: `Processed: ${input.input}` };
    this.validateOutput(result);
    return result;
  }
}

describe('Module Base Class', () => {
  let testModule: TestModule;

  beforeEach(() => {
    testModule = new TestModule();
  });

  it('should initialize with correct properties', () => {
    expect(testModule.name).toBe('TestModule');
    expect(testModule.strategy).toBe('Predict');
    expect(testModule.signature.inputs).toHaveLength(1);
    expect(testModule.signature.outputs).toHaveLength(1);
  });

  it('should generate correct prompt from template', () => {
    const prompt = testModule.promptTemplate({ input: 'test' });
    expect(prompt).toBe('Test prompt with test');
  });

  it('should process input and return output', async () => {
    const result = await testModule.run({ input: 'test' });
    expect(result.output).toBe('Processed: test');
  });

  it('should validate input correctly', async () => {
    await expect(testModule.run({ input: 123 as any }))
      .rejects
      .toThrow('Invalid input: input must be of type string');

    await expect(testModule.run({} as any))
      .rejects
      .toThrow('Missing required input field: input');
  });

  it('should validate different input types', async () => {
    class MultiTypeModule extends Module<
      {
        strField: string;
        numField: number;
        boolField: boolean;
        objField: object;
      },
      { output: string }
    > {
      constructor() {
        super({
          name: 'MultiTypeModule',
          signature: {
            inputs: [
              { name: 'strField', type: 'string', required: true },
              { name: 'numField', type: 'number', required: true },
              { name: 'boolField', type: 'boolean', required: true },
              { name: 'objField', type: 'object', required: true }
            ],
            outputs: [{ name: 'output', type: 'string' }]
          },
          promptTemplate: () => 'test',
          strategy: 'Predict'
        });
      }

      async run(input: { strField: string; numField: number; boolField: boolean; objField: object }): Promise<{ output: string }> {
        this.validateInput(input);
        return { output: 'test' };
      }
    }

    const multiTypeModule = new MultiTypeModule();

    // Test invalid types
    await expect(multiTypeModule.run({
      strField: 123 as any,
      numField: 42,
      boolField: true,
      objField: {}
    })).rejects.toThrow('Invalid input: strField must be of type string');

    await expect(multiTypeModule.run({
      strField: 'test',
      numField: '42' as any,
      boolField: true,
      objField: {}
    })).rejects.toThrow('Invalid input: numField must be of type number');

    await expect(multiTypeModule.run({
      strField: 'test',
      numField: 42,
      boolField: 'true' as any,
      objField: {}
    })).rejects.toThrow('Invalid input: boolField must be of type boolean');

    await expect(multiTypeModule.run({
      strField: 'test',
      numField: 42,
      boolField: true,
      objField: null as any
    })).rejects.toThrow('Invalid input: objField must be of type object');

    // Test valid input
    await expect(multiTypeModule.run({
      strField: 'test',
      numField: 42,
      boolField: true,
      objField: { test: true }
    })).resolves.toEqual({ output: 'test' });
  });

  it('should validate output correctly', async () => {
    class MultiTypeOutputModule extends Module<
      { input: string },
      {
        strField: string;
        numField: number;
        boolField: boolean;
        objField: object;
      }
    > {
      constructor() {
        super({
          name: 'MultiTypeOutputModule',
          signature: {
            inputs: [{ name: 'input', type: 'string', required: true }],
            outputs: [
              { name: 'strField', type: 'string', required: true },
              { name: 'numField', type: 'number', required: true },
              { name: 'boolField', type: 'boolean', required: true },
              { name: 'objField', type: 'object', required: true }
            ]
          },
          promptTemplate: () => 'test',
          strategy: 'Predict'
        });
      }

      async run(input: { input: string }): Promise<any> {
        this.validateInput(input);
        
        // Test invalid string
        const invalidString = {
          strField: 42 as any,
          numField: 42,
          boolField: true,
          objField: {}
        };
        this.validateOutput(invalidString);
        return invalidString;
      }
    }

    const multiTypeModule = new MultiTypeOutputModule();

    // Test invalid string output
    await expect(multiTypeModule.run({ input: 'test' }))
      .rejects
      .toThrow('Invalid output: strField must be of type string');

    // Test invalid number output
    const invalidNumberModule = new class extends MultiTypeOutputModule {
      async run(input: { input: string }): Promise<any> {
        this.validateInput(input);
        const result = {
          strField: 'test',
          numField: '42' as any,
          boolField: true,
          objField: {}
        };
        this.validateOutput(result);
        return result;
      }
    }();
    await expect(invalidNumberModule.run({ input: 'test' }))
      .rejects
      .toThrow('Invalid output: numField must be of type number');

    // Test invalid boolean output
    const invalidBooleanModule = new class extends MultiTypeOutputModule {
      async run(input: { input: string }): Promise<any> {
        this.validateInput(input);
        const result = {
          strField: 'test',
          numField: 42,
          boolField: 'true' as any,
          objField: {}
        };
        this.validateOutput(result);
        return result;
      }
    }();
    await expect(invalidBooleanModule.run({ input: 'test' }))
      .rejects
      .toThrow('Invalid output: boolField must be of type boolean');

    // Test invalid object output
    const invalidObjectModule = new class extends MultiTypeOutputModule {
      async run(input: { input: string }): Promise<any> {
        this.validateInput(input);
        const result = {
          strField: 'test',
          numField: 42,
          boolField: true,
          objField: null as any
        };
        this.validateOutput(result);
        return result;
      }
    }();
    await expect(invalidObjectModule.run({ input: 'test' }))
      .rejects
      .toThrow('Invalid output: objField must be of type object');

    // Test valid output
    const validModule = new class extends MultiTypeOutputModule {
      async run(input: { input: string }) {
        this.validateInput(input);
        const result = {
          strField: 'test',
          numField: 42,
          boolField: true,
          objField: { test: true }
        };
        this.validateOutput(result);
        return result;
      }
    }();
    await expect(validModule.run({ input: 'test' }))
      .resolves
      .toEqual({
        strField: 'test',
        numField: 42,
        boolField: true,
        objField: { test: true }
      });
  });

  it('should handle optional input fields', async () => {
    class OptionalTestModule extends Module<{ required: string; optional?: number }, { output: string }> {
      constructor() {
        super({
          name: 'OptionalModule',
          signature: {
            inputs: [
              { name: 'required', type: 'string', required: true },
              { name: 'optional', type: 'number' }
            ],
            outputs: [{ name: 'output', type: 'string' }]
          },
          promptTemplate: () => 'test',
          strategy: 'Predict'
        });
      }

      async run(input: { required: string; optional?: number }): Promise<{ output: string }> {
        this.validateInput(input);
        const result = { output: `${input.required}:${input.optional ?? 'none'}` };
        this.validateOutput(result);
        return result;
      }
    }

    const moduleWithOptional = new OptionalTestModule();

    const result = await moduleWithOptional.run({ required: 'test' });
    expect(result.output).toBe('test:none');

    const resultWithOptional = await moduleWithOptional.run({ required: 'test', optional: 42 });
    expect(resultWithOptional.output).toBe('test:42');
  });
});
