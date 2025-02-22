# Phase 2: Core DSL & Module Infrastructure

## Overview
This phase implements the core Domain-Specific Language (DSL) and module infrastructure for DS.js. We'll create the foundational types, interfaces, and base classes that form the backbone of the framework.

## Implementation Steps

### 1. Core Types and Interfaces (src/core/signature.ts)

```typescript
/**
 * Defines the structure for input and output fields of a DS.js module.
 */
export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  description?: string;
  required?: boolean;
}

/**
 * The signature interface describes the expected input and output fields for a module.
 */
export interface Signature {
  inputs: FieldDefinition[];
  outputs: FieldDefinition[];
}

/**
 * Type guard to validate field definitions
 */
export function isValidFieldDefinition(field: any): field is FieldDefinition {
  return (
    typeof field === 'object' &&
    typeof field.name === 'string' &&
    ['string', 'number', 'boolean', 'object'].includes(field.type)
  );
}
```

### 2. Base Module Class (src/core/module.ts)

```typescript
import { Signature } from './signature';
import { LMDriver } from '../lm/base';

/**
 * Base class for DS.js modules.
 * Each module must define a signature and implement the run method.
 */
export abstract class Module<TInput, TOutput> {
  public name: string;
  public signature: Signature;
  public promptTemplate: (input: TInput) => string;
  public strategy: 'Predict' | 'ChainOfThought' | 'ReAct';

  constructor(options: {
    name: string;
    signature: Signature;
    promptTemplate: (input: TInput) => string;
    strategy: 'Predict' | 'ChainOfThought' | 'ReAct';
  }) {
    this.name = options.name;
    this.signature = options.signature;
    this.promptTemplate = options.promptTemplate;
    this.strategy = options.strategy;
  }

  /**
   * Runs the module on the given input.
   * @param input - The input data to process
   * @returns A promise that resolves to the output data
   */
  public abstract run(input: TInput): Promise<TOutput>;

  /**
   * Validates that the input matches the module's input signature
   */
  protected validateInput(input: TInput): void {
    // Implementation will be added in TDD cycle
  }

  /**
   * Validates that the output matches the module's output signature
   */
  protected validateOutput(output: TOutput): void {
    // Implementation will be added in TDD cycle
  }
}
```

### 3. Pipeline Executor (src/core/pipeline.ts)

```typescript
import { Module } from './module';

/**
 * Configuration for pipeline execution
 */
export interface PipelineConfig {
  stopOnError?: boolean;
  debug?: boolean;
}

/**
 * Executes a series of DS.js modules as a pipeline.
 * Each module's output is passed as input to the next module.
 */
export async function runPipeline(
  modules: Array<Module<any, any>>,
  initialInput: any,
  config: PipelineConfig = { stopOnError: true, debug: false }
): Promise<any> {
  let currentData = initialInput;

  for (const module of modules) {
    try {
      if (config.debug) {
        console.log(`Running module: ${module.name}`);
        console.log('Input:', currentData);
      }

      currentData = await module.run(currentData);

      if (config.debug) {
        console.log('Output:', currentData);
      }
    } catch (error) {
      if (config.stopOnError) {
        throw error;
      }
      console.error(`Error in module ${module.name}:`, error);
    }
  }

  return currentData;
}
```

## TDD Implementation Steps

### 1. Signature Tests (tests/core/signature.spec.ts)

```typescript
import { isValidFieldDefinition, FieldDefinition } from '../../src/core/signature';

describe('Field Definition Validation', () => {
  it('should validate correct field definitions', () => {
    const validField: FieldDefinition = {
      name: 'testField',
      type: 'string',
      description: 'A test field'
    };
    expect(isValidFieldDefinition(validField)).toBe(true);
  });

  it('should reject invalid field definitions', () => {
    const invalidField = {
      name: 'testField',
      type: 'invalid_type'
    };
    expect(isValidFieldDefinition(invalidField)).toBe(false);
  });
});
```

### 2. Module Tests (tests/core/module.spec.ts)

```typescript
import { Module } from '../../src/core/module';

// Create a concrete test module
class TestModule extends Module<{ input: string }, { output: string }> {
  constructor() {
    super({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
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
});
```

