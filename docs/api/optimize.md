# Optimizer API Reference

## Classes

### Optimizer<TInput, TOutput>

Base class for all DSPy.ts optimizers.

#### Type Parameters
- `TInput` - Type of input data
- `TOutput` - Type of output data

#### Constructor
```typescript
constructor(
  metric: MetricFunction<TInput, TOutput>,
  config: OptimizerConfig = {}
)
```

#### Methods
- `abstract compile(program: Module<TInput, TOutput>, trainset: TrainingExample<TInput, TOutput>[]): Promise<Module<TInput, TOutput>>`
  - Compiles a program with optimization
  - Returns a promise that resolves to the optimized module

- `save(path: string, saveFieldMeta?: boolean): void`
  - Saves the optimized program to a file
  - `saveFieldMeta`: Whether to save field metadata (default: false)

- `load(path: string): void`
  - Loads an optimized program from a file

### BootstrapFewShot<TInput, TOutput>

Optimizer that generates demonstrations using a teacher model.

#### Type Parameters
- `TInput extends Record<string, any>` - Type of input data
- `TOutput extends Record<string, any>` - Type of output data

#### Constructor
```typescript
constructor(
  metric: MetricFunction<TInput, TOutput>,
  config: BootstrapConfig = {}
)
```

#### Methods
Inherits all methods from `Optimizer` class.

## Interfaces

### OptimizerConfig
Base configuration for optimizers.

```typescript
interface OptimizerConfig {
  maxIterations?: number;  // Maximum optimization iterations
  numThreads?: number;     // Number of parallel threads
  debug?: boolean;         // Enable debug logging
}
```

### BootstrapConfig
Configuration for BootstrapFewShot optimizer.

```typescript
interface BootstrapConfig extends OptimizerConfig {
  maxLabeledDemos?: number;      // Maximum labeled examples to use
  maxBootstrappedDemos?: number; // Maximum examples to generate
  minScore?: number;             // Minimum quality score (0-1)
}
```

### TrainingExample<TInput, TOutput>
Structure for training examples.

```typescript
interface TrainingExample<TInput, TOutput> {
  input: TInput;
  output?: TOutput;  // Optional for unlabeled examples
}
```

## Types

### MetricFunction<TInput, TOutput>
Function type for evaluating example quality.

```typescript
type MetricFunction<TInput, TOutput> = (
  input: TInput,
  output: TOutput,
  expected?: TOutput
) => number;
```

## Example Usage

```typescript
import { BootstrapFewShot } from 'dspy.ts/optimize';

// Define metric
function exactMatchMetric(input, output, expected) {
  if (!expected) return 0;
  return output.answer === expected.answer ? 1 : 0;
}

// Create optimizer
const optimizer = new BootstrapFewShot(exactMatchMetric, {
  maxLabeledDemos: 4,
  maxBootstrappedDemos: 4,
  minScore: 0.7,
  debug: true
});

// Training data
const trainset = [
  {
    input: { text: "Example input" },
    output: { answer: "Example output" }
  }
];

// Optimize program
const optimizedProgram = await optimizer.compile(program, trainset);

// Save optimized program
optimizer.save("optimized-program.json", true);

// Load optimized program
optimizer.load("optimized-program.json");
```

## Error Handling

The optimizer classes may throw the following errors:

- `Error`: When no optimized program exists during save
- `Error`: When loading from an invalid file
- `Error`: When compilation fails
- `Error`: When metric evaluation fails

## Best Practices

1. **Metric Functions**
   - Return values between 0 and 1
   - Handle undefined expected outputs
   - Keep evaluation logic simple

2. **Training Data**
   - Mix labeled and unlabeled examples
   - Provide diverse examples
   - Start with small datasets

3. **Configuration**
   - Adjust thresholds based on task
   - Enable debug for troubleshooting
   - Use appropriate thread count

4. **Error Handling**
   - Wrap optimizer calls in try/catch
   - Validate training data
   - Check optimization results

## Related Resources

- [Optimizers Guide](../guides/optimizers.md)
- [Module Types Guide](../guides/module-types.md)
- [Pipeline Guide](../guides/pipeline-guide.md)
