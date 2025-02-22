# OpenRouter Troubleshooting Guide

This guide covers common issues and solutions when using OpenRouter with DSPy.ts.

## Common Issues

### 1. Authentication Issues

```typescript
// Issue: API Key Invalid
try {
  const model = new OpenRouterModel({
    apiKey: process.env.OPENROUTER_API_KEY
  });
  await model.init();
} catch (error) {
  if (error.code === 'AUTHENTICATION_ERROR') {
    // Solutions:
    // 1. Verify API key is correct
    // 2. Check environment variables
    // 3. Ensure key has proper permissions
  }
}
```

### 2. Rate Limiting

```typescript
// Issue: Rate Limit Exceeded
try {
  const result = await model.generate(prompt);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Solutions:
    // 1. Implement exponential backoff
    model.setConfig({
      retry: {
        maxAttempts: 3,
        backoff: 'exponential',
        initialDelay: 1000
      }
    });
    
    // 2. Use request batching
    model.setConfig({
      batch: {
        enabled: true,
        maxSize: 10
      }
    });
    
    // 3. Enable caching
    model.setConfig({
      cache: {
        enabled: true,
        ttl: 3600
      }
    });
  }
}
```

### 3. Model Availability

```typescript
// Issue: Model Unavailable
try {
  const result = await model.generate(prompt);
} catch (error) {
  if (error.code === 'MODEL_UNAVAILABLE') {
    // Solutions:
    // 1. Use fallback models
    model.setConfig({
      fallback: {
        models: ['openai/gpt-3.5-turbo', 'anthropic/claude-2'],
        strategy: 'sequential'
      }
    });
    
    // 2. Implement circuit breaker
    model.setConfig({
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeout: 30000
      }
    });
  }
}
```

## Performance Issues

### 1. High Latency

```typescript
// Issue: High Response Times
model.setConfig({
  // 1. Enable performance optimization
  performance: {
    optimization: {
      caching: true,
      compression: true,
      batching: true
    }
  },
  
  // 2. Configure timeouts
  timeouts: {
    request: 5000,
    total: 30000
  },
  
  // 3. Use faster models
  modelPreferences: {
    preferFaster: true,
    maxLatency: 2000
  }
});
```

### 2. Memory Issues

```typescript
// Issue: High Memory Usage
model.setConfig({
  // 1. Enable memory optimization
  memory: {
    optimization: {
      gcInterval: 1000,
      maxBufferSize: '1GB'
    }
  },
  
  // 2. Configure resource limits
  resources: {
    memory: {
      limit: '2GB',
      threshold: 0.8
    }
  },
  
  // 3. Enable cleanup
  cleanup: {
    automatic: true,
    interval: 5000
  }
});
```

## Error Recovery

### 1. Request Recovery

```typescript
// Issue: Failed Requests
model.setConfig({
  recovery: {
    // 1. Retry configuration
    retry: {
      enabled: true,
      maxAttempts: 3,
      backoff: 'exponential'
    },
    
    // 2. Fallback configuration
    fallback: {
      enabled: true,
      models: ['openai/gpt-3.5-turbo'],
      timeout: 5000
    },
    
    // 3. Circuit breaker
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5
    }
  }
});
```

### 2. State Recovery

```typescript
// Issue: Lost State
model.setConfig({
  state: {
    // 1. State persistence
    persistence: {
      enabled: true,
      storage: 'redis',
      ttl: 3600
    },
    
    // 2. Recovery options
    recovery: {
      enabled: true,
      maxAttempts: 3,
      timeout: 5000
    }
  }
});
```

## Debugging

### 1. Debug Mode

```typescript
// Enable debug mode
model.setConfig({
  debug: {
    // 1. Debug logging
    logging: {
      enabled: true,
      level: 'debug',
      format: 'json'
    },
    
    // 2. Request tracing
    tracing: {
      enabled: true,
      detailed: true
    },
    
    // 3. Performance profiling
    profiling: {
      enabled: true,
      sampling: 0.1
    }
  }
});
```

### 2. Diagnostic Tools

```typescript
// Run diagnostics
const diagnostics = await model.runDiagnostics({
  // 1. Connection check
  connection: {
    enabled: true,
    timeout: 5000
  },
  
  // 2. Model check
  models: {
    enabled: true,
    testPrompt: 'test'
  },
  
  // 3. Resource check
  resources: {
    enabled: true,
    thresholds: {
      memory: 0.8,
      cpu: 0.8
    }
  }
});
```

## Common Error Codes

### Authentication Errors
- `AUTHENTICATION_ERROR`: Invalid API key
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `TOKEN_EXPIRED`: API key expired

### Rate Limiting Errors
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `QUOTA_EXCEEDED`: Monthly quota exceeded
- `CONCURRENT_LIMIT`: Too many concurrent requests

### Model Errors
- `MODEL_UNAVAILABLE`: Model not available
- `INVALID_MODEL`: Model not found
- `MODEL_OVERLOADED`: Model capacity exceeded

### Request Errors
- `INVALID_REQUEST`: Malformed request
- `TIMEOUT`: Request timeout
- `VALIDATION_ERROR`: Input validation failed

## Best Practices

### 1. Error Prevention

- Validate inputs before sending
- Use appropriate timeouts
- Implement rate limiting
- Enable monitoring

### 2. Error Handling

- Use try-catch blocks
- Implement retries
- Configure fallbacks
- Log errors properly

### 3. Monitoring

- Enable metrics collection
- Configure alerts
- Monitor resource usage
- Track error rates

### 4. Implementation Example

```typescript
const model = new OpenRouterModel({
  // Error handling
  errorHandling: {
    retry: {
      enabled: true,
      maxAttempts: 3
    },
    fallback: {
      enabled: true,
      models: ['openai/gpt-3.5-turbo']
    }
  },
  
  // Debugging
  debug: {
    logging: { enabled: true },
    tracing: { enabled: true }
  },
  
  // Monitoring
  monitoring: {
    metrics: { enabled: true },
    alerts: { enabled: true }
  }
});
```

## Getting Help

1. **Documentation**
   - Check [API Reference](../../api/README.md)
   - Review [Examples](../../examples/README.md)
   - Read [Guides](../README.md)

2. **Support Channels**
   - GitHub Issues
   - Community Forums
   - Support Email

3. **Additional Resources**
   - [Basic Setup](basic-setup.md)
   - [Advanced Configuration](advanced-configuration.md)
   - [Monitoring Guide](monitoring.md)
