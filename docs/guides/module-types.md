# DSPy.ts Module Types Guide

## Overview

DSPy.ts provides several module types to handle different language model interaction patterns. Each type is optimized for specific use cases and offers unique capabilities.

## Core Module Types

### 1. PredictModule

The basic module type for direct language model calls:

```typescript
const predictModule = defineModule<{ input: string }, { output: string }>({
  name: 'SimplePredictor',
  signature: {
    inputs: [{ name: 'input', type: 'string' }],
    outputs: [{ name: 'output', type: 'string' }]
  },
  promptTemplate: ({ input }) => input,
  strategy: 'Predict'  // default
});
```

**Use Cases:**
- Simple text completion
- Classification tasks
- Direct question answering
- Format conversion

### 2. ChainOfThought Module (Planned)

For complex reasoning tasks that require step-by-step thinking:

```typescript
const mathModule = defineModule<
  { problem: string },
  { steps: string[]; answer: number }
>({
  name: 'MathSolver',
  signature: {
    inputs: [{ name: 'problem', type: 'string' }],
    outputs: [
      { name: 'steps', type: 'object' },
      { name: 'answer', type: 'number' }
    ]
  },
  strategy: 'ChainOfThought',
  promptTemplate: ({ problem }) =>
    `Solve this math problem step by step:\n${problem}`
});
```

**Use Cases:**
- Math problem solving
- Complex reasoning tasks
- Multi-step analysis
- Decision making

### 3. ReAct Module (Planned)

Combines reasoning with tool use:

```typescript
const researchModule = defineModule<
  { query: string },
  { findings: string }
>({
  name: 'Researcher',
  signature: {
    inputs: [{ name: 'query', type: 'string' }],
    outputs: [{ name: 'findings', type: 'string' }]
  },
  strategy: 'ReAct',
  tools: [
    {
      name: 'search',
      description: 'Search the web',
      handler: async (query: string) => { /* ... */ }
    },
    {
      name: 'readUrl',
      description: 'Read content from URL',
      handler: async (url: string) => { /* ... */ }
    }
  ]
});
```

**Use Cases:**
- Web research
- API interaction
- Tool-based tasks
- Information gathering

## Utility Modules

### 1. ValidationModule

Validates inputs or outputs against specific criteria:

```typescript
const emailValidator = defineModule<
  { email: string },
  { isValid: boolean; errors: string[] }
>({
  name: 'EmailValidator',
  signature: {
    inputs: [{ name: 'email', type: 'string' }],
    outputs: [
      { name: 'isValid', type: 'boolean' },
      { name: 'errors', type: 'object' }
    ]
  },
  promptTemplate: ({ email }) =>
    `Validate this email address and list any issues:\n${email}`
});
```

### 2. TransformationModule

Transforms data between formats:

```typescript
const jsonToText = defineModule<
  { json: object },
  { description: string }
>({
  name: 'JsonDescriber',
  signature: {
    inputs: [{ name: 'json', type: 'object' }],
    outputs: [{ name: 'description', type: 'string' }]
  },
  promptTemplate: ({ json }) =>
    `Describe this JSON data in natural language:\n${JSON.stringify(json, null, 2)}`
});
```

### 3. CompositeModule

Combines multiple modules into a single unit:

```typescript
const qaModule = new CompositeModule({
  name: 'QuestionAnswerer',
  modules: [
    contextRetriever,
    answerGenerator,
    answerValidator
  ]
});
```

## Advanced Features

### 1. Input/Output Validation

All modules support runtime validation:

```typescript
const module = defineModule({
  // ...
  validate: {
    input: (input) => {
      if (!input.text) throw new Error('Text is required');
      return true;
    },
    output: (output) => {
      if (output.confidence < 0 || output.confidence > 1) {
        throw new Error('Confidence must be between 0 and 1');
      }
      return true;
    }
  }
});
```

### 2. Error Handling

Modules can specify error handling strategies:

```typescript
const robustModule = defineModule({
  // ...
  errorHandling: {
    retry: {
      maxAttempts: 3,
      delay: 1000
    },
    fallback: (error) => ({
      result: 'Unknown',
      confidence: 0
    })
  }
});
```

### 3. Caching

Enable caching for expensive operations:

```typescript
const cachedModule = defineModule({
  // ...
  cache: {
    enabled: true,
    ttl: 3600,  // seconds
    key: (input) => JSON.stringify(input)
  }
});
```

## Best Practices

1. **Choose the Right Module Type**
   - Use PredictModule for simple tasks
   - Use ChainOfThought for complex reasoning
   - Use ReAct when tool interaction is needed

2. **Design Clear Signatures**
   - Use descriptive field names
   - Include field descriptions
   - Mark required fields appropriately

3. **Handle Errors Gracefully**
   - Implement proper validation
   - Use retry strategies where appropriate
   - Provide fallback behavior

4. **Optimize Performance**
   - Use caching for repeated operations
   - Configure appropriate timeouts
   - Monitor resource usage

## Examples

Check out the [examples directory](../examples) for complete implementations of various module types and use cases.

## Future Module Types

The following module types are planned for future releases:

1. **FewShotModule**
   - Dynamic example selection
   - Example ranking and filtering
   - Automatic example generation

2. **SelfImprovingModule**
   - Demonstration collection
   - Automatic prompt optimization
   - Performance tracking

3. **ParallelModule**
   - Concurrent execution
   - Result aggregation
   - Load balancing

Stay tuned for updates and new module types in future releases!
