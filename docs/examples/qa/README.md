# Question Answering Example

This example demonstrates how to build a question answering system using DSPy.ts. The system retrieves relevant context and generates accurate answers based on the provided information.

## Overview

The QA system consists of three main components:
1. Context retrieval
2. Answer generation
3. Answer validation

## Implementation

### Basic Implementation

```typescript
import { defineModule, configureLM, ONNXModel } from 'dspy.ts';

// Configure model
const model = new ONNXModel({
  modelPath: 'qa-model.onnx',
  executionProvider: 'wasm'
});
await model.init();
configureLM(model);

// Define context retrieval module
const contextModule = defineModule<
  { question: string },
  { context: string }
>({
  name: 'ContextRetriever',
  signature: {
    inputs: [{ name: 'question', type: 'string' }],
    outputs: [{ name: 'context', type: 'string' }]
  },
  promptTemplate: ({ question }) =>
    `Find relevant information for: "${question}"`
});

// Define answer generation module
const answerModule = defineModule<
  { question: string; context: string },
  { answer: string }
>({
  name: 'AnswerGenerator',
  signature: {
    inputs: [
      { name: 'question', type: 'string' },
      { name: 'context', type: 'string' }
    ],
    outputs: [{ name: 'answer', type: 'string' }]
  },
  promptTemplate: ({ question, context }) =>
    `Question: "${question}"\nContext: "${context}"\nAnswer:`
});

// Create pipeline
const pipeline = new Pipeline([
  contextModule,
  answerModule
]);

// Use the pipeline
const result = await pipeline.run({
  question: 'What is the capital of France?'
});

console.log(result.finalOutput.answer);
// "The capital of France is Paris."
```

### Advanced Implementation

For more robust question answering, we can add:
1. Question validation
2. Context ranking
3. Answer verification
4. Confidence scoring

```typescript
import { Pipeline } from 'dspy.ts';

// Question validation module
const questionValidatorModule = defineModule<
  { question: string },
  { isValid: boolean; question: string; type: string }
>({
  name: 'QuestionValidator',
  signature: {
    inputs: [{ name: 'question', type: 'string' }],
    outputs: [
      { name: 'isValid', type: 'boolean' },
      { name: 'question', type: 'string' },
      { name: 'type', type: 'string' }
    ]
  },
  promptTemplate: ({ question }) =>
    `Validate this question and determine its type:\n"${question}"`
});

// Context retrieval module
const contextModule = defineModule<
  { question: string; type: string },
  { contexts: string[] }
>({
  name: 'ContextRetriever',
  signature: {
    inputs: [
      { name: 'question', type: 'string' },
      { name: 'type', type: 'string' }
    ],
    outputs: [{ name: 'contexts', type: 'object' }]
  },
  promptTemplate: ({ question, type }) =>
    `Find relevant information for ${type} question: "${question}"`
});

// Context ranking module
const rankingModule = defineModule<
  { question: string; contexts: string[] },
  { rankedContexts: Array<{ text: string; relevance: number }> }
>({
  name: 'ContextRanker',
  signature: {
    inputs: [
      { name: 'question', type: 'string' },
      { name: 'contexts', type: 'object' }
    ],
    outputs: [{ name: 'rankedContexts', type: 'object' }]
  },
  promptTemplate: ({ question, contexts }) =>
    `Rank these contexts by relevance to the question:\nQuestion: "${question}"\nContexts:\n${contexts.join('\n')}`
});

// Answer generation module
const answerModule = defineModule<
  { question: string; rankedContexts: Array<{ text: string; relevance: number }> },
  { answer: string; confidence: number }
>({
  name: 'AnswerGenerator',
  signature: {
    inputs: [
      { name: 'question', type: 'string' },
      { name: 'rankedContexts', type: 'object' }
    ],
    outputs: [
      { name: 'answer', type: 'string' },
      { name: 'confidence', type: 'number' }
    ]
  },
  promptTemplate: ({ question, rankedContexts }) =>
    `Generate an answer with confidence score:\nQuestion: "${question}"\nContext: "${rankedContexts[0].text}"`
});

// Answer verification module
const verificationModule = defineModule<
  { question: string; answer: string; confidence: number },
  { isValid: boolean; answer: string; confidence: number }
>({
  name: 'AnswerVerifier',
  signature: {
    inputs: [
      { name: 'question', type: 'string' },
      { name: 'answer', type: 'string' },
      { name: 'confidence', type: 'number' }
    ],
    outputs: [
      { name: 'isValid', type: 'boolean' },
      { name: 'answer', type: 'string' },
      { name: 'confidence', type: 'number' }
    ]
  },
  promptTemplate: ({ question, answer }) =>
    `Verify this answer:\nQuestion: "${question}"\nAnswer: "${answer}"`
});

// Create pipeline
const pipeline = new Pipeline(
  [
    questionValidatorModule,
    contextModule,
    rankingModule,
    answerModule,
    verificationModule
  ],
  {
    stopOnError: true,
    debug: true,
    maxRetries: 2
  }
);

// Use the pipeline
const result = await pipeline.run({
  question: 'What are the main causes of climate change?'
});

console.log(result.finalOutput);
// {
//   isValid: true,
//   answer: 'The main causes of climate change are...',
//   confidence: 0.92
// }
```

## Error Handling

```typescript
try {
  const result = await pipeline.run({
    question: 'What is the meaning of life?'
  });

  if (result.finalOutput.confidence < 0.8) {
    console.warn('Low confidence answer:', result.finalOutput);
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
    'Find relevant information for...',
    JSON.stringify({
      contexts: ['Paris is the capital of France.']
    })
  ],
  [
    'Question: "What is the capital of France?"...',
    JSON.stringify({
      answer: 'Paris is the capital of France.',
      confidence: 0.95
    })
  ]
]));

// Configure dummy LM
configureLM(dummyLM);

// Test cases
const testCases = [
  {
    input: { question: 'What is the capital of France?' },
    expected: {
      answer: 'Paris is the capital of France.',
      confidence: 0.95
    }
  },
  // Add more test cases...
];

// Run tests
for (const testCase of testCases) {
  const result = await pipeline.run(testCase.input);
  console.assert(
    result.finalOutput.answer === testCase.expected.answer &&
    result.finalOutput.confidence === testCase.expected.confidence,
    'Test failed'
  );
}
```

## Performance Optimization

### 1. Context Caching

```typescript
const cachedContextModule = defineModule({
  // ... module definition ...
  cache: {
    enabled: true,
    ttl: 3600,  // 1 hour
    key: (input) => input.question
  }
});
```

### 2. Parallel Context Processing

```typescript
const parallelPipeline = new Pipeline(
  [
    questionValidatorModule,
    [contextModule1, contextModule2, contextModule3],  // parallel execution
    rankingModule
  ],
  {
    maxConcurrent: 3
  }
);
```

## Best Practices

1. **Question Processing**
   - Validate question format
   - Identify question type
   - Handle edge cases

2. **Context Management**
   - Rank contexts by relevance
   - Filter irrelevant information
   - Handle missing context

3. **Answer Generation**
   - Ensure answer completeness
   - Provide confidence scores
   - Validate answer format

4. **Performance**
   - Cache frequent questions
   - Process contexts in parallel
   - Monitor resource usage

## Related Resources

- [Module Types Guide](../../guides/module-types.md)
- [Pipeline Guide](../../guides/pipeline-guide.md)
- [LM Backends Guide](../../guides/lm-backends.md)
