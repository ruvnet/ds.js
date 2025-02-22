# OpenRouter Monitoring Guide

This guide covers monitoring and metrics configuration for OpenRouter with DSPy.ts.

## Monitoring Configuration

### 1. Basic Monitoring

```typescript
const model = new OpenRouterModel({
  monitoring: {
    // Basic metrics
    metrics: {
      enabled: true,
      interval: 60,  // seconds
      types: ['requests', 'latency', 'errors']
    },
    
    // Health checks
    health: {
      enabled: true,
      interval: 30,  // seconds
      endpoints: ['status', 'metrics']
    }
  }
});
```

### 2. Advanced Metrics

```typescript
const model = new OpenRouterModel({
  metrics: {
    // Detailed metrics
    detailed: {
      requests: {
        total: true,
        success: true,
        failed: true,
        latency: true
      },
      resources: {
        memory: true,
        cpu: true,
        connections: true
      },
      costs: {
        total: true,
        perModel: true,
        perRequest: true
      }
    },
    
    // Metric storage
    storage: {
      type: 'prometheus',  // or 'influxdb', 'custom'
      retention: '30d',
      aggregation: '1m'
    }
  }
});
```

### 3. Performance Monitoring

```typescript
const model = new OpenRouterModel({
  performance: {
    // Performance metrics
    metrics: {
      latency: {
        p50: true,
        p90: true,
        p99: true
      },
      throughput: {
        rps: true,
        concurrent: true
      },
      resources: {
        memory: true,
        cpu: true
      }
    },
    
    // Thresholds
    thresholds: {
      latency: 2000,    // ms
      errorRate: 0.05,  // 5%
      memory: 0.8       // 80%
    }
  }
});
```

## Alerting

### 1. Alert Configuration

```typescript
const model = new OpenRouterModel({
  alerts: {
    // Alert conditions
    conditions: {
      errors: {
        threshold: 0.05,  // 5% error rate
        window: '5m'      // 5 minute window
      },
      latency: {
        threshold: 2000,  // ms
        window: '1m'
      },
      availability: {
        threshold: 0.99,  // 99% uptime
        window: '1h'
      }
    },
    
    // Notification channels
    notifications: {
      email: ['alerts@example.com'],
      slack: 'webhook_url',
      pagerduty: 'integration_key'
    }
  }
});
```

### 2. Alert Routing

```typescript
const model = new OpenRouterModel({
  alerting: {
    // Routing rules
    routing: {
      critical: {
        conditions: ['high-error-rate', 'service-down'],
        channels: ['pagerduty', 'slack']
      },
      warning: {
        conditions: ['high-latency', 'cost-threshold'],
        channels: ['email', 'slack']
      }
    },
    
    // Notification templates
    templates: {
      email: {
        subject: '[{severity}] {alert_name}',
        body: 'Alert: {description}\nMetrics: {metrics}'
      },
      slack: {
        template: 'alert-template.json'
      }
    }
  }
});
```

## Logging

### 1. Log Configuration

```typescript
const model = new OpenRouterModel({
  logging: {
    // Log levels
    levels: {
      default: 'info',
      performance: 'debug',
      security: 'warn'
    },
    
    // Log format
    format: {
      type: 'json',
      timestamp: true,
      metadata: true
    },
    
    // Log storage
    storage: {
      type: 'elasticsearch',
      retention: '30d',
      index: 'openrouter-logs'
    }
  }
});
```

### 2. Log Shipping

```typescript
const model = new OpenRouterModel({
  logging: {
    // Log shipping
    shipping: {
      enabled: true,
      destination: {
        type: 'elasticsearch',
        host: 'localhost:9200',
        index: 'openrouter-logs'
      },
      batch: {
        size: 100,
        interval: '10s'
      }
    },
    
    // Log processing
    processing: {
      enabled: true,
      filters: ['PII', 'sensitive-data'],
      transforms: ['normalize', 'enrich']
    }
  }
});
```

## Dashboards

### 1. Metrics Dashboard

```typescript
const model = new OpenRouterModel({
  dashboards: {
    // Metrics dashboard
    metrics: {
      enabled: true,
      provider: 'grafana',
      url: 'http://grafana:3000',
      refresh: '1m',
      panels: [
        {
          title: 'Request Rate',
          type: 'graph',
          metric: 'request_rate'
        },
        {
          title: 'Error Rate',
          type: 'graph',
          metric: 'error_rate'
        },
        {
          title: 'Latency',
          type: 'heatmap',
          metric: 'request_latency'
        }
      ]
    }
  }
});
```

### 2. System Dashboard

```typescript
const model = new OpenRouterModel({
  dashboards: {
    // System dashboard
    system: {
      enabled: true,
      provider: 'grafana',
      panels: [
        {
          title: 'Memory Usage',
          type: 'gauge',
          metric: 'memory_usage'
        },
        {
          title: 'CPU Usage',
          type: 'gauge',
          metric: 'cpu_usage'
        },
        {
          title: 'Network I/O',
          type: 'graph',
          metric: 'network_io'
        }
      ]
    }
  }
});
```

## Best Practices

### 1. Monitoring Strategy

- Set up comprehensive metrics
- Configure appropriate alerts
- Enable detailed logging
- Create informative dashboards

### 2. Implementation Example

```typescript
const model = new OpenRouterModel({
  // Basic monitoring
  monitoring: {
    metrics: {
      enabled: true,
      interval: 60
    },
    health: {
      enabled: true,
      interval: 30
    }
  },
  
  // Alerting
  alerts: {
    conditions: {
      errors: { threshold: 0.05 },
      latency: { threshold: 2000 }
    },
    notifications: {
      slack: 'webhook_url'
    }
  },
  
  // Logging
  logging: {
    levels: { default: 'info' },
    format: { type: 'json' },
    storage: { retention: '30d' }
  },
  
  // Dashboards
  dashboards: {
    metrics: { enabled: true },
    system: { enabled: true }
  }
});
```

## Related Resources

- [Basic Setup](basic-setup.md)
- [Advanced Configuration](advanced-configuration.md)
- [High Availability](high-availability.md)
- [API Reference](../../api/README.md)
