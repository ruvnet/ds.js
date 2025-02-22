# OpenRouter Cost Management

This guide covers strategies and configurations for managing costs when using OpenRouter with DSPy.ts.

## Cost Control Strategies

### 1. Budget Configuration

```typescript
const model = new OpenRouterModel({
  budget: {
    // Global budget limits
    hourly: 10.00,    // $ per hour
    daily: 100.00,    // $ per day
    monthly: 2000.00, // $ per month
    
    // Per-request limits
    request: {
      max: 0.05,      // $ per request
      average: 0.02   // $ target average
    },
    
    // Alert thresholds
    alerts: {
      threshold: 0.8,  // 80% of budget
      callback: (alert) => {
        console.log(`Budget alert: ${alert.message}`);
      }
    }
  }
});
```

### 2. Model Tier Management

```typescript
const model = new OpenRouterModel({
  tiers: {
    economy: {
      models: ['openai/gpt-3.5-turbo'],
      maxCost: 0.002,  // $ per 1K tokens
      quota: 0.5       // 50% of requests
    },
    standard: {
      models: ['anthropic/claude-instant'],
      maxCost: 0.005,
      quota: 0.3       // 30% of requests
    },
    premium: {
      models: ['openai/gpt-4'],
      maxCost: 0.03,
      quota: 0.2       // 20% of requests
    }
  },
  tierStrategy: 'strict'  // or 'flexible'
});
```

### 3. Token Management

```typescript
const model = new OpenRouterModel({
  tokens: {
    // Token limits
    maxTokens: {
      default: 1000,
      premium: 2000
    },
    
    // Token optimization
    optimization: {
      truncation: true,
      compression: true,
      splitting: true
    },
    
    // Token budgeting
    budget: {
      hourly: 100000,  // tokens per hour
      daily: 1000000   // tokens per day
    }
  }
});
```

## Cost Monitoring

### 1. Usage Tracking

```typescript
const model = new OpenRouterModel({
  tracking: {
    // Usage metrics
    metrics: {
      costs: true,
      tokens: true,
      requests: true
    },
    
    // Aggregation periods
    periods: ['hour', 'day', 'month'],
    
    // Storage options
    storage: {
      type: 'database',
      connection: process.env.DB_URL
    }
  }
});
```

### 2. Cost Analytics

```typescript
const model = new OpenRouterModel({
  analytics: {
    // Cost breakdown
    breakdown: {
      byModel: true,
      byEndpoint: true,
      byUser: true
    },
    
    // Trend analysis
    trends: {
      enabled: true,
      window: '30d',
      metrics: ['cost', 'usage', 'efficiency']
    },
    
    // Export options
    export: {
      format: 'csv',
      schedule: '0 0 * * *'  // daily at midnight
    }
  }
});
```

### 3. Real-time Monitoring

```typescript
const model = new OpenRouterModel({
  monitoring: {
    realtime: {
      enabled: true,
      interval: 60,  // seconds
      metrics: ['cost', 'requests', 'errors']
    },
    alerts: {
      costs: {
        threshold: 100,  // $ per hour
        action: 'notify'  // or 'throttle', 'stop'
      },
      usage: {
        threshold: 0.8,  // 80% of quota
        action: 'throttle'
      }
    }
  }
});
```

## Cost Optimization

### 1. Caching Strategy

```typescript
const model = new OpenRouterModel({
  caching: {
    // Enable caching
    enabled: true,
    
    // Cache configuration
    config: {
      storage: 'redis',
      ttl: 3600,  // 1 hour
      maxSize: '1GB'
    },
    
    // Cache strategies
    strategies: {
      exact: {
        enabled: true,
        ttl: 3600
      },
      semantic: {
        enabled: true,
        similarity: 0.95,
        ttl: 7200
      }
    }
  }
});
```

### 2. Request Optimization

```typescript
const model = new OpenRouterModel({
  optimization: {
    // Prompt optimization
    prompt: {
      trimming: true,
      compression: true,
      deduplication: true
    },
    
    // Batch processing
    batch: {
      enabled: true,
      maxSize: 10,
      maxDelay: 100  // ms
    },
    
    // Response optimization
    response: {
      streaming: true,
      compression: true
    }
  }
});
```

### 3. Model Selection

```typescript
const model = new OpenRouterModel({
  selection: {
    // Cost-based selection
    strategy: 'cost-optimized',
    
    // Model preferences
    preferences: {
      maxCost: 0.01,  // $ per request
      minQuality: 0.8  // quality threshold
    },
    
    // Fallback options
    fallback: {
      enabled: true,
      maxCost: 0.02,
      timeout: 5000
    }
  }
});
```

## Best Practices

### 1. Budget Management

- Set appropriate budget limits
- Monitor usage regularly
- Configure alerts
- Implement automatic actions

### 2. Cost Optimization

- Use caching when possible
- Optimize prompts and responses
- Batch similar requests
- Choose appropriate models

### 3. Monitoring and Analytics

- Track costs in real-time
- Analyze usage patterns
- Export reports regularly
- Review cost efficiency

### 4. Implementation Example

```typescript
const model = new OpenRouterModel({
  // Budget configuration
  budget: {
    hourly: 10.00,
    daily: 100.00,
    alerts: {
      threshold: 0.8
    }
  },
  
  // Cost optimization
  optimization: {
    caching: {
      enabled: true,
      ttl: 3600
    },
    batching: {
      enabled: true,
      maxSize: 10
    }
  },
  
  // Monitoring
  monitoring: {
    realtime: {
      enabled: true,
      interval: 60
    },
    alerts: {
      enabled: true
    }
  },
  
  // Model selection
  selection: {
    strategy: 'cost-optimized',
    preferences: {
      maxCost: 0.01
    }
  }
});
```

## Related Resources

- [Basic Setup](basic-setup.md)
- [Advanced Configuration](advanced-configuration.md)
- [Monitoring Guide](monitoring.md)
- [API Reference](../../api/README.md)
