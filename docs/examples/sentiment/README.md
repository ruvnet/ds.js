# Sentiment Analysis Example

This example demonstrates how to use DSPy.ts to build a sentiment analysis module that can classify text as positive, negative, or neutral, along with a confidence score.

## Overview

The sentiment analyzer uses a language model to:
1. Analyze input text
2. Determine sentiment (positive/negative/neutral)
3. Provide a confidence score

## Implementation

### Basic Module

```typescript
import { defineModule, configureLM, ONNXModel } from 'dspy.ts';

// Configure ONNX model
const model = new ONNXModel({
  modelPath: 'sentiment-model.onnx',
  executionProvider: 'wasm'
});
await model.init();
configureLM(model);

// Define sentiment analysis module
const sentimentModule = defineModule<
  { text: string },
  { sentiment: string; confidence: number }
>({
  name: 'SentimentAnalyzer',
  signature: {
    inputs: [
      { name: 'text', type: 'string', description: 'Text to analyze' }
    ],
    outputs: [
      { name: 'sentiment', type: 'string', description: 'Predicted sentiment' },
      { name: 'confidence', type: 'number', description: 'Confidence score' }
    ]
  },
  promptTemplate: ({ text }) =>
    `Analyze the sentiment of the following text and provide a sentiment label (positive/negative/neutral) with confidence score:\n"${text}"`
});

// Use the module
const result = await sentimentModule.run({
  text: 'I absolutely love this product! Best purchase ever.'
});

console.log(result);
// {
//   sentiment: 'positive',
//   confidence: 0.95
// }
```

### Advanced Implementation

For more robust sentiment analysis, we can create a pipeline that:
1. Preprocesses the text
2. Performs sentiment analysis
3. Validates the results

```typescript
import { Pipeline } from 'dspy.ts';

// Text preprocessing module
const preprocessModule = defineModule<
  { text: string },
  { cleanText: string }
>({
  name: 'TextPreprocessor',
  signature: {
    inputs: [{ name: 'text', type: 'string' }],
    outputs: [{ name: 'cleanText', type: 'string' }]
  },
  promptTemplate: ({ text }) =>
    `Clean and normalize this text for sentiment analysis:\n"${text}"`
});

// Sentiment analysis module
const sentimentModule = defineModule<
  { cleanText: string },
  { sentiment: string; confidence: number }
>({
  name: 'SentimentAnalyzer',
  signature: {
    inputs: [{ name: 'cleanText', type: 'string' }],
    outputs: [
      { name: 'sentiment', type: 'string' },
      { name: 'confidence', type: 'number' }
    ]
  },
  promptTemplate: ({ cleanText }) =>
    `Analyze the sentiment of the following text and provide a sentiment label (positive/negative/neutral) with confidence score:\n"${cleanText}"`
});

// Validation module
const validationModule = defineModule<
  { sentiment: string; confidence: number },
  { isValid: boolean; sentiment: string; confidence: number }
>({
  name: 'ResultValidator',
  signature: {
    inputs: [
      { name: 'sentiment', type: 'string' },
      { name: 'confidence', type: 'number' }
    ],
    outputs: [
      { name: 'isValid', type: 'boolean' },
      { name: 'sentiment', type: 'string' },
      { name: 'confidence', type: 'number' }
    ]
  },
  validate: {
    input: (input) => {
      if (!['positive', 'negative', 'neutral'].includes(input.sentiment)) {
        throw new Error('Invalid sentiment value');
      }
      if (input.confidence < 0 || input.confidence > 1) {
        throw new Error('Confidence must be between 0 and 1');
      }
      return true;
    }
  }
});

// Create pipeline
const pipeline = new Pipeline(
  [preprocessModule, sentimentModule, validationModule],
  {
    stopOnError: true,
    debug: true,
    maxRetries: 2
  }
);

// Use the pipeline
const result = await pipeline.run({
  text: 'This product exceeded my expectations! Highly recommended!'
});

console.log(result.finalOutput);
// {
//   isValid: true,
//   sentiment: 'positive',
//   confidence: 0.98
// }
```

## Error Handling

```typescript
try {
  const result = await sentimentModule.run({
    text: 'Some text to analyze'
  });
} catch (error) {
  if (error instanceof LMError) {
    console.error('Language model error:', error.message);
  } else if (error instanceof ModuleError) {
    console.error('Module error:', error.message);
  }
}
```

## Testing

```typescript
import { DummyLM } from 'dspy.ts';

// Create dummy LM for testing
const dummyLM = new DummyLM(new Map([
  [
    'Analyze the sentiment of the following text...',
    JSON.stringify({
      sentiment: 'positive',
      confidence: 0.9
    })
  ]
]));

// Configure dummy LM
configureLM(dummyLM);

// Test cases
const testCases = [
  {
    input: { text: 'Great product!' },
    expected: { sentiment: 'positive', confidence: 0.9 }
  },
  // Add more test cases...
];

// Run tests
for (const testCase of testCases) {
  const result = await sentimentModule.run(testCase.input);
  console.assert(
    result.sentiment === testCase.expected.sentiment &&
    result.confidence === testCase.expected.confidence,
    'Test failed'
  );
}
```

## Performance Optimization

### 1. Caching

```typescript
const cachedModule = defineModule({
  // ... module definition ...
  cache: {
    enabled: true,
    ttl: 3600,  // 1 hour
    key: (input) => input.text
  }
});
```

### 2. Batching

```typescript
const batchedPipeline = new Pipeline(modules, {
  batch: {
    size: 10,
    timeout: 1000  // ms
  }
});
```

## Best Practices

1. **Input Validation**
   - Validate text length
   - Check for empty or invalid input
   - Handle special characters

2. **Error Handling**
   - Use appropriate retry strategies
   - Provide meaningful error messages
   - Handle edge cases gracefully

3. **Performance**
   - Enable caching for repeated texts
   - Use batching when possible
   - Monitor resource usage

4. **Testing**
   - Test with various text types
   - Verify confidence scores
   - Check error handling
   - Use DummyLM for reliable tests

## Related Resources

- [Module Types Guide](../../guides/module-types.md)
- [Pipeline Guide](../../guides/pipeline-guide.md)
- [LM Backends Guide](../../guides/lm-backends.md)
