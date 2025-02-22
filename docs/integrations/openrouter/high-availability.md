# OpenRouter High Availability Guide

This guide covers strategies and configurations for achieving high availability when using OpenRouter with DSPy.ts.

## High Availability Configuration

### 1. Basic HA Setup

```typescript
const model = new OpenRouterModel({
  availability: {
    // Minimum availability target
    target: 0.999,  // 99.9% uptime
    
    // Health checks
    healthCheck: {
      enabled: true,
      interval: 30000,  // 30 seconds
      timeout: 5000     // 5 seconds
    },
    
    // Failover configuration
    failover: {
      enabled: true,
      maxAttempts: 3,
      timeout: 10000
    }
  }
});
```

### 2. Load Balancing

```typescript
const model = new OpenRouterModel({
  loadBalancing: {
    // Load balancing strategy
    strategy: 'round-robin',  // or 'least-loaded', 'weighted'
    
    // Node configuration
    nodes: [
      {
        models: ['openai/gpt-3.5-turbo'],
        weight: 3,
        maxConcurrent: 100
      },
      {
        models: ['anthropic/claude-2'],
        weight: 2,
        maxConcurrent: 50
      }
    ],
    
    // Health monitoring
    monitoring: {
      enabled: true,
      interval: 60000
    }
  }
});
```

### 3. Circuit Breaker

```typescript
const model = new OpenRouterModel({
  circuitBreaker: {
    // Basic configuration
    enabled: true,
    failureThreshold: 5,
    resetTimeout: 30000,
    
    // Advanced settings
    monitoring: {
      windowSize: 100,    // requests
      minimumRequests: 10
    },
    
    // Failure conditions
    conditions: {
      timeout: 5000,
      errorRate: 0.1,     // 10%
      latency: 2000       // ms
    },
    
    // Recovery strategy
    recovery: {
      strategy: 'gradual',
      duration: 300000,   // 5 minutes
      stepSize: 0.1       // 10% per step
    }
  }
});
```

## Redundancy Strategies

### 1. Model Redundancy

```typescript
const model = new OpenRouterModel({
  redundancy: {
    // Model groups
    groups: {
      primary: {
        models: ['openai/gpt-3.5-turbo', 'anthropic/claude-instant'],
        minAvailable: 1
      },
      secondary: {
        models: ['google/palm-2'],
        minAvailable: 1
      }
    },
    
    // Failover configuration
    failover: {
      automatic: true,
      maxAttempts: 3,
      timeout: 5000
    }
  }
});
```

### 2. Geographic Distribution

```typescript
const model = new OpenRouterModel({
  distribution: {
    // Regional configuration
    regions: {
      'us-east': {
        primary: true,
        models: ['openai/gpt-3.5-turbo'],
        weight: 3
      },
      'eu-west': {
        primary: false,
        models: ['anthropic/claude-2'],
        weight: 2
      }
    },
    
    // Routing strategy
    routing: {
      strategy: 'latency',  // or 'geo', 'weighted'
      fallback: true
    }
  }
});
```

### 3. Request Replication

```typescript
const model = new OpenRouterModel({
  replication: {
    // Replication strategy
    strategy: 'active-active',  // or 'active-passive'
    
    // Replica configuration
    replicas: {
      min: 2,
      max: 3,
      scaling: {
        enabled: true,
        metric: 'load',
        threshold: 0.8
      }
    },
    
    // Consistency settings
    consistency: {
      level: 'eventual',  // or 'strong'
      timeout: 5000
    }
  }
});
```

## Error Recovery

### 1. Retry Strategies

```typescript
const model = new OpenRouterModel({
  retry: {
    // Basic configuration
    enabled: true,
    maxAttempts: 3,
    
    // Backoff strategy
    backoff: {
      type: 'exponential',  // or 'linear', 'fixed'
      initialDelay: 1000,
      maxDelay: 10000
    },
    
    // Retry conditions
    conditions: {
      networkError: true,
      timeout: true,
      serverError: true
    }
  }
});
```

### 2. Fallback Mechanisms

```typescript
const model = new OpenRouterModel({
  fallback: {
    // Fallback chain
    chain: [
      {
        models: ['openai/gpt-3.5-turbo'],
        timeout: 2000
      },
      {
        models: ['anthropic/claude-instant'],
        timeout: 3000
      }
    ],
    
    // Fallback behavior
    behavior: {
      mode: 'sequential',  // or 'parallel'
      timeout: 10000,
      stopOnSuccess: true
    }
  }
});
```

### 3. State Recovery

```typescript
const model = new OpenRouterModel({
  recovery: {
    // State management
    state: {
      persistence: true,
      storage: 'redis',
      ttl: 3600
    },
    
    // Recovery options
    options: {
      autoRecover: true,
      maxAttempts: 3,
      timeout: 5000
    }
  }
});
```

## Monitoring and Alerting

### 1. Health Monitoring

```typescript
const model = new OpenRouterModel({
  monitoring: {
    // Health checks
    health: {
      enabled: true,
      interval: 30000,
      endpoints: ['status', 'metrics']
    },
    
    // Performance monitoring
    performance: {
      enabled: true,
      metrics: ['latency', 'throughput', 'errors']
    }
  }
});
```

### 2. Alert Configuration

```typescript
const model = new OpenRouterModel({
  alerts: {
    // Alert conditions
    conditions: {
      availability: 0.99,
      errorRate: 0.05,
      latency: 2000
    },
    
    // Notification channels
    notifications: {
      email: 'alerts@example.com',
      slack: 'webhook_url',
      custom: (alert) => {
        // Custom alert handling
      }
    }
  }
});
```

## Best Practices

### 1. High Availability Design

- Implement proper redundancy
- Use circuit breakers
- Configure health checks
- Set up monitoring

### 2. Error Handling

- Configure retry strategies
- Implement fallbacks
- Handle edge cases
- Monitor error rates

### 3. Performance Optimization

- Use load balancing
- Enable caching
- Optimize request routing
- Monitor resource usage

### 4. Implementation Example

```typescript
const model = new OpenRouterModel({
  // High availability configuration
  availability: {
    target: 0.999,
    healthCheck: {
      enabled: true,
      interval: 30000
    }
  },
  
  // Load balancing
  loadBalancing: {
    strategy: 'round-robin',
    nodes: [
      { models: ['openai/gpt-3.5-turbo'], weight: 3 },
      { models: ['anthropic/claude-2'], weight: 2 }
    ]
  },
  
  // Circuit breaker
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5
  },
  
  // Monitoring
  monitoring: {
    health: {
      enabled: true,
      interval: 30000
    },
    alerts: {
      enabled: true
    }
  }
});
```

## Related Resources

- [Basic Setup](basic-setup.md)
- [Advanced Configuration](advanced-configuration.md)
- [Monitoring Guide](monitoring.md)
- [API Reference](../../api/README.md)
