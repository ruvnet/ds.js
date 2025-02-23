# Model Architect Agent

An autonomous agent for designing and optimizing neural network architectures. The agent uses the ReACT (Reasoning + Acting) pattern and leverages the OpenRouter API to interact with Claude 3.5 Sonnet for architecture optimization.

## Features

- Automated neural network architecture design
- Recursive optimization with real-time metrics
- Support for multiple tasks (image classification, text classification)
- ONNX export for cross-platform compatibility
- Quantization support for model optimization
- Detailed logging and analysis

## Installation

1. Install Deno:
```bash
curl -fsSL https://deno.land/x/install/install.sh | sh
```

2. Set up environment variables:
```bash
export OPENROUTER_API_KEY=your-api-key
```

## Usage

### Command Line Interface

The agent can be used in either auto or interactive mode:

```bash
# Optimize image classification model
deno task optimize:auto:image

# Optimize text classification model
deno task optimize:auto:text

# Interactive mode for image classification
deno task optimize:interactive:image

# Interactive mode for text classification
deno task optimize:interactive:text
```

### Optimization Constraints

You can customize the optimization process by modifying the constraints in `examples/optimize-cnn.ts`:

```typescript
const constraints: OptimizationConstraints = {
  maxParameters: 10_000_000,
  maxMemory: 1000,  // MB
  minAccuracy: 0.95,
  maxLatency: 50,   // ms
  minThroughput: 100,  // samples/sec
  framework: "pytorch",
  quantization: {
    precision: "fp16",
    calibrationDataset: "validation"
  },
  // ... more constraints
};
```

### Output

The agent generates the following outputs in the `models/` directory:

```
models/
  └── task-name/
      ├── model.onnx           # ONNX model file
      ├── architecture.json    # Model architecture
      ├── model-info.json     # Model metadata and metrics
      ├── README.md           # Usage instructions
      ├── conversion.log      # ONNX conversion log
      └── convert_to_onnx.py  # Conversion script
```

## Architecture

The Model Architect Agent follows a modular design:

```mermaid
graph TD
    A[Model Architect Agent] --> B[Initial Architecture Design]
    B --> C[Recursive Optimizer]
    C --> D[Analysis]
    D --> E[Suggestions]
    E --> F[Improvements]
    F --> D
    F --> G[ONNX Export]
```

### Components

- **Base Agent**: Provides core functionality and interface
- **Autonomous Agent**: Implements automated optimization
- **Recursive Optimizer**: Performs iterative improvements
- **ONNX Export**: Handles model conversion and export

## Development

### Project Structure

```
src/
  ├── autonomous.ts       # Autonomous agent implementation
  ├── base.ts            # Base agent class
  ├── interactive.ts     # Interactive agent implementation
  ├── optimize/          # Optimization components
  ├── tools/            # Agent tools
  ├── types/            # TypeScript type definitions
  └── utils/            # Utility functions
```

### Adding New Tasks

1. Update `types/index.ts` with task-specific types
2. Add task implementation in `autonomous.ts`
3. Create example in `examples/` directory
4. Update documentation

### Running Tests

```bash
deno test --allow-net --allow-env
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
