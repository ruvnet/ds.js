# Optimizer Example

This example demonstrates how to use DSPy.ts optimizers to improve module performance by automatically generating and selecting few-shot examples. The example uses the BootstrapFewShot optimizer to enhance a sentiment analysis module.

## Features

- BootstrapFewShot optimizer implementation
- Automatic few-shot example generation
- Metric-based example selection
- Save/load optimized modules
- Comparison between base and optimized modules

## How It Works

1. **Base Module**: A simple sentiment analyzer that classifies text as positive, negative, or neutral.

2. **Training Data**: A mix of labeled and unlabeled examples:
   ```typescript
   const trainset = [
     // Labeled examples
     {
       input: { text: "I love this product!" },
       output: { sentiment: "positive", confidence: 0.95 }
     },
     // Unlabeled examples for bootstrapping
     {
       input: { text: "The service was fantastic!" }
     }
   ];
   ```

3. **Metric Function**: Evaluates the quality of generated examples:
   ```typescript
   function exactMatchMetric(input, output, expected): number {
     if (!expected) return 0;
     return output.sentiment === expected.sentiment ? 1 : 0;
   }
   ```

4. **Optimization Process**:
   - Uses labeled examples as initial demonstrations
   - Generates outputs for unlabeled examples
   - Evaluates generated examples using the metric
   - Selects high-quality examples for the optimized prompt
   - Creates a new module with the enhanced prompt

## Setup

1. Set your OpenRouter API key:
   ```bash
   export OPENROUTER_API_KEY=your_api_key_here
   ```

2. (Optional) Set a specific model:
   ```bash
   export OPENROUTER_MODEL=your_preferred_model
   ```
   Default: "anthropic/claude-3-sonnet:beta"

3. Run the example:
   ```bash
   ts-node examples/optimize/index.ts
   ```

## Example Output

```
DSPy.ts Optimizer Example

Optimizing module...
[Optimizer] Starting bootstrap few-shot optimization
[Optimizer] Generated 4 demonstrations

Testing base module:
Text: "The customer service was exceptional"
Result: { sentiment: "positive", confidence: 0.95 }

Testing optimized module:
Text: "The customer service was exceptional"
Result: { sentiment: "positive", confidence: 0.98 }

Optimized module saved to optimized-sentiment.json
```

## Customization

### 1. Optimizer Configuration

```typescript
const optimizer = new BootstrapFewShot(exactMatchMetric, {
  maxLabeledDemos: 2,      // Max labeled examples to use
  maxBootstrappedDemos: 2, // Max examples to generate
  minScore: 0.8,          // Minimum quality score
  debug: true             // Enable debug logging
});
```

### 2. Custom Metric Functions

Create your own metric function to guide example selection:

```typescript
function customMetric(input, output, expected): number {
  // Your evaluation logic here
  // Return a score between 0 and 1
}
```

### 3. Save/Load Optimized Modules

```typescript
// Save to file
optimizer.save("optimized-module.json");

// Load from file
optimizer.load("optimized-module.json");
```

## Advanced Usage

### 1. Pipeline Optimization

Optimize multi-step pipelines:

```typescript
const pipeline = new Pipeline([
  preprocessor,
  classifier,
  postprocessor
]);

const optimizedPipeline = await optimizer.compile(pipeline, trainset);
```

### 2. Custom Modules

Create and optimize your own modules:

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
```

### 3. Metric Composition

Combine multiple metrics:

```typescript
function combinedMetric(input, output, expected): number {
  const accuracyScore = exactMatchMetric(input, output, expected);
  const confidenceScore = output.confidence;
  return (accuracyScore + confidenceScore) / 2;
}
```

## Related Resources

- [DSPy.ts Optimizer Guide](../../docs/guides/optimizers.md)
- [API Reference](../../docs/api/README.md)
- [Module Types Guide](../../docs/guides/module-types.md)
