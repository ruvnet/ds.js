# Phase 6: Module Implementations & Pipeline Orchestration

## Overview
This phase implements concrete module types and the pipeline orchestration system. We'll create the PredictModule for single-step LM calls and implement the pipeline executor to chain modules together effectively.

## Implementation Steps

### 1. Predict Module Implementation (src/modules/predict.ts)

```typescript
import { Module } from '../core/module';
import { Signature } from '../core/signature';
import { getLM } from '../index';

/**
 * PredictModule implements a simple single-step prediction module.
 * It formats a prompt, calls the LM, and parses the response.
 */
export class PredictModule<TInput, TOutput> extends Module<TInput, TOutput> {
  constructor(options: {
    name: string;
    signature: Signature;
    promptTemplate: (input: TInput) => string;
  }) {
    super({
      name: options.name,
      signature: options.signature,
      promptTemplate: options.promptTemplate,
      strategy: 'Predict'
    });
  }

  /**
   * Run the module with the given input
   */
  public async run(input: TInput): Promise<TOutput> {
    try {
      // Validate input against signature
      this.validateInput(input);

      // Format the prompt using the template
      const prompt = this.promptTemplate(input);

      // Get the global LM instance
      const lm = getLM();

      // Generate response from LM
      const response = await lm.generate(prompt);

      // Parse the response into structured output
      const output = this.parseResponse(response);

      // Validate output against signature
      this.validateOutput(output);

      return output;
    } catch (error) {
      throw new Error(`Error in ${this.name}: ${error.message}`);
    }
  }

  /**
   * Parse LM response into structured output
   * This is a basic implementation - extend for specific needs
   */
  private parseResponse(response: string): TOutput {
    try {
      // For MVP, attempt to parse as JSON
      // In practice, you might need more sophisticated parsing
      return JSON.parse(response) as TOutput;
    } catch {
      // If JSON parsing fails, return response as-is if output signature has a single string field
      if (this.signature.outputs.length === 1 && this.signature.outputs[0].type === 'string') {
        return { [this.signature.outputs[0].name]: response } as TOutput;
      }
      throw new Error('Failed to parse LM response');
    }
  }

  /**
   * Validate input against module signature
   */
  protected validateInput(input: TInput): void {
    for (const field of this.signature.inputs) {
      const value = (input as any)[field.name];
      
      if (field.required !== false && value === undefined) {
        throw new Error(`Missing required input field: ${field.name}`);
      }

      if (value !== undefined && typeof value !== field.type) {
        throw new Error(
          `Invalid type for input field ${field.name}. Expected ${field.type}, got ${typeof value}`
        );
      }
    }
  }

  /**
   * Validate output against module signature
   */
  protected validateOutput(output: TOutput): void {
    for (const field of this.signature.outputs) {
      const value = (output as any)[field.name];
      
      if (field.required !== false && value === undefined) {
        throw new Error(`Missing required output field: ${field.name}`);
      }

      if (value !== undefined && typeof value !== field.type) {
        throw new Error(
          `Invalid type for output field ${field.name}. Expected ${field.type}, got ${typeof value}`
        );
      }
    }
  }
}
```

### 2. Pipeline Orchestrator Implementation (src/core/pipeline.ts)

