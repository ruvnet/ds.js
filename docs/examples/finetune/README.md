# Fine-tuning Example

This example demonstrates how to use DSPy.ts to implement fine-tuning with Generative Reward Proximal Policy Optimization (GRPO). The example shows how to create self-improving language models through reinforcement learning.

## Overview

The example implements:
- GRPO-style reinforcement learning
- Self-generated reward signals
- Domain-specific knowledge integration
- Multi-metric quality evaluation
- Progressive model improvement

## Components

### 1. TextGeneratorModule

The base module for text generation that:
- Maintains domain-specific knowledge
- Uses weighted concept selection
- Implements template-based generation
- Tracks performance metrics

```typescript
const model = new TextGeneratorModule({
  name: 'TextGenerator',
  promptTemplate: input => `Generate explanation: ${input.text}`
});

const output = await model.run({ 
  text: 'Explain quantum computing' 
});
```

### 2. RewardModule

Evaluates generation quality using:
- Length optimization
- Vocabulary diversity
- Structural coherence
- Quality assessment

```typescript
const rewardModule = new RewardModule({
  name: 'QualityEvaluator',
  promptTemplate: input => `Evaluate: ${input.generated}`
});

const reward = await rewardModule.run(output);
```

### 3. GRPOOptimizer

Implements reinforcement learning with:
- Policy gradient optimization
- Reward normalization
- Adaptive learning rates
- Progress tracking

```typescript
const optimizer = new GRPOOptimizer({
  learningRate: 0.05,
  epochs: 2
});

const metrics = await optimizer.update(model, outputs, rewards);
```

### 4. TrainingManager

Coordinates the training process:
- Manages data batching
- Handles model updates
- Tracks progress
- Reports metrics

```typescript
const trainer = new TrainingManager({
  module: model,
  optimizer,
  rewardModule,
  onBatchComplete: metrics => console.log('Metrics:', metrics)
});

await trainer.trainOnBatch(trainingData);
```

## Usage

1. Setup environment:
```bash
export OPENROUTER_API_KEY="your-api-key"
export OPENROUTER_MODEL="anthropic/claude-3-sonnet:beta"  # optional
```

2. Run the example:
```bash
ts-node examples/finetune/index.ts
```

3. Use in your code:
```typescript
import { createFineTunedModel } from './examples/finetune';

const model = await createFineTunedModel(trainingData, {
  basePrompt: 'Generate a high-quality explanation.',
  rewardPrompt: 'Evaluate the quality of this explanation.',
  optimizerConfig: {
    learningRate: 0.05,
    epochs: 2
  }
});

const result = await model.run({
  text: 'Explain neural networks'
});
```

## Training Data Format

```typescript
const trainingData = [
  {
    input: { 
      text: 'Explain quantum computing' 
    },
    output: {  // Optional
      generated: 'Quantum computing uses quantum mechanics...',
      quality: 0.95
    }
  }
];
```

## Domain Knowledge

The example includes built-in knowledge for:
- Quantum Computing
- Machine Learning
- Neural Networks

Each domain has:
- Key concepts and terminology
- Response templates
- Concept relationships
- Quality metrics

## Quality Metrics

The reward calculation considers:

1. Length Score (30%)
   - Optimal length targeting
   - Penalizes too short/long responses

2. Vocabulary Score (30%)
   - Measures word diversity
   - Encourages rich vocabulary

3. Structure Score (20%)
   - Checks for coherent structure
   - Rewards proper formatting

4. Quality Score (20%)
   - Self-reported quality
   - Domain relevance

## Training Process

The training loop:
1. Generates responses for input batch
2. Evaluates quality and calculates rewards
3. Updates model weights using GRPO
4. Tracks and reports progress

Example metrics:
```
Batch outputs:
Input: "Explain quantum computing"
Output: "quantum computing leverages quantum mechanics..."
Reward: 0.762
Feedback: Length: 0.73, Vocabulary: 0.91, Structure: 0.80, Quality: 0.54
```

## Customization

### 1. Add New Domains

```typescript
const newDomain = {
  keywords: ['key1', 'key2'],
  templates: ['Template with {concept}'],
  relationships: {
    'key1': ['related1', 'related2']
  }
};
```

### 2. Modify Reward Function

```typescript
class CustomRewardModule extends RewardModule {
  async calculateReward(output: TextOutput): Promise<number> {
    // Custom reward logic
    return reward;
  }
}
```

### 3. Adjust Training Parameters

```typescript
const config = {
  learningRate: 0.01,
  clipEpsilon: 0.2,
  miniBatchSize: 32,
  epochs: 5,
  entropyCoef: 0.01
};
```

## Best Practices

1. Data Quality
   - Use diverse training examples
   - Include both simple and complex queries
   - Provide high-quality reference outputs

2. Training Process
   - Start with small learning rates
   - Monitor reward trends
   - Use multiple training epochs
   - Implement early stopping

3. Evaluation
   - Test with unseen queries
   - Check for overfitting
   - Validate domain coverage
   - Monitor quality metrics

## Related Resources

- [Fine-tuning Guide](../../guides/fine-tuning.md)
- [Module Types Guide](../../guides/module-types.md)
- [Pipeline Guide](../../guides/pipeline-guide.md)