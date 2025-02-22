# OpenRouter Security Best Practices

This guide covers security best practices and configurations for using OpenRouter with DSPy.ts.

## API Key Management

### 1. Environment Variables

```typescript
// .env
OPENROUTER_API_KEY=your_api_key
OPENROUTER_ORG_ID=your_org_id

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Use in configuration
const model = new OpenRouterModel({
  apiKey: process.env.OPENROUTER_API_KEY,
  orgId: process.env.OPENROUTER_ORG_ID
});
```

### 2. Key Rotation

```typescript
const model = new OpenRouterModel({
  security: {
    // Key rotation
    keyRotation: {
      enabled: true,
      interval: '7d',  // rotate every 7 days
      overlap: '1h'    // 1 hour overlap for smooth transition
    },
    
    // Key management
    keys: {
      primary: process.env.OPENROUTER_API_KEY,
      secondary: process.env.OPENROUTER_API_KEY_SECONDARY,
      storage: 'vault'  // or 'aws-secrets', 'azure-keyvault'
    }
  }
});
```

### 3. Access Control

```typescript
const model = new OpenRouterModel({
  access: {
    // Authentication
    auth: {
      type: 'api-key',  // or 'oauth', 'jwt'
      validation: true,
      expiration: '30d'
    },
    
    // Authorization
    permissions: {
      models: ['openai/gpt-3.5-turbo'],
      operations: ['generate', 'embed'],
      rateLimit: 1000  // requests per hour
    }
  }
});
```

## Rate Limiting

### 1. Basic Rate Limiting

```typescript
const model = new OpenRouterModel({
  rateLimit: {
    // Global limits
    global: {
      requests: 1000,    // requests per
      interval: '1h',    // hour
      concurrent: 10     // concurrent requests
    },
    
    // Per-user limits
    user: {
      requests: 100,     // requests per
      interval: '1h',    // hour
      concurrent: 2      // concurrent requests
    }
  }
});
```

### 2. Advanced Rate Limiting

```typescript
const model = new OpenRouterModel({
  rateLimit: {
    // Tiered limits
    tiers: {
      basic: {
        requests: 1000,
        interval: '1h',
        burst: 20
      },
      premium: {
        requests: 5000,
        interval: '1h',
        burst: 50
      }
    },
    
    // Rate limiting strategy
    strategy: {
      type: 'token-bucket',  // or 'leaky-bucket', 'fixed-window'
      capacity: 100,
      refillRate: 10,
      refillInterval: '1s'
    }
  }
});
```

### 3. Throttling

```typescript
const model = new OpenRouterModel({
  throttling: {
    // Throttling rules
    rules: [
      {
        condition: 'high-load',
        threshold: 0.8,
        reduction: 0.5
      },
      {
        condition: 'error-rate',
        threshold: 0.1,
        reduction: 0.7
      }
    ],
    
    // Recovery
    recovery: {
      gradual: true,
      duration: '5m',
      steps: 5
    }
  }
});
```

## Input Validation

### 1. Content Validation

```typescript
const model = new OpenRouterModel({
  validation: {
    // Content rules
    content: {
      maxLength: 4096,
      allowedTypes: ['text/plain'],
      sanitization: true
    },
    
    // Pattern matching
    patterns: {
      blocklist: [/script/i, /eval\(/i],
      allowlist: [/^[\w\s\.,!?-]+$/]
    },
    
    // Custom validation
    custom: (input) => {
      // Custom validation logic
      return true;
    }
  }
});
```

### 2. Request Validation

```typescript
const model = new OpenRouterModel({
  validation: {
    // Request validation
    request: {
      headers: {
        required: ['x-api-key'],
        allowed: ['content-type', 'user-agent']
      },
      methods: ['POST'],
      contentTypes: ['application/json']
    },
    
    // Origin validation
    origin: {
      allowlist: ['example.com'],
      blocklist: ['malicious.com']
    }
  }
});
```

### 3. Output Validation

```typescript
const model = new OpenRouterModel({
  validation: {
    // Output validation
    output: {
      sanitization: true,
      maxLength: 8192,
      allowedTypes: ['text/plain']
    },
    
    // Content filtering
    filter: {
      enabled: true,
      sensitivity: 'medium',  // or 'high', 'low'
      customRules: [/* custom filtering rules */]
    }
  }
});
```

## Encryption

### 1. Data in Transit

```typescript
const model = new OpenRouterModel({
  encryption: {
    // TLS configuration
    tls: {
      enabled: true,
      minVersion: 'TLSv1.2',
      ciphers: ['ECDHE-RSA-AES256-GCM-SHA384']
    },
    
    // Request encryption
    request: {
      enabled: true,
      algorithm: 'AES-256-GCM'
    }
  }
});
```

### 2. Data at Rest

```typescript
const model = new OpenRouterModel({
  encryption: {
    // Storage encryption
    storage: {
      enabled: true,
      type: 'AES-256',
      keyRotation: true
    },
    
    // Cache encryption
    cache: {
      enabled: true,
      algorithm: 'AES-256-GCM'
    }
  }
});
```

## Audit Logging

### 1. Basic Logging

```typescript
const model = new OpenRouterModel({
  audit: {
    // Log configuration
    logging: {
      enabled: true,
      level: 'info',
      format: 'json'
    },
    
    // Log storage
    storage: {
      type: 'file',  // or 'database', 'cloud'
      retention: '30d'
    }
  }
});
```

### 2. Advanced Logging

```typescript
const model = new OpenRouterModel({
  audit: {
    // Detailed logging
    details: {
      request: true,
      response: true,
      metadata: true
    },
    
    // Log shipping
    shipping: {
      enabled: true,
      destination: 'elasticsearch',
      batch: {
        size: 100,
        interval: '1m'
      }
    }
  }
});
```

## Best Practices

### 1. Security Configuration

```typescript
const model = new OpenRouterModel({
  // API key management
  security: {
    keyRotation: {
      enabled: true,
      interval: '7d'
    }
  },
  
  // Rate limiting
  rateLimit: {
    global: {
      requests: 1000,
      interval: '1h'
    }
  },
  
  // Input validation
  validation: {
    content: {
      maxLength: 4096,
      sanitization: true
    }
  },
  
  // Encryption
  encryption: {
    tls: { enabled: true },
    storage: { enabled: true }
  },
  
  // Audit logging
  audit: {
    logging: { enabled: true },
    storage: { retention: '30d' }
  }
});
```

### 2. Security Checklist

1. **API Key Management**
   - Use environment variables
   - Implement key rotation
   - Secure key storage

2. **Rate Limiting**
   - Set appropriate limits
   - Implement throttling
   - Monitor usage

3. **Input Validation**
   - Validate content
   - Sanitize input
   - Check patterns

4. **Encryption**
   - Enable TLS
   - Encrypt sensitive data
   - Rotate encryption keys

5. **Audit Logging**
   - Enable comprehensive logging
   - Store logs securely
   - Monitor for issues

## Related Resources

- [Basic Setup](basic-setup.md)
- [Advanced Configuration](advanced-configuration.md)
- [Monitoring Guide](monitoring.md)
- [API Reference](../../api/README.md)
