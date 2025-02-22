# Fine-tuning Example with GRPO

This example demonstrates how to use DSPy.ts to implement fine-tuning with Generative Reward Proximal Policy Optimization (GRPO), a reinforcement learning approach that uses self-generated rewards to optimize language model outputs.

## Features

- GRPO-style reinforcement learning implementation
- Self-generated reward signals
- Policy gradient optimization
- Automatic reward scaling
- Training progress tracking
- Model checkpoint management
- A/B testing of model versions

## Components

1. **BaseModule**
   - Initial language model module
   - Configurable prompt templates
   - Output validation
   - Performance metrics tracking

2. **RewardModule**
   - Generates reward signals
   - Evaluates output quality
   - Provides feedback for optimization
   - Customizable reward functions

3. **PolicyOptimizer**
   - Implements GRPO algorithm
   - Manages policy updates
   - Handles learning rate scheduling
   - Tracks optimization progress

4. **TrainingManager**
   - Coordinates training process
   - Manages data batching
   - Handles checkpointing
   - Provides progress reporting

## How It Works

### 1. Base Model Setup

```typescript
const baseModule = new PredictModule<TextInput, TextOutput>({
  name: 'TextGenerator',
  signature: {
    input: { text: 'string' },
    output: { generated: 'string', quality: 'number' }
  },
  promptTemplate: input => `Generate high-quality text based on: ${input.text}`
});
```

### 2. Reward Function Definition

```typescript
const rewardModule = new PredictModule<TextOutput, RewardOutput>({
  name: 'QualityEvaluator',
  signature: {
    input: { text: 'string', generated: 'string' },
    output: { reward: 'number', feedback: 'string' }
  },
  promptTemplate: input => `
    Evaluate the quality of this generated text:
    Original: ${input.text}
    Generated: ${input.generated}
    
    Provide:
    1. Quality score (0-1)
    2. Specific feedback
  `
});
```

### 3. Policy Optimization

```typescript
const policyOptimizer = new GRPOOptimizer({
  learningRate: 0.001,
  clipEpsilon: 0.2,
  miniBatchSize: 32,
  epochs: 5,
  entropyCoef: 0.01
});

// Training loop
for (const batch of trainingData) {
  // Generate outputs
  const outputs = await baseModule.predict(batch);
  
  // Get rewards
  const rewards = await rewardModule.predict(outputs);
  
  // Update policy
  await policyOptimizer.update(baseModule, outputs, rewards);
}
```

## Usage

1. Set up environment variables:
   ```bash
   export OPENROUTER_API_KEY="your-api-key"
   export OPENROUTER_MODEL="anthropic/claude-3-sonnet:beta"  # optional, this is the default
   ```

2. Run the example:
   ```bash
   ts-node examples/finetune/index.ts
   ```

3. Use in your code:
   ```typescript
   import { createFineTunedModel } from './examples/finetune';

   // Initialize with training data
   const model = await createFineTunedModel(trainingData, {
     basePrompt: "Your base prompt template",
     rewardPrompt: "Your reward evaluation prompt",
     optimizerConfig: {
       learningRate: 0.001,
       epochs: 5
     }
   });

   // Generate text with fine-tuned model
   const result = await model.generate("Your input text");
   console.log(result);
   ```

## Training Data Format

```typescript
interface TrainingExample {
  input: {
    text: string;
  };
  output?: {
    generated: string;
    quality: number;
  };
}

const trainingData: TrainingExample[] = [
  {
    input: { text: "Explain quantum computing" },
    output: {
      generated: "Quantum computing uses quantum mechanics...",
      quality: 0.95
    }
  },
  // More examples...
];
```

## Advanced Features

### 1. Custom Reward Functions

```typescript
function customReward(output: TextOutput, target?: TextOutput): number {
  // Your reward calculation logic
  return score; // 0 to 1
}

const optimizer = new GRPOOptimizer({
  rewardFunction: customReward,
  // other config...
});
```

### 2. Progress Tracking

```typescript
const trainer = new TrainingManager({
  onBatchComplete: (metrics) => {
    console.log(`
      Batch ${metrics.batchId}:
      - Average Reward: ${metrics.avgReward}
      - Policy Loss: ${metrics.policyLoss}
      - Value Loss: ${metrics.valueLoss}
    `);
  }
});
```

### 3. Model Checkpointing

```typescript
// Save checkpoint
await trainer.saveCheckpoint('checkpoint-1000.json');

// Resume training
await trainer.loadCheckpoint('checkpoint-1000.json');
```

### 4. A/B Testing

```typescript
const abTester = new ModelComparator({
  modelA: baseModule,
  modelB: fineTunedModule,
  evaluationData: testSet,
  metrics: ['quality', 'diversity', 'relevance']
});

const results = await abTester.compare();
console.log('Improvement:', results.improvement);
```

## Performance Monitoring

The example includes built-in monitoring:

1. Training Metrics:
   - Average reward per batch
   - Policy gradient loss
   - Value function loss
   - Entropy bonus

2. Model Performance:
   - Generation quality
   - Response time
   - Token usage
   - Error rates

3. Optimization Progress:
   - Learning rate schedule
   - Policy updates
   - Reward distribution
   - Convergence indicators

## Customization

You can customize various aspects:

1. Reward Function:
   - Modify reward calculation
   - Add custom metrics
   - Implement domain-specific evaluation

2. Policy Configuration:
   - Adjust learning rates
   - Modify batch sizes
   - Configure gradient clipping
   - Tune entropy coefficient

3. Training Process:
   - Change epochs
   - Modify checkpoint frequency
   - Adjust evaluation intervals
   - Implement early stopping

## Related Resources

- [DSPy.ts Optimizer Guide](../../docs/guides/optimizers.md)
- [API Reference](../../docs/api/README.md)
- [Module Types Guide](../../docs/guides/module-types.md)