```typescript
import { Module } from './module';

/**
 * Configuration options for pipeline execution
 */
export interface PipelineConfig {
  stopOnError?: boolean;
  debug?: boolean;
  maxRetries?: number;
  retryDelay?: number;  // milliseconds
}

/**
 * Result of a pipeline execution step
 */
interface StepResult {
  moduleName: string;
  input: any;
  output: any;
  duration: number;
  error?: Error;
}

/**
 * Pipeline execution result
 */
export interface PipelineResult {
  finalOutput: any;
  steps: StepResult[];
  totalDuration: number;
  success: boolean;
  error?: Error;
}

/**
 * Executes a series of DS.js modules as a pipeline
 */
export class Pipeline {
  private modules: Module<any, any>[];
  private config: PipelineConfig;

  constructor(
    modules: Module<any, any>[],
    config: PipelineConfig = {}
  ) {
    this.modules = modules;
    this.config = {
      stopOnError: true,
      debug: false,
      maxRetries: 0,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * Execute the pipeline with initial input
   */
  public async run(initialInput: any): Promise<PipelineResult> {
    const startTime = Date.now();
    const steps: StepResult[] = [];
    let currentData = initialInput;

    try {
      for (const module of this.modules) {
        const stepResult = await this.executeStep(module, currentData);
        steps.push(stepResult);

        if (stepResult.error) {
          if (this.config.stopOnError) {
            return this.createErrorResult(steps, startTime, stepResult.error);
          }
          // If not stopping on error, continue with original input
          this.logDebug(`Continuing after error in ${module.name}`);
        } else {
          // Only update current data if step succeeded
          currentData = stepResult.output;
        }
      }

      return {
        finalOutput: currentData,
        steps,
        totalDuration: Date.now() - startTime,
        success: true
      };
    } catch (error) {
      return this.createErrorResult(steps, startTime, error as Error);
    }
  }

  /**
   * Execute a single pipeline step with retry logic
   */
  private async executeStep(
    module: Module<any, any>,
    input: any
  ): Promise<StepResult> {
    const stepStart = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries!; attempt++) {
      try {
        if (attempt > 0) {
          this.logDebug(`Retrying ${module.name} (attempt ${attempt + 1})`);
          await this.delay(this.config.retryDelay!);
        }

        const output = await module.run(input);
        
        return {
          moduleName: module.name,
          input,
          output,
          duration: Date.now() - stepStart
        };
      } catch (error) {
        lastError = error as Error;
        this.logDebug(`Error in ${module.name}: ${error}`);
      }
    }

    return {
      moduleName: module.name,
      input,
      output: input,  // On failure, pass through original input
      duration: Date.now() - stepStart,
      error: lastError
    };
  }

  /**
   * Create error result object
   */
  private createErrorResult(
    steps: StepResult[],
    startTime: number,
    error: Error
  ): PipelineResult {
    return {
      finalOutput: null,
      steps,
      totalDuration: Date.now() - startTime,
      success: false,
      error
    };
  }

  /**
   * Log debug message if debug mode is enabled
   */
  private logDebug(message: string): void {
    if (this.config.debug) {
      console.log(`[Pipeline Debug] ${message}`);
    }
  }

  /**
   * Helper to create a delay promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 3. Module Factory Implementation (src/core/factory.ts)

```typescript
import { Module } from './module';
import { Signature } from './signature';
import { PredictModule } from '../modules/predict';

/**
 * Options for creating a module
 */
export interface ModuleOptions<TInput, TOutput> {
  name: string;
  signature: Signature;
  promptTemplate: (input: TInput) => string;
  strategy?: 'Predict' | 'ChainOfThought' | 'ReAct';
}

/**
 * Factory function to create modules based on strategy
 */
export function defineModule<TInput, TOutput>(
  options: ModuleOptions<TInput, TOutput>
): Module<TInput, TOutput> {
  const strategy = options.strategy || 'Predict';

  switch (strategy) {
    case 'Predict':
      return new PredictModule<TInput, TOutput>(options);
    
    case 'ChainOfThought':
    case 'ReAct':
      // These will be implemented in future phases
      throw new Error(`Strategy ${strategy} not yet implemented`);
    
    default:
      throw new Error(`Unknown strategy: ${strategy}`);
  }
}
```

## TDD Implementation Steps

### 1. Predict Module Tests (tests/modules/predict.spec.ts)

```typescript
import { PredictModule } from '../../src/modules/predict';
import { configureLM } from '../../src/index';
import { DummyLM } from '../../src/lm/dummy';

describe('PredictModule', () => {
  beforeAll(() => {
    // Configure a DummyLM that returns JSON responses
    const dummyLM = new DummyLM(new Map([
      ['{"name":"test"}', '{"greeting":"Hello, test!"}']
    ]));
    configureLM(dummyLM);
  });

  it('should create module with correct configuration', () => {
    const module = new PredictModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'name', type: 'string' }],
        outputs: [{ name: 'greeting', type: 'string' }]
      },
      promptTemplate: ({ name }) => JSON.stringify({ name })
    });

    expect(module.name).toBe('TestModule');
    expect(module.strategy).toBe('Predict');
  });

  it('should validate input fields', async () => {
    const module = new PredictModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'name', type: 'string', required: true }],
        outputs: [{ name: 'greeting', type: 'string' }]
      },
      promptTemplate: ({ name }) => JSON.stringify({ name })
    });

    await expect(module.run({} as any))
      .rejects.toThrow('Missing required input field: name');
  });

  it('should run successfully with valid input', async () => {
    const module = new PredictModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'name', type: 'string' }],
        outputs: [{ name: 'greeting', type: 'string' }]
      },
      promptTemplate: ({ name }) => JSON.stringify({ name })
    });

    const result = await module.run({ name: 'test' });
    expect(result.greeting).toBe('Hello, test!');
  });
});
```

### 2. Pipeline Tests (tests/core/pipeline.spec.ts)

```typescript
import { Pipeline, PipelineConfig } from '../../src/core/pipeline';
import { Module } from '../../src/core/module';
import { PredictModule } from '../../src/modules/predict';
import { configureLM } from '../../src/index';
import { DummyLM } from '../../src/lm/dummy';

