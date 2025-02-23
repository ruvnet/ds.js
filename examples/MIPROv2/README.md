# MIPROv2 Pipeline Example

This example demonstrates how to implement the MIPROv2 (Mixed Initiative PROmpting Version 2) algorithm using dspy.ts and PyTorch.

## What is MIPROv2?

MIPROv2 is an advanced prompting algorithm that combines:

1. **Mixed Initiative Interaction**: Enables dynamic interaction between the model and user, allowing for iterative refinement of outputs.

2. **Prompt Engineering**: Uses sophisticated prompt templates and conditioning to guide model behavior.

3. **Self-Improvement**: Incorporates feedback loops for continuous improvement of output quality.

4. **Multi-Stage Processing**: Breaks down complex tasks into manageable sub-tasks with specialized prompts.

## Key Features

- **Context-Aware Processing**: Handles both standalone inputs and contextually-enriched prompts
- **Confidence Scoring**: Provides confidence metrics for generated outputs
- **Error Handling**: Robust error management with graceful fallbacks
- **Configurable Model Path**: Flexible model loading from custom paths

## Implementation Details

The implementation consists of:

### MIPROv2Module

Core module that implements the MIPROv2 algorithm:

```typescript
class MIPROv2Module extends Module<MIPROv2Input, MIPROv2Output> {
  // Processes input text with optional context
  // Returns generated result with confidence score
}
```

### Input/Output Types

```typescript
interface MIPROv2Input {
  text: string;      // Main input text
  context?: string;  // Optional context
}

interface MIPROv2Output {
  result: string;    // Generated output
  confidence: number; // Confidence score (0-1)
}
```

## Usage

1. Ensure you have a compatible PyTorch model (converted to ONNX format) in the `models/` directory.

2. Import and use in your code:

```typescript
import { MIPROv2Module, runMIPROv2Pipeline } from './mipro-v2-pipeline';

// Create a module instance
const miproModule = new MIPROv2Module({
  modelPath: "path/to/your/model.onnx" // Optional
});

// Use in a pipeline
const pipeline = new Pipeline([miproModule]);
const result = await pipeline.run({
  text: "Your input text",
  context: "Optional context"
});
```

3. Run the example:
```bash
npm run build
node dist/examples/MIPROv2/mipro-v2-pipeline.js
```

## Configuration

The module can be configured through constructor options:

```typescript
const module = new MIPROv2Module({
  modelPath: "custom/path/to/model.onnx"
});
```

## Advanced Features

1. **Confidence Calculation**
   - Length-based scoring (default)
   - Extensible for custom metrics

2. **Error Handling**
   - Graceful fallbacks
   - Detailed error reporting

3. **Prompt Templates**
   - Context-aware formatting
   - Customizable templates

## References

- Original MIPROv2 Paper: [Link to paper]
- PyTorch Documentation: https://pytorch.org/
- DSPy.ts Documentation: [Project documentation]
