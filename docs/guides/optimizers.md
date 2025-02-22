# DSPy.ts Optimizers Guide

DSPy.ts optimizers are algorithms that can tune the parameters of your DSPy.ts programs (prompts and/or LM weights) to maximize specified metrics like accuracy. This guide explains how to use optimizers effectively in your applications.

## Overview

A typical DSPy.ts optimizer takes three components:

1. **Your DSPy Program**: A single module or complex multi-module pipeline
2. **Your Metric**: A function that evaluates outputs and assigns scores
3. **Training Data**: A small set of examples (can be partially labeled)

## Available Optimizers

### BootstrapFewShot

The BootstrapFewShot optimizer uses a teacher model (which defaults to your program) to generate complete demonstrations for every stage of your program.

```typescript
import { BootstrapFewShot } from 'dspy.ts/optimize';

// Define your metric
function exactMatchMetric(input, output, expected) {
  if (!expected) return 0;
  return output.answer === expected.answer ? 1 : 0;
}

// Configure the optimizer
const optimizer = new BootstrapFewShot(exactMatchMetric, {
  maxLabeledDemos: 4,      // Max labeled examples to use
  maxBootstrappedDemos: 4, // Max examples to generate
  minScore: 0.7           // Minimum quality score
});

// Optimize your program
const optimizedProgram = await optimizer.compile(program, trainset);
```

### Coming Soon

- **BootstrapFewShotWithRandomSearch**: Applies random search over generated demonstrations
- **COPRO**: Generates and refines instructions with coordinate ascent
- **MIPROv2**: Data-aware instruction and demonstration generation

## Training Data

Training data can be a mix of labeled and unlabeled examples:

```typescript
const trainset = [
  // Labeled examples
  {
    input: { question: "What is 2+2?" },
    output: { answer: "4" }
  },
  // Unlabeled examples
  {
    input: { question: "What is the capital of France?" }
  }
];
```

## Metric Functions

Metrics evaluate the quality of generated examples:

```typescript
function customMetric(
  input: YourInputType,
  output: YourOutputType,
  expected?: YourOutputType
): number {
  // Your evaluation logic here
  // Return a score between 0 and 1
  return score;
}
```

### Example Metrics

1. **Exact Match**:
```typescript
function exactMatchMetric(input, output, expected) {
  if (!expected) return 0;
  return output.answer === expected.answer ? 1 : 0;
}
```

2. **Confidence-Weighted**:
```typescript
function confidenceMetric(input, output, expected) {
  if (!expected) return 0;
  const correct = output.answer === expected.answer;
  return correct ? output.confidence : 0;
}
```

## Save & Load

Optimized programs can be saved and loaded:

```typescript
// Save to file
optimizer.save("optimized-program.json");

// Load from file
optimizer.load("optimized-program.json");
```

## Advanced Usage

### 1. Pipeline Optimization

```typescript
const pipeline = new Pipeline([
  preprocessor,
  classifier,
  postprocessor
]);

const optimizedPipeline = await optimizer.compile(pipeline, trainset);
```

### 2. Custom Modules

```typescript
class CustomModule extends PredictModule<TInput, TOutput> {
  constructor() {
    super({
      name: 'CustomModule',
      signature: { /* your signature */ },
      promptTemplate: input => `your template`
    });
  }
}

const optimizedModule = await optimizer.compile(new CustomModule(), trainset);
```

### 3. Metric Composition

```typescript
function combinedMetric(input, output, expected) {
  const accuracyScore = exactMatchMetric(input, output, expected);
  const confidenceScore = output.confidence;
  return (accuracyScore + confidenceScore) / 2;
}
```

## Best Practices

1. **Training Data**:
   - Start with a small set (5-10 examples)
   - Include diverse examples
   - Mix labeled and unlabeled data

2. **Metrics**:
   - Keep metrics simple and focused
   - Normalize scores between 0 and 1
   - Consider multiple aspects of quality

3. **Optimization**:
   - Start with BootstrapFewShot
   - Experiment with different configurations
   - Monitor optimization progress

4. **Validation**:
   - Test optimized programs on new inputs
   - Compare with baseline performance
   - Check for overfitting

## Common Issues

1. **Poor Example Generation**:
   - Increase minScore threshold
   - Adjust metric function
   - Add more diverse training data

2. **Slow Optimization**:
   - Reduce maxBootstrappedDemos
   - Use simpler metric functions
   - Enable parallel processing

3. **Overfitting**:
   - Reduce number of demonstrations
   - Use more diverse training data
   - Implement validation checks

## Examples

See the [optimizer example](../examples/optimize/README.md) for a complete implementation demonstrating:
- Sentiment analysis optimization
- Custom metric functions
- Save/load functionality
- Performance comparison

## Related Resources

- [Module Types Guide](module-types.md)
- [Pipeline Guide](pipeline-guide.md)
- [API Reference](../api/README.md)