describe('Pipeline', () => {
  beforeAll(() => {
    const dummyLM = new DummyLM();
    configureLM(dummyLM);
  });

  it('should execute modules in sequence', async () => {
    const module1 = new PredictModule({
      name: 'Module1',
      signature: {
        inputs: [{ name: 'text', type: 'string' }],
        outputs: [{ name: 'upper', type: 'string' }]
      },
      promptTemplate: ({ text }) => text.toUpperCase()
    });

    const module2 = new PredictModule({
      name: 'Module2',
      signature: {
        inputs: [{ name: 'upper', type: 'string' }],
        outputs: [{ name: 'result', type: 'string' }]
      },
      promptTemplate: ({ upper }) => `Processed: ${upper}`
    });

    const pipeline = new Pipeline([module1, module2]);
    const result = await pipeline.run({ text: 'hello' });

    expect(result.success).toBe(true);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].moduleName).toBe('Module1');
    expect(result.steps[1].moduleName).toBe('Module2');
  });

  it('should handle errors according to config', async () => {
    const errorModule = new PredictModule({
      name: 'ErrorModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: () => { throw new Error('Test error'); }
    });

    // With stopOnError: true
    const strictPipeline = new Pipeline([errorModule], { stopOnError: true });
    const strictResult = await strictPipeline.run({ input: 'test' });
    expect(strictResult.success).toBe(false);
    expect(strictResult.error).toBeDefined();

    // With stopOnError: false
    const lenientPipeline = new Pipeline([errorModule], { stopOnError: false });
    const lenientResult = await lenientPipeline.run({ input: 'test' });
    expect(lenientResult.steps[0].error).toBeDefined();
    expect(lenientResult.finalOutput).toEqual({ input: 'test' });
  });

  it('should support retry logic', async () => {
    let attempts = 0;
    const retryModule = new PredictModule({
      name: 'RetryModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: () => {
        attempts++;
        if (attempts === 1) throw new Error('First attempt fails');
        return 'Success';
      }
    });

    const pipeline = new Pipeline([retryModule], {
      maxRetries: 1,
      retryDelay: 100
    });

    const result = await pipeline.run({ input: 'test' });
    expect(result.success).toBe(true);
    expect(attempts).toBe(2);
  });
});
```

### 3. Module Factory Tests (tests/core/factory.spec.ts)

```typescript
import { defineModule } from '../../src/core/factory';
import { PredictModule } from '../../src/modules/predict';

describe('Module Factory', () => {
  it('should create PredictModule by default', () => {
    const module = defineModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: ({ input }) => input
    });

    expect(module).toBeInstanceOf(PredictModule);
    expect(module.strategy).toBe('Predict');
  });

  it('should throw error for unimplemented strategies', () => {
    expect(() => defineModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: ({ input }) => input,
      strategy: 'ChainOfThought'
    })).toThrow('Strategy ChainOfThought not yet implemented');
  });
});
```

## Implementation Order

1. Start with PredictModule:
   - Implement basic module functionality
   - Add input/output validation
   - Write comprehensive tests

2. Move to Pipeline implementation:
   - Create Pipeline class with configuration
   - Implement step execution and retry logic
   - Add error handling and debugging
   - Write tests for various scenarios

3. Finally, implement Module Factory:
   - Create factory function for module instantiation
   - Add strategy-based module creation
   - Write tests for different strategies

## Commit Guidelines

After each component is implemented and tested:

1. PredictModule Implementation:
```bash
git add src/modules/predict.ts tests/modules/predict.spec.ts
git commit -m "Implement PredictModule with validation and tests"
```

2. Pipeline Implementation:
```bash
git add src/core/pipeline.ts tests/core/pipeline.spec.ts
git commit -m "Implement Pipeline orchestrator with retry logic and tests"
```

3. Module Factory:
```bash
git add src/core/factory.ts tests/core/factory.spec.ts
git commit -m "Implement Module factory with strategy support"
```

## Success Criteria

- [ ] PredictModule successfully processes inputs and outputs
- [ ] Pipeline correctly chains multiple modules
- [ ] Error handling and retry logic work as expected
- [ ] Module factory creates appropriate module types
- [ ] Input/output validation is robust
- [ ] All tests pass with good coverage
- [ ] Documentation is complete and clear

## Next Steps

Once this phase is complete, proceed to Phase 7 (Documentation & Examples) where we'll create comprehensive documentation and example implementations.

## Troubleshooting

### Common Issues

1. **Module Execution**
   - Verify input/output validation
   - Check prompt template formatting
   - Monitor LM response parsing

2. **Pipeline Issues**
   - Check module sequence compatibility
   - Verify error propagation
   - Monitor retry behavior

3. **Factory Issues**
   - Verify strategy handling
   - Check module initialization
   - Monitor configuration validation

### Version Compatibility

- TypeScript: ^4.9.0
- Jest: ^29.0.0
