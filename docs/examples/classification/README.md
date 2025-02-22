# Text Classification Example

This example demonstrates how to use DSPy.ts to build a text classification system that can categorize text into predefined categories with confidence scores.

## Overview

The classification system:
1. Preprocesses input text
2. Classifies into categories
3. Provides confidence scores
4. Validates results

## Implementation

### Basic Implementation

```typescript
import { defineModule, configureLM, ONNXModel } from 'dspy.ts';

// Configure model
const model = new ONNXModel({
  modelPath: 'classifier.onnx',
  executionProvider: 'wasm'
});
await model.init();
configureLM(model);

// Define classification module
const classifierModule = defineModule<
  { text: string },
  { category: string; probabilities: Record<string, number> }
>({
  name: 'TextClassifier',
  signature: {
    inputs: [{ name: 'text', type: 'string' }],
    outputs: [
      { name: 'category', type: 'string' },
      { name: 'probabilities', type: 'object' }
    ]
  },
  promptTemplate: ({ text }) =>
    `Classify the following text into categories (news/sports/technology/entertainment):\n"${text}"`
});

// Use the module
const result = await classifierModule.run({
  text: 'Apple announces new iPhone with revolutionary AI features'
});

console.log(result);
// {
//   category: 'technology',
//   probabilities: {
//     technology: 0.85,
//     news: 0.12,
//     entertainment: 0.02,
//     sports: 0.01
//   }
// }
```

### Advanced Implementation

For more robust classification, we can create a pipeline with:
1. Text preprocessing
2. Multi-model classification
3. Ensemble voting
4. Confidence thresholding

```typescript
import { Pipeline } from 'dspy.ts';

// Text preprocessing module
const preprocessModule = defineModule<
  { text: string },
  { cleanText: string; features: Record<string, number> }
>({
  name: 'TextPreprocessor',
  signature: {
    inputs: [{ name: 'text', type: 'string' }],
    outputs: [
      { name: 'cleanText', type: 'string' },
      { name: 'features', type: 'object' }
    ]
  },
  promptTemplate: ({ text }) =>
    `Preprocess this text and extract features:\n"${text}"`
});

// Multiple classifier modules
const classifier1 = defineModule<
  { cleanText: string },
  { predictions: Record<string, number> }
>({
  name: 'Classifier1',
  signature: {
    inputs: [{ name: 'cleanText', type: 'string' }],
    outputs: [{ name: 'predictions', type: 'object' }]
  },
  promptTemplate: ({ cleanText }) =>
    `Classify this text using model 1:\n"${cleanText}"`
});

const classifier2 = defineModule<
  { cleanText: string },
  { predictions: Record<string, number> }
>({
  name: 'Classifier2',
  signature: {
    inputs: [{ name: 'cleanText', type: 'string' }],
    outputs: [{ name: 'predictions', type: 'object' }]
  },
  promptTemplate: ({ cleanText }) =>
    `Classify this text using model 2:\n"${cleanText}"`
});

// Ensemble voting module
const ensembleModule = defineModule<
  { predictions: Array<Record<string, number>> },
  { category: string; confidence: number }
>({
  name: 'EnsembleVoter',
  signature: {
    inputs: [{ name: 'predictions', type: 'object' }],
    outputs: [
      { name: 'category', type: 'string' },
      { name: 'confidence', type: 'number' }
    ]
  },
  promptTemplate: ({ predictions }) =>
    `Combine predictions using weighted voting:\n${JSON.stringify(predictions)}`
});

// Confidence thresholding module
const thresholdModule = defineModule<
  { category: string; confidence: number },
  { category: string; confidence: number; isReliable: boolean }
>({
  name: 'ConfidenceThresholder',
  signature: {
    inputs: [
      { name: 'category', type: 'string' },
      { name: 'confidence', type: 'number' }
    ],
    outputs: [
      { name: 'category', type: 'string' },
      { name: 'confidence', type: 'number' },
      { name: 'isReliable', type: 'boolean' }
    ]
  },
  validate: {
    input: (input) => {
      if (input.confidence < 0 || input.confidence > 1) {
        throw new Error('Confidence must be between 0 and 1');
      }
      return true;
    }
  }
});

// Create pipeline
const pipeline = new Pipeline(
  [
    preprocessModule,
    [classifier1, classifier2],  // parallel execution
    ensembleModule,
    thresholdModule
  ],
  {
    stopOnError: true,
    debug: true,
    maxRetries: 2
  }
);

// Use the pipeline
const result = await pipeline.run({
  text: 'SpaceX successfully launches new satellite into orbit'
});

console.log(result.finalOutput);
// {
//   category: 'technology',
//   confidence: 0.92,
//   isReliable: true
// }
```

## Error Handling

```typescript
try {
  const result = await pipeline.run({
    text: 'Some text to classify'
  });

  if (!result.finalOutput.isReliable) {
    console.warn('Low confidence classification:', result.finalOutput);
  }
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
    'Classify the following text...',
    JSON.stringify({
      category: 'technology',
      probabilities: {
        technology: 0.85,
        news: 0.12,
        entertainment: 0.02,
        sports: 0.01
      }
    })
  ]
]));

// Configure dummy LM
configureLM(dummyLM);

// Test cases
const testCases = [
  {
    input: {
      text: 'Apple announces new iPhone'
    },
    expected: {
      category: 'technology',
      confidence: 0.85
    }
  },
  // Add more test cases...
];

// Run tests
for (const testCase of testCases) {
  const result = await classifierModule.run(testCase.input);
  console.assert(
    result.category === testCase.expected.category &&
    Math.abs(result.confidence - testCase.expected.confidence) < 0.01,
    'Test failed'
  );
}
```

## Performance Optimization

### 1. Feature Caching

```typescript
const cachedPreprocessModule = defineModule({
  // ... module definition ...
  cache: {
    enabled: true,
    ttl: 3600,  // 1 hour
    key: (input) => input.text
  }
});
```

### 2. Parallel Classification

```typescript
const parallelPipeline = new Pipeline(
  [
    preprocessModule,
    [classifier1, classifier2, classifier3],  // parallel execution
    ensembleModule
  ],
  {
    maxConcurrent: 3
  }
);
```

## Best Practices

1. **Text Preprocessing**
   - Clean and normalize text
   - Extract relevant features
   - Handle special characters

2. **Model Selection**
   - Use appropriate models
   - Consider model size
   - Balance accuracy and speed

3. **Ensemble Methods**
   - Combine multiple models
   - Use weighted voting
   - Handle disagreements

4. **Performance**
   - Cache preprocessed features
   - Run classifiers in parallel
   - Monitor resource usage

## Related Resources

- [Module Types Guide](../../guides/module-types.md)
- [Pipeline Guide](../../guides/pipeline-guide.md)
- [LM Backends Guide](../../guides/lm-backends.md)
