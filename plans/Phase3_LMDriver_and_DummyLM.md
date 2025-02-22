# Phase 3: LM Driver & DummyLM Implementation

## Overview
This phase implements the Language Model (LM) driver interface and a dummy implementation for testing. The LM driver provides an abstraction layer between DS.js modules and the actual language model implementation, whether that's ONNX Runtime, JS-PyTorch, or other backends.

## Implementation Steps

### 1. LM Driver Interface (src/lm/base.ts)

```typescript
/**
 * Configuration options for LM generation
 */
export interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
}

/**
 * Abstract interface for language model drivers.
 * All LM implementations must implement this interface.
 */
export interface LMDriver {
  /**
   * Generate output based on the input prompt.
   * @param prompt - The input prompt text
   * @param options - Optional generation parameters
   * @returns A promise that resolves to the generated text
   */
  generate(prompt: string, options?: GenerationOptions): Promise<string>;

  /**
   * Optional method to initialize any resources needed by the LM
   */
  init?(): Promise<void>;

  /**
   * Optional method to clean up resources
   */
  cleanup?(): Promise<void>;
}

/**
 * Error class for LM-related errors
 */
export class LMError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'LMError';
  }
}
```

### 2. Dummy LM Implementation (src/lm/dummy.ts)

```typescript
import { LMDriver, GenerationOptions, LMError } from './base';

/**
 * DummyLM provides a mock implementation of the LM interface.
 * Useful for testing and as a fallback during development.
 */
export class DummyLM implements LMDriver {
  private initialized: boolean = false;
  private responses: Map<string, string>;

  constructor(customResponses?: Map<string, string>) {
    this.responses = customResponses || new Map();
  }

  /**
   * Initialize the dummy LM
   */
  public async init(): Promise<void> {
    this.initialized = true;
  }

  /**
   * Generate a response based on the prompt.
   * Returns either a custom response if defined, or a default response.
   */
  public async generate(prompt: string, options?: GenerationOptions): Promise<string> {
    if (!this.initialized) {
      throw new LMError('DummyLM not initialized. Call init() first.');
    }

    // If a custom response is defined for this prompt, return it
    if (this.responses.has(prompt)) {
      return this.responses.get(prompt)!;
    }

    // Generate a deterministic but unique response based on the prompt
    return this.generateDefaultResponse(prompt, options);
  }

  /**
   * Clean up any resources (no-op for DummyLM)
   */
  public async cleanup(): Promise<void> {
    this.initialized = false;
  }

  /**
   * Add or update a custom response for a specific prompt
   */
  public setResponse(prompt: string, response: string): void {
    this.responses.set(prompt, response);
  }

  /**
   * Clear all custom responses
   */
  public clearResponses(): void {
    this.responses.clear();
  }

  /**
   * Generate a default response for prompts without custom responses
   */
  private generateDefaultResponse(prompt: string, options?: GenerationOptions): string {
    const maxTokens = options?.maxTokens || 100;
    return `DummyLM response for prompt: "${prompt}" (limited to ${maxTokens} tokens)`;
  }
}
```

### 3. Global LM Configuration (src/index.ts)

```typescript
import { LMDriver } from './lm/base';
import { DummyLM } from './lm/dummy';

// Global variable to hold the LM driver
let globalLM: LMDriver | null = null;

/**
 * Configure the global language model driver
 */
export function configureLM(lm: LMDriver): void {
  globalLM = lm;
}

/**
 * Get the currently configured LM driver
 * @throws {LMError} if no LM is configured
 */
export function getLM(): LMDriver {
  if (!globalLM) {
    throw new LMError('No language model configured. Call configureLM() first.');
  }
  return globalLM;
}

// Export LM-related types and implementations
export { LMDriver, GenerationOptions, LMError } from './lm/base';
export { DummyLM } from './lm/dummy';
```

## TDD Implementation Steps

### 1. LM Driver Interface Tests (tests/lm/base.spec.ts)

```typescript
import { LMError } from '../../src/lm/base';

describe('LM Error', () => {
  it('should create error with cause', () => {
    const cause = new Error('Original error');
    const lmError = new LMError('LM failed', cause);
    
    expect(lmError.message).toBe('LM failed');
    expect(lmError.cause).toBe(cause);
    expect(lmError.name).toBe('LMError');
  });
});
```

### 2. DummyLM Tests (tests/lm/dummy.spec.ts)

