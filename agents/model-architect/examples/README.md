# Model Architect Examples

This directory contains example scripts demonstrating how to use the Model Architect agents.

## Prerequisites

- Deno runtime installed
- OpenRouter API key set in environment: `export OPENROUTER_API_KEY="your-key"`

## Examples

### 1. Basic CNN Design (design-cnn.ts)

Basic example demonstrating CNN architecture design in both autonomous and interactive modes.

```bash
# Using deno task
deno task cnn:auto
deno task cnn:interactive

# Or directly with deno run
deno run --allow-net --allow-env design-cnn.ts auto
deno run --allow-net --allow-env design-cnn.ts interactive
```

### 2. Advanced Model Optimization (optimize-cnn.ts)

Advanced example demonstrating recursive optimization with Claude 3.5 Sonnet for both image and text classification tasks.

#### Image Classification
```bash
# Autonomous mode
deno task optimize:auto:image

# Interactive mode
deno task optimize:interactive:image
```

Features:
- Bayesian optimization of architecture
- Hardware-aware constraints (GPU memory, utilization)
- Layer fusion and quantization
- Performance profiling
- Early stopping

Example constraints:
```typescript
{
  maxParameters: 10_000_000,
  minAccuracy: 0.95,
  maxLatency: 50,  // ms
  maxMemory: 1000,  // MB
  powerBudget: 100,  // watts
  quantization: {
    precision: "fp16"
  }
}
```

#### Text Classification
```bash
# Autonomous mode
deno task optimize:auto:text

# Interactive mode
deno task optimize:interactive:text
```

Features:
- NLP-specific layer types (LSTM, GRU, etc.)
- Sequence length optimization
- Embedding size tuning
- Memory-efficient transformations

Example constraints:
```typescript
{
  maxParameters: 50_000_000,
  minAccuracy: 0.90,
  maxLatency: 200,
  framework: "pytorch",
  allowedLayerTypes: [
    "Embedding",
    "LSTM",
    "GRU",
    "Dense"
  ]
}
```

## Optimization Process

The optimization process follows these steps:

1. Initial Architecture Design
   - Based on task requirements
   - Considers hardware constraints
   - Uses proven architectures as starting points

2. Setting Optimization Goals
   - Performance targets (accuracy, latency)
   - Resource constraints (memory, power)
   - Hardware utilization targets

3. Recursive Optimization
   - Bayesian optimization of hyperparameters
   - Architecture search with early stopping
   - Layer fusion and quantization analysis
   - Cross-validation for robustness

4. Interactive Feedback (in interactive mode)
   - Review and modify architectures
   - Adjust optimization constraints
   - Fine-tune quantization settings
   - Control ONNX export options

## Example Output

The optimization process provides detailed metrics and visualizations:

```json
{
  "metrics": {
    "accuracy": 0.956,
    "latency": 45.2,
    "memory": 850,
    "parameters": 8500000,
    "throughput": 120
  },
  "analysis": {
    "bottlenecks": [
      {
        "layer": "Conv2D_3",
        "metric": "memory",
        "value": 256,
        "recommendation": "Reduce filter count"
      }
    ],
    "suggestions": [
      {
        "type": "architecture",
        "description": "Fuse Conv2D+BatchNorm layers",
        "expectedImpact": {
          "metric": "latency",
          "improvement": 15
        }
      }
    ]
  }
}
```

## Adding New Examples

To add a new example:
1. Create a new TypeScript file in this directory
2. Add corresponding tasks to deno.json if needed
3. Update this README with usage instructions

## Notes

- All examples support both autonomous and interactive modes
- Optimization goals are customizable through constraints
- ONNX export is optional but recommended for deployment
- Hardware-specific optimizations require appropriate constraints
