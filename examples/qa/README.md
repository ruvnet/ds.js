# Question Answering Example

This example demonstrates how to use DSPy.ts to build a question answering pipeline that can validate questions, retrieve relevant context, generate answers, and verify the results.

## Features

- Question validation and type classification
- Context generation and retrieval
- Answer generation with confidence scores
- Answer verification
- Error handling and retries
- Pipeline-based architecture
- OpenRouter API integration with Claude 3.5 Sonnet

## Components

1. **QuestionValidatorModule**
   - Validates question format and structure
   - Determines question type (factual, opinion, etc.)
   - Cleans and normalizes question text

2. **ContextRetrieverModule**
   - Generates relevant context for the question
   - Adapts to question type
   - Provides multiple context pieces

3. **AnswerGeneratorModule**
   - Generates detailed answers using context
   - Provides confidence scores
   - Ensures answer relevance

4. **AnswerVerifierModule**
   - Validates answer quality
   - Checks answer completeness
   - Verifies confidence scores

## Usage

1. Set up environment variables:
   ```bash
   export OPENROUTER_API_KEY="your-api-key"
   export OPENROUTER_MODEL="anthropic/claude-3-sonnet:beta"  # optional, this is the default
   ```

2. Run the example:
   ```bash
   ts-node examples/qa/index.ts
   ```

3. Use in your code:
   ```typescript
   import { answerQuestion } from './examples/qa';

   const result = await answerQuestion("What is the capital of France?");
   console.log(result);
   // {
   //   answer: "The capital of France is Paris...",
   //   confidence: 0.95,
   //   isValid: true
   // }
   ```

## Pipeline Architecture

The example uses a four-stage pipeline:

```
Question → QuestionValidator → ContextRetriever → AnswerGenerator → AnswerVerifier → Final Answer
```

Each module is implemented as a PredictModule that:
1. Takes specific inputs
2. Processes them using the language model
3. Returns structured outputs
4. Validates results

## Error Handling

The pipeline includes:
- Question validation
- Context verification
- Answer quality checks
- Retry logic for failed requests
- Detailed error messages
- Type safety with TypeScript

## OpenRouter Integration

Uses OpenRouter's API with Claude 3.5 Sonnet for language model inference:
- High-quality question understanding
- Contextual answer generation
- Accurate confidence scoring
- Error handling for API failures
- Automatic retries

## Customization

You can customize the example by:
- Adjusting prompt templates
- Modifying validation rules
- Changing pipeline configuration
- Using different language models through OpenRouter
- Adding additional processing modules

## Related Resources

- [Module Types Guide](../../docs/guides/module-types.md)
- [Pipeline Guide](../../docs/guides/pipeline-guide.md)
- [LM Backends Guide](../../docs/guides/lm-backends.md)