```typescript
import { DummyLM } from '../../src/lm/dummy';
import { LMError } from '../../src/lm/base';

describe('DummyLM', () => {
  let dummyLM: DummyLM;

  beforeEach(() => {
    dummyLM = new DummyLM();
  });

  it('should require initialization before use', async () => {
    await expect(dummyLM.generate('test')).rejects.toThrow(LMError);
    await dummyLM.init();
    await expect(dummyLM.generate('test')).resolves.toBeDefined();
  });

  it('should return custom responses when defined', async () => {
    const customResponses = new Map([
      ['test prompt', 'test response']
    ]);
    dummyLM = new DummyLM(customResponses);
    await dummyLM.init();

    const response = await dummyLM.generate('test prompt');
    expect(response).toBe('test response');
  });

  it('should generate default response for unknown prompts', async () => {
    await dummyLM.init();
    const response = await dummyLM.generate('unknown prompt');
    expect(response).toContain('unknown prompt');
    expect(response).toContain('DummyLM response');
  });

  it('should respect generation options', async () => {
    await dummyLM.init();
    const response = await dummyLM.generate('test', { maxTokens: 50 });
    expect(response).toContain('50 tokens');
  });

  it('should allow adding and clearing custom responses', async () => {
    await dummyLM.init();
    dummyLM.setResponse('custom prompt', 'custom response');
    
    let response = await dummyLM.generate('custom prompt');
    expect(response).toBe('custom response');

    dummyLM.clearResponses();
    response = await dummyLM.generate('custom prompt');
    expect(response).not.toBe('custom response');
    expect(response).toContain('DummyLM response');
  });
});
```

### 3. Global Configuration Tests (tests/index.spec.ts)

```typescript
import { configureLM, getLM, LMError } from '../src/index';
import { DummyLM } from '../src/lm/dummy';

describe('Global LM Configuration', () => {
  afterEach(() => {
    // Reset global LM after each test
    configureLM(null as any);
  });

  it('should throw error when LM is not configured', () => {
    expect(() => getLM()).toThrow(LMError);
  });

  it('should allow configuring and retrieving LM', async () => {
    const dummyLM = new DummyLM();
    await dummyLM.init();
    
    configureLM(dummyLM);
    expect(getLM()).toBe(dummyLM);
  });

  it('should work with custom responses', async () => {
    const dummyLM = new DummyLM(new Map([
      ['test', 'response']
    ]));
    await dummyLM.init();
    
    configureLM(dummyLM);
    const lm = getLM();
    const response = await lm.generate('test');
    expect(response).toBe('response');
  });
});
```

## Implementation Order

1. Start with `base.ts`:
   - Define the LMDriver interface
   - Implement the LMError class
   - Write basic tests for error handling

2. Move to `dummy.ts`:
   - Implement the DummyLM class
   - Add custom response functionality
   - Write comprehensive tests

3. Finally, implement global configuration:
   - Add configureLM and getLM functions
   - Test global configuration behavior
   - Verify integration with DummyLM

## Commit Guidelines

After each component is implemented and tested:

1. LM Driver Interface:
```bash
git add src/lm/base.ts tests/lm/base.spec.ts
git commit -m "Implement LM driver interface and error handling"
```

2. DummyLM Implementation:
```bash
git add src/lm/dummy.ts tests/lm/dummy.spec.ts
git commit -m "Implement DummyLM with custom responses"
```

3. Global Configuration:
```bash
git add src/index.ts tests/index.spec.ts
git commit -m "Add global LM configuration functionality"
```

## Success Criteria

- [ ] LMDriver interface is well-defined and documented
- [ ] DummyLM implementation works reliably for testing
- [ ] Global configuration functions work as expected
- [ ] All tests pass with good coverage
- [ ] Error handling is robust and informative
- [ ] TypeScript types are properly defined
- [ ] Documentation is complete and clear

## Next Steps

Once this phase is complete, proceed to Phase 4 (ONNX LM Driver) where we'll implement the ONNX Runtime Web integration for running actual language models.

## Troubleshooting

### Common Issues

1. **Initialization Issues**
   - Verify that init() is called before using DummyLM
   - Check that global LM is properly configured
   - Ensure proper error handling for uninitialized state

2. **Custom Response Issues**
   - Verify Map usage for custom responses
   - Check string matching for prompt lookup
   - Validate response format consistency

3. **Testing Issues**
   - Ensure proper cleanup between tests
   - Verify async/await usage in tests
   - Check for proper error class usage

### Version Compatibility

- TypeScript: ^4.9.0
- Jest: ^29.0.0
