# OpenRouter Basic Setup

This guide covers the basic setup and configuration of OpenRouter with DSPy.ts.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- DSPy.ts project initialized
- OpenRouter account and API key

## Installation

### 1. Install Required Packages

```bash
npm install dspy.ts openrouter-sdk
```

### 2. Set Up Environment Variables

Create a `.env` file in your project root:

```bash
# .env
OPENROUTER_API_KEY=your_api_key
OPENROUTER_ORG_ID=your_org_id
```

### 3. Load Environment Variables

```typescript
import dotenv from 'dotenv';
dotenv.config();
```

## Basic Configuration

### 1. Create OpenRouter Model

```typescript
import { OpenRouterModel } from 'dspy.ts/lm/openrouter';

const model = new OpenRouterModel({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultModel: 'openai/gpt-3.5-turbo',
  fallbackModels: ['anthropic/claude-2', 'google/palm-2']
});
```

### 2. Initialize and Configure

```typescript
import { configureLM } from 'dspy.ts';

await model.init();
configureLM(model);
```

### 3. Basic Usage

```typescript
const module = defineModule<
  { text: string },
  { response: string }
>({
  name: 'BasicModule',
  signature: {
    inputs: [{ name: 'text', type: 'string' }],
    outputs: [{ name: 'response', type: 'string' }]
  },
  promptTemplate: ({ text }) => text
});

const result = await module.run({
  text: 'Hello, world!'
});
```

## Configuration Options

### 1. Model Selection

```typescript
const model = new OpenRouterModel({
  // Default model for all requests
  defaultModel: 'openai/gpt-3.5-turbo',
  
  // Fallback models in order of preference
  fallbackModels: [
    'anthropic/claude-2',
    'google/palm-2'
  ],
  
  // Model-specific settings
  modelPreferences: {
    'openai/gpt-3.5-turbo': {
      maxTokens: 1000,
      temperature: 0.7
    },
    'anthropic/claude-2': {
      maxTokens: 2000,
      temperature: 0.5
    }
  }
});
```

### 2. Request Configuration

```typescript
const model = new OpenRouterModel({
  // Request timeout
  timeout: 30000,  // 30 seconds
  
  // Retry configuration
  retryConfig: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000
  },
  
  // Rate limiting
  rateLimit: {
    maxRequests: 100,
    perSeconds: 60,
    retryAfter: 1000
  }
});
```

### 3. Basic Caching

```typescript
const model = new OpenRouterModel({
  cache: {
    enabled: true,
    ttl: 3600,  // 1 hour
    maxSize: 1000,  // entries
    storage: 'memory'  // or 'redis'
  }
});
```

## Error Handling

### 1. Basic Error Handling

```typescript
try {
  const result = await module.run(input);
} catch (error) {
  if (error instanceof OpenRouterError) {
    console.error('OpenRouter error:', error.message);
  }
}
```

### 2. Specific Error Types

```typescript
try {
  const result = await module.run(input);
} catch (error) {
  if (error instanceof OpenRouterError) {
    switch (error.code) {
      case 'AUTHENTICATION_ERROR':
        console.error('Invalid API key');
        break;
      case 'RATE_LIMIT_ERROR':
        console.error('Rate limit exceeded');
        break;
      case 'MODEL_ERROR':
        console.error('Model not available');
        break;
      default:
        console.error('Unknown error:', error);
    }
  }
}
```

## Basic Testing

### 1. Using DummyLM

```typescript
import { DummyLM } from 'dspy.ts';

// Create dummy LM for testing
const dummyLM = new DummyLM(new Map([
  ['test prompt', 'test response']
]));

// Configure for testing
configureLM(dummyLM);
```

### 2. Basic Tests

```typescript
describe('OpenRouter Integration', () => {
  let model: OpenRouterModel;

  beforeEach(() => {
    model = new OpenRouterModel({
      apiKey: 'test-key',
      defaultModel: 'openai/gpt-3.5-turbo'
    });
  });

  it('should handle basic requests', async () => {
    const result = await model.generate('Hello');
    expect(result).toBeDefined();
  });

  it('should handle errors', async () => {
    model = new OpenRouterModel({
      apiKey: 'invalid-key'
    });
    await expect(model.generate('test'))
      .rejects.toThrow(OpenRouterError);
  });
});
```

## Basic Monitoring

```typescript
const model = new OpenRouterModel({
  metrics: {
    enabled: true,
    callback: (metrics) => {
      console.log('Request:', {
        prompt: metrics.prompt,
        model: metrics.model,
        tokens: metrics.tokens,
        cost: metrics.cost,
        latency: metrics.latency
      });
    }
  }
});
```

## Next Steps

After completing the basic setup:

1. Review [Advanced Configuration](advanced-configuration.md) for more options
2. Implement [Cost Management](cost-management.md) strategies
3. Set up [High Availability](high-availability.md)
4. Follow [Security Best Practices](security.md)
5. Configure [Monitoring & Metrics](monitoring.md)

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API key is correct
   - Check environment variables
   - Ensure proper initialization

2. **Model Availability**
   - Check model status
   - Verify model name
   - Configure fallbacks

3. **Rate Limiting**
   - Monitor usage
   - Implement retries
   - Use caching

### Getting Help

- Check [OpenRouter Documentation](https://openrouter.ai/docs)
- Review [Troubleshooting Guide](troubleshooting.md)
- Join OpenRouter community
- File issues on GitHub

## Related Resources

- [Advanced Configuration](advanced-configuration.md)
- [Cost Management](cost-management.md)
- [Security Best Practices](security.md)
- [API Reference](../../api/README.md)
