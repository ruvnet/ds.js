# DSPy.ts - Declarative Self-Learning TypeScript

DSPy.ts is a TypeScript port of [DSPy](https://dspy.ai/), bringing declarative language model programming to the TypeScript ecosystem. It provides a modular framework for building composable and self-improving language model pipelines.

## Overview

DSPy.ts enables you to build reliable AI systems by focusing on what you want your language models to do rather than how to prompt them. Instead of writing prompts as long strings, you define modules that declare their input/output behavior and let DSPy.ts handle the rest.

### Key Features

- **Declarative Module System**: Define reusable modules with clear input/output signatures
- **Pipeline Orchestration**: Chain modules into sophisticated workflows
- **Multiple Backends**: Support for ONNX Runtime Web and JS-PyTorch
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Extensible Architecture**: Easy to add new module types and LM backends
- **Self-Improvement**: Modules can learn from demonstrations and optimize their behavior

## Quick Start

```bash
npm install dspy.ts
```

```typescript
import { defineModule, configureLM, ONNXModel } from 'dspy.ts';

// Configure DSPy.ts to use an ONNX model
const model = new ONNXModel({
  modelPath: 'path/to/model.onnx',
  executionProvider: 'wasm'
});
await model.init();
configureLM(model);

// Define a sentiment analysis module
const sentimentModule = defineModule<{ text: string }, { sentiment: string }>({
  name: 'SentimentAnalyzer',
  signature: {
    inputs: [{ name: 'text', type: 'string' }],
    outputs: [{ name: 'sentiment', type: 'string' }]
  },
  promptTemplate: ({ text }) => `Analyze the sentiment: "${text}"`
});

// Use the module
const result = await sentimentModule.run({
  text: 'I love using DSPy.ts!'
});
console.log(result.sentiment); // Expected: "positive"
```

## Documentation

- [Getting Started](docs/guides/getting-started.md)
- [API Reference](docs/api/README.md)
- [Module Types](docs/guides/module-types.md)
- [Pipeline Guide](docs/guides/pipeline-guide.md)
- [LM Backends](docs/guides/lm-backends.md)
- [Tutorials](docs/tutorials/README.md)
- [Examples](docs/examples/README.md)

## Practical Applications

DSPy.ts can be used for a wide range of language model applications:

- **Question Answering**: Build QA systems with context retrieval and answer generation
- **Text Classification**: Create classifiers for sentiment, topics, or custom categories
- **Content Generation**: Generate structured content with specific formats or constraints
- **Conversational Agents**: Develop chatbots with reasoning and tool-use capabilities
- **Data Extraction**: Extract structured information from unstructured text
- **Text Summarization**: Create summaries with specific formats or requirements

## Advanced Features

- **Chain-of-Thought Reasoning**: Support for step-by-step reasoning in complex tasks
- **ReAct Pattern**: Combine reasoning and action for tool-using agents
- **Signature Validation**: Runtime type checking of module inputs/outputs
- **Error Handling**: Robust error handling with retries and fallbacks
- **Debugging Support**: Comprehensive logging and debugging capabilities
- **Performance Optimization**: Caching and batching for efficient execution

## Roadmap

Future development will focus on:

### Phase 9: Enhanced Module Types
- Implement Chain-of-Thought module
- Add ReAct module for tool use
- Support few-shot learning within modules

### Phase 10: Self-Improvement Engine
- Add demonstration collection
- Implement prompt optimization
- Support automatic few-shot example selection

### Phase 11: Advanced Pipeline Features
- Add parallel execution support
- Implement conditional branching
- Add pipeline visualization tools

### Phase 12: Additional LM Backends
- Add support for Hugging Face models
- Integrate with popular LM APIs
- Support custom model implementations

### Phase 13: Performance Optimization
- Implement smart caching
- Add request batching
- Optimize tensor operations

### Phase 14: Developer Tools
- Create VS Code extension
- Add debugging tools
- Implement testing utilities

### Phase 15: Enterprise Features
- Add monitoring and metrics
- Implement rate limiting
- Add security features

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

## Acknowledgments

DSPy.ts is inspired by the [DSPy](https://dspy.ai/) framework and builds upon its concepts for the TypeScript ecosystem.
