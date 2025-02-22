# Phase 8: Deployment & Publishing

## Overview
This phase prepares DS.js for deployment to npm, ensuring the package is properly built, tested, and configured for both Node.js and browser environments.

## Implementation Steps

### 1. Package Configuration (package.json)

```json
{
  "name": "ds.js",
  "version": "0.1.0",
  "description": "DS.js - Declarative Self-Learning JavaScript: A framework for compositional LM pipelines",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "clean": "rimraf dist",
    "build": "npm run clean && npm run build:cjs && npm run build:esm && npm run build:types",
    "build:cjs": "tsc -p tsconfig.json",
    "build:esm": "tsc -p tsconfig.esm.json",
    "build:types": "tsc -p tsconfig.types.json",
    "test": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "prepublishOnly": "npm run test && npm run build",
    "docs": "typedoc --out docs/api src/index.ts"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/ds.js.git"
  },
  "keywords": [
    "ds.js",
    "declarative",
    "language-model",
    "ONNX",
    "JS-PyTorch",
    "self-learning",
    "pipeline"
  ],
  "author": "Your Name",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/yourusername/ds.js/issues"
  },
  "homepage": "https://github.com/yourusername/ds.js#readme",
  "dependencies": {
    "onnxruntime-web": "^1.15.0",
    "js-pytorch": "^0.7.2"
  },
  "devDependencies": {
    "@types/jest": "^29.0.0",
    "@types/node": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "prettier": "^2.0.0",
    "rimraf": "^5.0.0",
    "ts-jest": "^29.0.0",
    "typedoc": "^0.24.0",
    "typescript": "^4.9.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### 2. TypeScript Configurations

#### a. Base Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "*": ["node_modules/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

#### b. ESM Configuration (tsconfig.esm.json)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "esnext",
    "outDir": "./dist/esm",
    "declaration": false
  }
}
```

#### c. Types Configuration (tsconfig.types.json)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist/types"
  }
}
```

### 3. Build Process Configuration

#### a. Rollup Configuration (rollup.config.js)
```javascript
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'DS',
      sourcemap: true
    }
  ],
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs()
  ],
  external: ['onnxruntime-web', 'js-pytorch']
};
```

### 4. Browser Integration

#### a. Browser Entry Point (src/browser.ts)
```typescript
import { configureLM, defineModule, ONNXModel, TorchModel } from './index';

// Expose global DS object
declare global {
  interface Window {
    DS: {
      configureLM: typeof configureLM;
      defineModule: typeof defineModule;
      ONNXModel: typeof ONNXModel;
      TorchModel: typeof TorchModel;
    };
  }
}

// Set up global DS object
window.DS = {
  configureLM,
  defineModule,
  ONNXModel,
  TorchModel
};
```

#### b. Browser Usage Example (examples/browser.html)
```html
<!DOCTYPE html>
<html>
<head>
  <title>DS.js Browser Example</title>
  <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/js-pytorch/dist/torch.min.js"></script>
  <script src="../dist/index.umd.js"></script>
</head>
<body>
  <div id="output"></div>
  <script>
    async function runExample() {
      // Configure ONNX model
      const model = new DS.ONNXModel({
        modelPath: 'model.onnx',
        executionProvider: 'wasm'
      });
      await model.init();
      DS.configureLM(model);

      // Define module
      const module = DS.defineModule({
        name: 'Example',
        signature: {
          inputs: [{ name: 'text', type: 'string' }],
          outputs: [{ name: 'result', type: 'string' }]
        },
        promptTemplate: ({ text }) => text
      });

      // Run module
      const result = await module.run({ text: 'Hello, DS.js!' });
      document.getElementById('output').textContent = result.result;
    }

    runExample().catch(console.error);
  </script>
</body>
</html>
```

### 5. Publishing Checklist

```markdown
## Pre-publish Checklist

1. Code Quality
   - [ ] All lint checks pass
   - [ ] Code is properly formatted
   - [ ] No TypeScript errors

2. Testing
   - [ ] All unit tests pass
   - [ ] Integration tests pass
   - [ ] Browser tests pass
   - [ ] Test coverage meets threshold (90%+)

3. Documentation
   - [ ] README is up to date
   - [ ] API documentation is complete
   - [ ] Examples are tested and working
   - [ ] CHANGELOG is updated

4. Build
   - [ ] Clean build succeeds
   - [ ] CJS build works
   - [ ] ESM build works
   - [ ] UMD build works
   - [ ] Type declarations are generated
   - [ ] Bundle size is reasonable

5. Package
   - [ ] package.json is complete
   - [ ] Dependencies are correct
   - [ ] Peer dependencies are specified
   - [ ] Files array is correct
   - [ ] npm ignore is configured

6. Security
   - [ ] Dependencies are up to date
   - [ ] No security vulnerabilities
   - [ ] Sensitive data is not included

7. Legal
   - [ ] License is included
   - [ ] Third-party licenses are documented
   - [ ] Copyright notices are present

8. Version
   - [ ] Version number is updated
   - [ ] Git tag is created
   - [ ] Release notes are prepared
```

### 6. Continuous Integration

#### a. GitHub Actions Workflow (.github/workflows/ci.yml)
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        
    - name: Install dependencies
      run: npm ci
      
    - name: Lint
      run: npm run lint
      
    - name: Test
      run: npm test
      
    - name: Build
      run: npm run build

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16.x'
        registry-url: 'https://registry.npmjs.org'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Publish
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Implementation Order

1. Set up build configuration:
   - Configure TypeScript builds
   - Set up Rollup bundling
   - Create npm scripts

2. Prepare browser integration:
   - Create browser entry point
   - Test UMD bundle
   - Verify CDN compatibility

3. Configure CI/CD:
   - Set up GitHub Actions
   - Configure automated testing
   - Set up automated publishing

4. Prepare for publishing:
   - Update package.json
   - Create publishing checklist
   - Test publication process

## Commit Guidelines

After implementing each component:

1. Build Configuration:
```bash
git add package.json tsconfig*.json rollup.config.js
git commit -m "Configure build process and TypeScript settings"
```

2. Browser Integration:
```bash
git add src/browser.ts examples/browser.html
git commit -m "Add browser integration and UMD bundle support"
```

3. CI/CD Setup:
```bash
git add .github/workflows/
git commit -m "Set up GitHub Actions for CI/CD"
```

## Success Criteria

- [ ] Package builds successfully for all targets
- [ ] Browser integration works with CDN
- [ ] CI/CD pipeline is functional
- [ ] Publishing process is automated
- [ ] All tests pass in CI environment
- [ ] Documentation is complete
- [ ] Package can be installed and used

## Next Steps

After successful deployment:
1. Monitor package usage and gather feedback
2. Plan future improvements and features
3. Maintain documentation and examples
4. Address any reported issues

## Troubleshooting

### Common Issues

1. **Build Problems**
   - Verify TypeScript configurations
   - Check module resolution
   - Validate external dependencies

2. **Browser Integration**
   - Test WASM loading
   - Verify UMD bundle
   - Check CDN compatibility

3. **Publishing Issues**
   - Verify npm credentials
   - Check package contents
   - Validate version numbers

### Version Compatibility

- Node.js: >=14.0.0
- TypeScript: ^4.9.0
- Rollup: ^3.0.0
- Jest: ^29.0.0
