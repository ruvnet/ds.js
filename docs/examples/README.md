# DSPy.ts Examples

This directory contains practical examples demonstrating how to use DSPy.ts for various natural language processing tasks.

## Available Examples

### 1. [Sentiment Analysis](sentiment/README.md)
Build a sentiment analyzer that can:
- Classify text sentiment (positive/negative/neutral)
- Provide confidence scores
- Handle preprocessing and validation

### 2. [Question Answering](qa/README.md)
Create a QA system that can:
- Retrieve relevant context
- Generate accurate answers
- Validate responses
- Rank multiple contexts

### 3. [Text Classification](classification/README.md)
Implement a classification system that can:
- Categorize text into predefined classes
- Provide probability distributions
- Use ensemble methods
- Handle multiple models

### 4. [ReAct Agent](react/README.md)
Create an agent that can:
- Use tools to solve complex tasks
- Follow the ReAct (Reasoning + Acting) pattern
- Chain multiple tools together
- Handle multi-step reasoning

### 5. [Optimizer](optimize/README.md)
Improve module performance with:
- Automatic few-shot example generation
- Metric-based example selection
- Save/load optimized modules
- Pipeline optimization support

## Common Patterns

All examples demonstrate key DSPy.ts concepts:

1. **Module Definition**
   - Clear input/output signatures
   - Type safety with TypeScript
   - Prompt templates
   - Validation rules

2. **Pipeline Creation**
   - Module chaining
   - Error handling
   - Debugging
   - Performance optimization

3. **Testing**
   - Using DummyLM
   - Writing test cases
   - Validating outputs
   - Error scenarios

4. **Best Practices**
   - Input validation
   - Error handling
   - Performance optimization
   - Resource management

## Running the Examples

1. Install dependencies:
   ```bash
   npm install dspy.ts onnxruntime-web js-pytorch
   ```

2. Configure a language model:
   ```typescript
   import { configureLM, ONNXModel } from 'dspy.ts';
   
   const model = new ONNXModel({
     modelPath: 'path/to/model.onnx',
     executionProvider: 'wasm'
   });
   await model.init();
   configureLM(model);
   ```

3. Run any example:
   ```typescript
   import { sentimentModule } from './sentiment';
   
   const result = await sentimentModule.run({
     text: 'Sample text to analyze'
   });
   console.log(result);
   ```

## Advanced Usage

### 1. Custom Module Types

Create specialized modules for your use case:

```typescript
const customModule = defineModule({
  name: 'CustomProcessor',
  signature: {
    inputs: [/* your inputs */],
    outputs: [/* your outputs */]
  },
  strategy: 'Predict',  // or your custom strategy
  promptTemplate: (input) => /* your template */
});
```

### 2. Pipeline Composition

Combine multiple modules for complex workflows:

```typescript
const pipeline = new Pipeline([
  preprocessor,
  [classifier1, classifier2],  // parallel
  ensembleVoter,
  postprocessor
]);
```

### 3. Error Handling

Implement robust error handling:

```typescript
try {
  const result = await pipeline.run(input);
  if (!result.success) {
    // Handle pipeline failure
  }
} catch (error) {
  // Handle unexpected errors
}
```

### 4. Performance Optimization

Optimize for your needs:

```typescript
const optimizedPipeline = new Pipeline(modules, {
  cache: {
    enabled: true,
    ttl: 3600
  },
  batch: {
    size: 10,
    timeout: 1000
  }
});
```

## Contributing

Feel free to:
- Add new examples
- Improve existing ones
- Fix bugs
- Add documentation

Please follow the [contribution guidelines](../../CONTRIBUTING.md).

## Related Resources

- [Getting Started Guide](../guides/getting-started.md)
- [API Reference](../api/README.md)
- [Module Types Guide](../guides/module-types.md)
- [Pipeline Guide](../guides/pipeline-guide.md)
