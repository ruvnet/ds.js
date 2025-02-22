# OpenRouter Production Deployment Guide

This guide covers best practices and configurations for deploying OpenRouter with DSPy.ts in production environments.

## Deployment Checklist

### 1. Environment Setup

```typescript
// .env.production
OPENROUTER_API_KEY=your_production_api_key
OPENROUTER_ORG_ID=your_production_org_id
NODE_ENV=production
```

### 2. Security Configuration

```typescript
const model = new OpenRouterModel({
  security: {
    // API key management
    keyRotation: {
      enabled: true,
      interval: '7d'
    },
    
    // Rate limiting
    rateLimit: {
      enabled: true,
      requests: 1000,
      interval: '1h'
    },
    
    // Input validation
    validation: {
      enabled: true,
      sanitization: true
    }
  }
});
```

### 3. Performance Configuration

```typescript
const model = new OpenRouterModel({
  performance: {
    // Caching
    cache: {
      enabled: true,
      storage: 'redis',
      ttl: 3600
    },
    
    // Request optimization
    optimization: {
      batching: true,
      compression: true
    },
    
    // Resource management
    resources: {
      maxMemory: '2GB',
      maxConcurrent: 100
    }
  }
});
```

### 4. Monitoring Setup

```typescript
const model = new OpenRouterModel({
  monitoring: {
    // Metrics
    metrics: {
      enabled: true,
      provider: 'prometheus'
    },
    
    // Logging
    logging: {
      level: 'info',
      format: 'json'
    },
    
    // Alerts
    alerts: {
      enabled: true,
      channels: ['slack', 'email']
    }
  }
});
```

## Deployment Strategies

### 1. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

# Set environment
ENV NODE_ENV=production

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Build application
RUN npm run build

# Start application
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - redis
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### 2. Kubernetes Deployment

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: openrouter-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: openrouter
  template:
    metadata:
      labels:
        app: openrouter
    spec:
      containers:
      - name: openrouter
        image: openrouter:latest
        env:
        - name: NODE_ENV
          value: "production"
        - name: OPENROUTER_API_KEY
          valueFrom:
            secretKeyRef:
              name: openrouter-secrets
              key: api-key
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

### 3. Serverless Deployment

```typescript
// serverless.ts
import { OpenRouterModel } from 'dspy.ts';

export const handler = async (event: any) => {
  const model = new OpenRouterModel({
    // Production configuration
    environment: 'production',
    timeout: 30000,
    memory: '2GB'
  });
  
  try {
    const result = await model.generate(event.prompt);
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

## Scaling Strategies

### 1. Horizontal Scaling

```typescript
const model = new OpenRouterModel({
  scaling: {
    // Auto-scaling
    auto: {
      enabled: true,
      minInstances: 2,
      maxInstances: 10,
      targetCPU: 70
    },
    
    // Load balancing
    loadBalancing: {
      strategy: 'round-robin',
      healthCheck: {
        enabled: true,
        interval: 30
      }
    }
  }
});
```

### 2. Resource Management

```typescript
const model = new OpenRouterModel({
  resources: {
    // Memory management
    memory: {
      limit: '2GB',
      reservation: '1GB',
      swapEnabled: false
    },
    
    // CPU management
    cpu: {
      limit: '1000m',
      reservation: '500m',
      cores: 2
    },
    
    // Network
    network: {
      rateLimit: '100Mbps',
      timeout: 30000
    }
  }
});
```

## High Availability

### 1. Redundancy Configuration

```typescript
const model = new OpenRouterModel({
  availability: {
    // Redundancy
    redundancy: {
      mode: 'active-active',
      minReplicas: 2
    },
    
    // Failover
    failover: {
      enabled: true,
      timeout: 5000,
      retries: 3
    },
    
    // Health checks
    health: {
      enabled: true,
      interval: 30,
      timeout: 5
    }
  }
});
```

### 2. Backup Strategy

```typescript
const model = new OpenRouterModel({
  backup: {
    // State backup
    state: {
      enabled: true,
      interval: '1h',
      retention: '7d'
    },
    
    // Data backup
    data: {
      enabled: true,
      type: 'incremental',
      schedule: '0 0 * * *'
    }
  }
});
```

## Monitoring & Logging

### 1. Production Monitoring

```typescript
const model = new OpenRouterModel({
  monitoring: {
    // APM
    apm: {
      enabled: true,
      provider: 'elastic',
      sampleRate: 0.1
    },
    
    // Metrics
    metrics: {
      enabled: true,
      provider: 'prometheus',
      interval: 60
    },
    
    // Tracing
    tracing: {
      enabled: true,
      provider: 'jaeger',
      sampleRate: 0.1
    }
  }
});
```

### 2. Production Logging

```typescript
const model = new OpenRouterModel({
  logging: {
    // Log configuration
    config: {
      level: 'info',
      format: 'json',
      timestamp: true
    },
    
    // Log shipping
    shipping: {
      enabled: true,
      destination: 'elasticsearch',
      retention: '30d'
    }
  }
});
```

## Security Measures

### 1. Network Security

```typescript
const model = new OpenRouterModel({
  security: {
    // Network security
    network: {
      ssl: {
        enabled: true,
        cert: '/path/to/cert',
        key: '/path/to/key'
      },
      
      // Firewall
      firewall: {
        enabled: true,
        allowlist: ['trusted-ip-1', 'trusted-ip-2']
      }
    }
  }
});
```

### 2. Access Control

```typescript
const model = new OpenRouterModel({
  security: {
    // Authentication
    auth: {
      type: 'jwt',
      secret: process.env.JWT_SECRET,
      expiry: '1h'
    },
    
    // Authorization
    rbac: {
      enabled: true,
      roles: ['admin', 'user'],
      default: 'user'
    }
  }
});
```

## Best Practices

### 1. Production Configuration

```typescript
const model = new OpenRouterModel({
  // Environment
  environment: 'production',
  
  // Security
  security: {
    keyRotation: { enabled: true },
    rateLimit: { enabled: true }
  },
  
  // Performance
  performance: {
    caching: { enabled: true },
    optimization: { enabled: true }
  },
  
  // Monitoring
  monitoring: {
    metrics: { enabled: true },
    logging: { enabled: true }
  }
});
```

### 2. Deployment Checklist

1. **Security**
   - Rotate API keys
   - Enable rate limiting
   - Configure SSL/TLS
   - Set up firewalls

2. **Performance**
   - Enable caching
   - Configure resource limits
   - Optimize request handling
   - Set up load balancing

3. **Monitoring**
   - Configure metrics
   - Set up logging
   - Enable alerts
   - Monitor resources

4. **Availability**
   - Configure redundancy
   - Set up failover
   - Enable health checks
   - Plan backups

## Related Resources

- [Basic Setup](basic-setup.md)
- [Advanced Configuration](advanced-configuration.md)
- [High Availability](high-availability.md)
- [Monitoring Guide](monitoring.md)
