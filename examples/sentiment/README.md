# Sentiment Analysis Example

This example demonstrates how to use DSPy.ts to build a sentiment analysis pipeline that classifies text as positive, negative, or neutral with confidence scores.

## Features

- Text preprocessing and normalization
- Sentiment classification with confidence scores
- Result validation
- Error handling and retries
- Pipeline-based architecture
- OpenRouter API integration with Claude 3.5 Sonnet

## Components

1. **PreprocessModule**
   - Cleans and normalizes input text
   - Removes special characters
   - Fixes typos
   - Standardizes formatting

2. **SentimentModule**
   - Analyzes text sentiment
   - Provides sentiment label (positive/negative/neutral)
   - Includes confidence score (0-1)

3. **ValidationModule**
   - Validates sentiment results
   - Ensures valid sentiment labels
   - Verifies confidence score range
   - Returns validation status

## Usage

1. Set up environment variables:
   ```bash
   export OPENROUTER_API_KEY="your-api-key"
   export OPENROUTER_MODEL="anthropic/claude-3-sonnet:beta"  # optional, this is the default
   ```

2. Run the example:
   ```bash
   ts-node examples/sentiment/index.ts
   ```

3. Use in your code:
   ```typescript
   import { analyzeSentiment } from './examples/sentiment';

   const result = await analyzeSentiment("I love this product!");
   console.log(result);
   // {
   //   sentiment: "positive",
   //   confidence: 0.95,
   //   isValid: true
   // }
   ```

## Pipeline Architecture

The example uses a three-stage pipeline:

```
Input Text → PreprocessModule → SentimentModule → ValidationModule → Final Result
```

Each module is implemented as a PredictModule that:
1. Takes specific inputs
2. Processes them using the language model
3. Returns structured outputs
4. Validates results

## Error Handling

The pipeline includes:
- Input validation
- Retry logic for failed requests
- Detailed error messages
- Type safety with TypeScript

## OpenRouter Integration

Uses OpenRouter's API with Claude 3.5 Sonnet for language model inference:
- High-quality sentiment analysis
- Temperature and token control
- Error handling for API failures
- Automatic retries

## Customization

You can customize the example by:
- Adjusting prompt templates
- Modifying validation rules
- Changing pipeline configuration
- Using different language models through OpenRouter

## Related Resources

- [Module Types Guide](../../docs/guides/module-types.md)
- [Pipeline Guide](../../docs/guides/pipeline-guide.md)
- [LM Backends Guide](../../docs/guides/lm-backends.md)
