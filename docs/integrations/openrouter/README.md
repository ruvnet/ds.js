# OpenRouter Integration with DSPy.ts

This directory contains comprehensive guides for integrating OpenRouter with DSPy.ts, enabling dynamic routing of language model requests across multiple providers.

## Table of Contents

### 1. [Basic Setup](basic-setup.md)
- Installation and configuration
- Environment setup
- Basic usage examples
- Error handling

### 2. [Advanced Configuration](advanced-configuration.md)
- Routing strategies
- Model selection
- Fallback configuration
- Performance optimization

### 3. [Cost Management](cost-management.md)
- Budget controls
- Usage tracking
- Cost optimization
- Billing integration

### 4. [High Availability](high-availability.md)
- Redundancy setup
- Load balancing
- Circuit breakers
- Error recovery

### 5. [Security Best Practices](security.md)
- API key management
- Rate limiting
- Access control
- Audit logging

### 6. [Testing Guide](testing.md)
- Unit testing
- Integration testing
- Performance testing
- Error simulation

### 7. [Production Deployment](production-deployment.md)
- Deployment checklist
- Monitoring setup
- Scaling strategies
- Maintenance procedures

### 8. [Monitoring & Metrics](monitoring.md)
- Performance monitoring
- Cost tracking
- Error reporting
- Usage analytics

### 9. [Troubleshooting](troubleshooting.md)
- Common issues
- Error codes
- Debugging tips
- Support resources

## Quick Start

1. Install dependencies:
```bash
npm install dspy.ts openrouter-sdk
```

2. Configure environment:
```bash
# .env
OPENROUTER_API_KEY=your_api_key
OPENROUTER_ORG_ID=your_org_id
```

3. Basic setup:
```typescript
import { configureLM } from 'dspy.ts';
import { OpenRouterModel } from 'dspy.ts/lm/openrouter';

const model = new OpenRouterModel({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultModel: 'openai/gpt-3.5-turbo',
  fallbackModels: ['anthropic/claude-2', 'google/palm-2']
});

await model.init();
configureLM(model);
```

4. Use in modules:
```typescript
const module = defineModule({
  name: 'ExampleModule',
  signature: {
    inputs: [{ name: 'text', type: 'string' }],
    outputs: [{ name: 'result', type: 'string' }]
  },
  promptTemplate: ({ text }) => text
});

const result = await module.run({ text: 'Hello, world!' });
```

## Common Use Cases

### 1. Cost-Optimized Routing

```typescript
const model = new OpenRouterModel({
  routingStrategy: 'cost-optimized',
  budgetLimit: 0.01,  // $ per request
  models: {
    cheap: ['openai/gpt-3.5-turbo'],
    expensive: ['openai/gpt-4', 'anthropic/claude-2']
  }
});
```

### 2. High-Performance Routing

```typescript
const model = new OpenRouterModel({
  routingStrategy: 'performance',
  maxLatency: 1000,  // ms
  models: {
    fast: ['openai/gpt-3.5-turbo'],
    powerful: ['openai/gpt-4']
  }
});
```

### 3. High-Availability Setup

```typescript
const model = new OpenRouterModel({
  routingStrategy: 'availability',
  minAvailability: 0.99,
  fallbackChain: [
    'openai/gpt-3.5-turbo',
    'anthropic/claude-2',
    'google/palm-2'
  ]
});
```

## Best Practices

### 1. Error Handling

```typescript
try {
  const result = await module.run(input);
} catch (error) {
  if (error instanceof OpenRouterError) {
    switch (error.code) {
      case 'RATE_LIMIT':
        // Handle rate limiting
        break;
      case 'MODEL_UNAVAILABLE':
        // Try fallback model
        break;
      case 'BUDGET_EXCEEDED':
        // Handle budget constraints
        break;
    }
  }
}
```

### 2. Performance Optimization

```typescript
const model = new OpenRouterModel({
  cache: {
    enabled: true,
    ttl: 3600,
    storage: 'redis'
  },
  batch: {
    enabled: true,
    maxSize: 10,
    timeout: 1000
  }
});
```

### 3. Monitoring

```typescript
const model = new OpenRouterModel({
  metrics: {
    enabled: true,
    callback: (metrics) => {
      console.log('Cost:', metrics.cost);
      console.log('Latency:', metrics.latency);
      console.log('Model:', metrics.model);
    }
  }
});
```

## Integration Examples

### 1. Web Application

```typescript
// React component example
function ChatComponent() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (input: string) => {
    setLoading(true);
    try {
      const result = await chatModule.run({ text: input });
      setResponse(result.response);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (/* component JSX */);
}
```

### 2. API Server

```typescript
// Express route example
app.post('/api/chat', async (req, res) => {
  try {
    const result = await chatModule.run({
      text: req.body.text
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Chat processing failed'
    });
  }
});
```

### 3. Batch Processing

```typescript
// Batch processing example
const batchProcessor = new BatchProcessor({
  maxBatchSize: 10,
  processTimeout: 30000,
  async processBatch(inputs) {
    const results = await Promise.all(
      inputs.map(input => module.run(input))
    );
    return results;
  }
});
```

## Related Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [DSPy.ts API Reference](../../api/README.md)
- [Examples](../../examples/README.md)
