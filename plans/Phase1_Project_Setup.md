# Phase 1: Project Setup & Dependency Management

## Overview
This phase establishes the foundational project structure and dependencies for DS.js. We'll set up the development environment, install necessary packages, and create basic configuration files.

## Steps

### 1. Initialize npm Project
```bash
npm init -y
```

### 2. Create Essential Configuration Files

#### package.json
```json
{
  "name": "ds.js",
  "version": "0.1.0",
  "description": "DS.js - Declarative Self-Learning JavaScript: A framework for compositional LM pipelines with self-improving prompt strategies.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "prepublishOnly": "npm run build"
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
  "license": "MIT"
}
```

#### tsconfig.json
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

#### .gitignore
```
# Dependencies
node_modules/

# Build output
dist/
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*

# Environment variables
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db
```

#### .eslintrc.json
```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "env": {
    "node": true,
    "jest": true
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

#### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### 3. Install Dependencies

#### Runtime Dependencies
```bash
npm install onnxruntime-web js-pytorch
```

#### Development Dependencies
```bash
npm install --save-dev typescript @types/node jest ts-jest @types/jest @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint prettier
```

### 4. Create Initial Project Structure
```
ds.js/
├── src/
│   ├── core/
│   ├── lm/
│   ├── modules/
│   ├── utils/
│   └── index.ts
├── tests/
├── examples/
└── docs/
```

### 5. Create Basic "Smoke" Test

Create `tests/smoke.spec.ts`:
```typescript
describe('Project Setup', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });
});
```

### 6. Configure Jest

Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## TDD Steps

1. Run initial test setup:
```bash
npm test
```
- Verify that Jest runs successfully
- Confirm that the smoke test passes
- Check that coverage reporting works

2. Verify TypeScript compilation:
```bash
npm run build
```
- Ensure no compilation errors
- Check that .d.ts files are generated
- Verify dist/ folder structure

## Commit Guidelines

After completing the setup and verifying all steps:

```bash
git init
git add .
git commit -m "Initial project setup – dependencies, config, and directory structure"
```

## Success Criteria

- [ ] All configuration files are present and valid
- [ ] Dependencies install without errors
- [ ] TypeScript compiles successfully
- [ ] Jest runs and reports coverage
- [ ] ESLint/Prettier formatting works
- [ ] Basic project structure is in place
- [ ] Initial git repository is created with first commit

## Next Steps

Once this phase is complete, proceed to Phase 2 (Core DSL & Module Infrastructure) where we'll begin implementing the core functionality of DS.js.

## Troubleshooting

### Common Issues

1. **npm install fails**
   - Check Node.js version (should be LTS)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and package-lock.json, then retry

2. **Jest configuration issues**
   - Verify ts-jest is properly configured
   - Check that test file naming follows *.spec.ts pattern
   - Ensure NODE_PATH includes project root

3. **TypeScript compilation errors**
   - Verify tsconfig.json settings
   - Check for missing type definitions
   - Ensure all dependencies are properly installed

### Version Compatibility

- Node.js: >=14.x
- TypeScript: ^4.9.0
- Jest: ^29.0.0
- ESLint: ^8.0.0