### 3. Pipeline Tests (tests/core/pipeline.spec.ts)

```typescript
import { runPipeline } from '../../src/core/pipeline';
import { Module } from '../../src/core/module';

// Create test modules for pipeline testing
class UppercaseModule extends Module<{ text: string }, { upper: string }> {
  constructor() {
    super({
      name: 'UppercaseModule',
      signature: {
        inputs: [{ name: 'text', type: 'string' }],
        outputs: [{ name: 'upper', type: 'string' }]
      },
      promptTemplate: ({ text }) => text,
      strategy: 'Predict'
    });
  }

  async run(input: { text: string }): Promise<{ upper: string }> {
    return { upper: input.text.toUpperCase() };
  }
}

class PrefixModule extends Module<{ upper: string }, { result: string }> {
  constructor() {
    super({
      name: 'PrefixModule',
      signature: {
        inputs: [{ name: 'upper', type: 'string' }],
        outputs: [{ name: 'result', type: 'string' }]
      },
      promptTemplate: ({ upper }) => upper,
      strategy: 'Predict'
    });
  }

  async run(input: { upper: string }): Promise<{ result: string }> {
    return { result: `PREFIX_${input.upper}` };
  }
}

describe('Pipeline Executor', () => {
  it('should execute modules in sequence', async () => {
    const modules = [
      new UppercaseModule(),
      new PrefixModule()
    ];

    const result = await runPipeline(modules, { text: 'hello' });
    expect(result.result).toBe('PREFIX_HELLO');
  });

  it('should handle errors according to config', async () => {
    const errorModule = new (class extends Module<any, any> {
      constructor() {
        super({
          name: 'ErrorModule',
          signature: { inputs: [], outputs: [] },
          promptTemplate: () => '',
          strategy: 'Predict'
        });
      }

      async run(): Promise<any> {
        throw new Error('Test error');
      }
    })();

    // Should throw with stopOnError: true
    await expect(runPipeline([errorModule], {}, { stopOnError: true }))
      .rejects.toThrow('Test error');

    // Should not throw with stopOnError: false
    const result = await runPipeline([errorModule], {}, { stopOnError: false });
    expect(result).toEqual({});
  });
});
```

## Implementation Order

1. Start with `signature.ts`:
   - Implement and test field validation
   - Verify type definitions work as expected

2. Move to `module.ts`:
   - Create the abstract base class
   - Implement input/output validation
   - Test with a concrete test module

3. Finally, implement `pipeline.ts`:
   - Create the pipeline executor
   - Test with multiple modules
   - Verify error handling and configuration options

## Commit Guidelines

After each component is implemented and tested:

1. Signature Implementation:
```bash
git add src/core/signature.ts tests/core/signature.spec.ts
git commit -m "Implement core signature types and validation"
```

2. Module Implementation:
```bash
git add src/core/module.ts tests/core/module.spec.ts
git commit -m "Implement base Module class with tests"
```

3. Pipeline Implementation:
```bash
git add src/core/pipeline.ts tests/core/pipeline.spec.ts
git commit -m "Implement pipeline executor with tests"
```

## Success Criteria

- [ ] All core types and interfaces are properly defined
- [ ] Base Module class is implemented with proper type safety
- [ ] Pipeline executor successfully chains module execution
- [ ] All tests pass with good coverage
- [ ] TypeScript compilation succeeds without errors
- [ ] Code follows established style guidelines
- [ ] Documentation is complete and clear

## Next Steps

Once this phase is complete, proceed to Phase 3 (LM Driver & DummyLM) where we'll implement the language model interface and a dummy implementation for testing.

## Troubleshooting

### Common Issues

1. **Type Errors**
   - Verify generic type parameters are properly constrained
   - Check that input/output types match module signatures
   - Ensure proper type guards are in place

2. **Pipeline Execution Issues**
   - Verify that module outputs match next module's input requirements
   - Check async/await usage in pipeline executor
   - Validate error handling behavior

3. **Test Failures**
   - Ensure test modules are properly implemented
   - Verify mock implementations match interfaces
   - Check for proper async test handling

### Version Compatibility

- TypeScript: ^4.9.0
- Jest: ^29.0.0
