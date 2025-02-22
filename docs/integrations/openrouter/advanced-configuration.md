# OpenRouter Advanced Configuration

This guide covers advanced configuration options and strategies for using OpenRouter with DSPy.ts.

## Routing Strategies

### 1. Cost-Optimized Routing

```typescript
const model = new OpenRouterModel({
  routingStrategy: 'cost-optimized',
  budgetLimit: 0.01,  // $ per request
  models: {
    cheap: {
      models: ['openai/gpt-3.5-turbo'],
      maxCost: 0.002  // $ per 1K tokens
    },
    standard: {
      models: ['anthropic/claude-instant'],
      maxCost: 0.005
    },
    premium: {
      models: ['openai/gpt-4', 'anthropic/claude-2'],
      maxCost: 0.03
    }
  },
  costOptimization: {
    preferCheaper: true,
    fallbackOnBudget: true,
    trackSpending: true
  }
});
```

### 2. Performance-Optimized Routing

```typescript
const model = new OpenRouterModel({
  routingStrategy: 'performance',
  performance: {
    maxLatency: 1000,  // ms
    targetThroughput: 100,  // requests/minute
    loadBalancing: 'round-robin'  // or 'least-loaded'
  },
  models: {
    fast: {
      models: ['openai/gpt-3.5-turbo'],
      maxLatency: 500
    },
    balanced: {
      models: ['anthropic/claude-instant'],
      maxLatency: 1000
    },
    powerful: {
      models: ['openai/gpt-4'],
      maxLatency: 2000
    }
  }
});
```

### 3. High-Availability Routing

```typescript
const model = new OpenRouterModel({
  routingStrategy: 'availability',
  availability: {
    minAvailability: 0.99,
    healthCheck: {
      enabled: true,
      interval: 60000,  // ms
      timeout: 5000
    },
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      resetTimeout: 30000
    }
  },
  fallbackChain: [
    'openai/gpt-3.5-turbo',
    'anthropic/claude-2',
    'google/palm-2'
  ]
});
```

## Advanced Features

### 1. Custom Routing Logic

```typescript
const model = new OpenRouterModel({
  routingStrategy: 'custom',
  routingFunction: async (request, context) => {
    // Access request details
    const { prompt, maxTokens, temperature } = request;
    
    // Access context
    const { costs, latencies, availability } = context;
    
    // Implement custom routing logic
    if (prompt.length > 1000) {
      return 'anthropic/claude-2';
    }
    
    if (context.costs['openai/gpt-3.5-turbo'] < 0.002) {
      return 'openai/gpt-3.5-turbo';
    }
    
    return 'google/palm-2';
  }
});
```

### 2. Advanced Caching

```typescript
const model = new OpenRouterModel({
  cache: {
    enabled: true,
    storage: 'redis',
    redis: {
      host: 'localhost',
      port: 6379,
      password: process.env.REDIS_PASSWORD
    },
    strategy: {
      type: 'semantic',  // or 'exact'
      similarity: 0.95,
      embeddings: {
        model: 'openai/text-embedding-ada-002',
        dimensions: 1536
      }
    },
    ttl: {
      default: 3600,
      rules: [
        {
          pattern: /weather|news/i,
          ttl: 300  // 5 minutes for time-sensitive content
        },
        {
          pattern: /definition|concept/i,
          ttl: 86400  // 24 hours for static content
        }
      ]
    }
  }
});
```

### 3. Request Batching

```typescript
const model = new OpenRouterModel({
  batch: {
    enabled: true,
    maxSize: 10,
    maxDelay: 100,  // ms
    strategy: 'adaptive',  // or 'fixed'
    adaptive: {
      minSize: 2,
      targetLatency: 500,
      scaleInterval: 1000
    },
    errorHandling: {
      retryPartial: true,
      maxRetries: 3
    }
  }
});
```

### 4. Advanced Monitoring

```typescript
const model = new OpenRouterModel({
  monitoring: {
    metrics: {
      enabled: true,
      prometheus: {
        enabled: true,
        port: 9090
      },
      custom: (metrics) => {
        // Send metrics to custom monitoring system
      }
    },
    logging: {
      level: 'debug',
      format: 'json',
      destination: {
        type: 'file',
        path: 'logs/openrouter.log'
      }
    },
    alerts: {
      costThreshold: 100,  // $ per hour
      errorRate: 0.05,     // 5% error rate
      latencyThreshold: 2000,  // ms
      callback: (alert) => {
        // Handle alert
      }
    }
  }
});
```

## Advanced Error Handling

### 1. Retry Strategies

```typescript
const model = new OpenRouterModel({
  errorHandling: {
    retry: {
      strategies: {
        rateLimit: {
          maxRetries: 5,
          backoff: 'exponential',
          initialDelay: 1000
        },
        timeout: {
          maxRetries: 3,
          backoff: 'linear',
          initialDelay: 500
        },
        serverError: {
          maxRetries: 2,
          backoff: 'fixed',
          delay: 2000
        }
      }
    }
  }
});
```

### 2. Circuit Breaker

```typescript
const model = new OpenRouterModel({
  circuitBreaker: {
    enabled: true,
    thresholds: {
      errorRate: 0.1,     // 10% error rate
      latency: 2000,      // ms
      timeout: 30000      // ms
    },
    windows: {
      error: 100,         // requests
      latency: 60000      // ms
    },
    recovery: {
      strategy: 'gradual',
      duration: 300000    // 5 minutes
    }
  }
});
```

### 3. Fallback Chain

```typescript
const model = new OpenRouterModel({
  fallback: {
    chain: [
      {
        models: ['openai/gpt-3.5-turbo'],
        timeout: 2000
      },
      {
        models: ['anthropic/claude-instant'],
        timeout: 3000
      },
      {
        models: ['google/palm-2'],
        timeout: 4000
      }
    ],
    strategy: 'waterfall',  // or 'parallel'
    timeout: 10000,
    errorHandling: 'continue'  // or 'fail-fast'
  }
});
```

## Performance Tuning

### 1. Connection Pooling

```typescript
const model = new OpenRouterModel({
  connections: {
    pool: {
      min: 5,
      max: 20,
      idle: 10000,
      acquire: 30000
    },
    keepAlive: true,
    timeout: 5000
  }
});
```

### 2. Request Optimization

```typescript
const model = new OpenRouterModel({
  optimization: {
    compression: true,
    tokenization: {
      batch: true,
      cache: true
    },
    streaming: {
      enabled: true,
      chunkSize: 1000
    }
  }
});
```

### 3. Resource Management

```typescript
const model = new OpenRouterModel({
  resources: {
    memory: {
      maxBufferSize: '1GB',
      gcThreshold: 0.8
    },
    cpu: {
      maxThreads: 4,
      priority: 'high'
    },
    queue: {
      maxSize: 1000,
      strategy: 'fifo'
    }
  }
});
```

## Best Practices

1. **Implement Comprehensive Monitoring**
   - Track costs, latency, and errors
   - Set up alerts for thresholds
   - Monitor resource usage

2. **Use Appropriate Caching**
   - Cache frequently used prompts
   - Implement semantic caching
   - Set appropriate TTLs

3. **Handle Errors Gracefully**
   - Implement retry strategies
   - Use circuit breakers
   - Configure fallbacks

4. **Optimize Performance**
   - Use connection pooling
   - Enable request batching
   - Configure resource limits

## Related Resources

- [Basic Setup](basic-setup.md)
- [Cost Management](cost-management.md)
- [High Availability](high-availability.md)
- [Security Best Practices](security.md)
