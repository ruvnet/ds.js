# Fine-tuning Guide

This guide explains how to use DSPy.ts's fine-tuning capabilities to improve model performance on specific tasks.

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Basic Usage](#basic-usage)
4. [Advanced Configuration](#advanced-configuration)
5. [Best Practices](#best-practices)

## Overview

Fine-tuning in DSPy.ts uses Generative Reward Proximal Policy Optimization (GRPO) to optimize language models for specific tasks. The process involves:

1. Generating text based on input prompts
2. Evaluating output quality using reward functions
3. Updating the model's weights to improve performance
4. Repeating until desired quality is achieved

## Components

### TextGeneratorModule

The core module for text generation:

```typescript
const generator = new TextGeneratorModule({
  name: 'TextGenerator',
  promptTemplate: input => `Generate: ${input.text}`,
  domainConfig: {
    knowledge: {
      'your-domain': {
        keywords: ['relevant', 'terms'],
        templates: ['Text templates with {placeholders}'],
        relationships: {
          'term': ['related', 'concepts']
        }
      }
    },
    defaultQuality: 0.1,
    minQuality: 0.1,
    maxQuality: 0.95
  }
});
```

### RewardModule

Evaluates output quality:

```typescript
const rewardModule = new RewardModule({
  name: 'QualityEvaluator',
  promptTemplate: input => `Evaluate: ${input.generated}`
});
```

### GRPOOptimizer

Handles the optimization process:

```typescript
const optimizer = new GRPOOptimizer({
  learningRate: 0.001,
  clipEpsilon: 0.2,
  miniBatchSize: 32,
  epochs: 5,
  entropyCoef: 0.01
});
```

## Basic Usage

1. Create training data:

```typescript
const trainingData = [
  {
    input: { text: 'Your input prompt' },
    output: {
      generated: 'Expected output',
      quality: 0.9
    }
  }
];
```

2. Initialize and train the model:

```typescript
const model = await createFineTunedModel(trainingData, {
  basePrompt: 'Your base prompt template',
  rewardPrompt: 'Your reward evaluation prompt',
  optimizerConfig: {
    learningRate: 0.05,
    epochs: 2
  }
});
```

3. Use the fine-tuned model:

```typescript
const result = await model.run({
  text: 'Your input text'
});
console.log(result.generated);
console.log(result.quality);
```

## Advanced Configuration

### Domain Knowledge

Configure domain-specific knowledge:

```typescript
interface DomainConfig {
  knowledge: Record<string, TopicKnowledge>;
  defaultQuality?: number;
  minQuality?: number;
  maxQuality?: number;
}

interface TopicKnowledge {
  keywords: string[];
  templates: string[];
  relationships: Record<string, string[]>;
}
```

Example configuration:

```typescript
const domainConfig: DomainConfig = {
  knowledge: {
    'quantum computing': {
      keywords: ['quantum', 'qubit', 'superposition'],
      templates: [
        '{topic} uses {concept} for computation',
        'In {topic}, {concept} enables {feature}'
      ],
      relationships: {
        'quantum': ['mechanics', 'states'],
        'qubit': ['superposition', 'entanglement']
      }
    }
  },
  defaultQuality: 0.1,
  minQuality: 0.1,
  maxQuality: 0.95
};
```

### Reward Function

The reward function evaluates multiple aspects:

```typescript
const reward = (
  lengthScore * 0.3 +    // Text length
  vocabularyScore * 0.3 + // Vocabulary diversity
  structureScore * 0.2 +  // Structural coherence
  quality * 0.2          // Base quality
);
```

Customize weights and metrics based on your needs.

### Training Process

Control the training process:

```typescript
const trainer = new TrainingManager({
  module: baseModule,
  optimizer,
  rewardModule,
  onBatchComplete: metrics => {
    console.log('Metrics:', {
      batchId: metrics.batchId,
      avgReward: metrics.avgReward,
      policyLoss: metrics.policyLoss
    });
  }
});
```

## Best Practices

1. **Data Quality**
   - Use diverse training examples
   - Include edge cases
   - Validate input/output pairs
   - Balance different topics/domains

2. **Reward Design**
   - Use multiple evaluation metrics
   - Balance different aspects
   - Avoid sparse rewards
   - Consider domain-specific criteria

3. **Training Process**
   - Start with small learning rates
   - Monitor convergence
   - Use early stopping
   - Validate results frequently

4. **Error Handling**
   - Handle unknown topics gracefully
   - Validate inputs
   - Check for numerical stability
   - Monitor training metrics

5. **Performance Optimization**
   - Use appropriate batch sizes
   - Adjust epochs based on dataset size
   - Monitor memory usage
   - Cache intermediate results

## Example Implementation

See the [fine-tuning example](../examples/finetune/README.md) for a complete implementation.

## Related Resources

- [Module Types Guide](./module-types.md)
- [Pipeline Guide](./pipeline-guide.md)
- [Optimizers Guide](./optimizers.md)
