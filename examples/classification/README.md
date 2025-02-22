# Text Classification Example

This example demonstrates how to use DSPy.ts to build a text classification pipeline that can categorize text into predefined categories (news, sports, technology, entertainment) with confidence scores.

## Features

- Text preprocessing and feature extraction
- Multi-model classification
- Ensemble voting
- Confidence thresholding
- Error handling and retries
- Pipeline-based architecture
- OpenRouter API integration with Claude 3.5 Sonnet

## Components

1. **PreprocessModule**
   - Cleans and normalizes input text
   - Extracts key features (word frequencies, sentiment indicators)
   - Prepares text for classification

2. **ClassifierModules (2 instances)**
   - Classify text into predefined categories
   - Provide probability distributions
   - Use different prompting strategies

3. **EnsembleModule**
   - Combines predictions from multiple classifiers
   - Uses weighted voting
   - Calculates confidence scores

4. **ThresholdModule**
   - Validates classification results
   - Checks confidence thresholds
   - Ensures reliable predictions

## Usage

1. Set up environment variables:
   ```bash
   export OPENROUTER_API_KEY="your-api-key"
   export OPENROUTER_MODEL="anthropic/claude-3-sonnet:beta"  # optional, this is the default
   ```

2. Run the example:
   ```bash
   ts-node examples/classification/index.ts
   ```

3. Use in your code:
   ```typescript
   import { classifyText } from './examples/classification';

   const result = await classifyText("Apple announces new iPhone with AI features");
   console.log(result);
   // {
   //   category: "technology",
   //   confidence: 0.95,
   //   isReliable: true
   // }
   ```

## Pipeline Architecture

The example uses a five-stage pipeline:

```
Text → PreprocessModule → Classifier1 → Classifier2 → EnsembleModule → ThresholdModule → Final Result
```

Each module is implemented as a PredictModule that:
1. Takes specific inputs
2. Processes them using the language model
3. Returns structured outputs
4. Validates results

## Error Handling

The pipeline includes:
- Input validation
- Feature verification
- Confidence thresholding
- Retry logic for failed requests
- Detailed error messages
- Type safety with TypeScript

## OpenRouter Integration

Uses OpenRouter's API with Claude 3.5 Sonnet for language model inference:
- High-quality text understanding
- Accurate category prediction
- Confidence scoring
- Error handling for API failures
- Automatic retries

## Customization

You can customize the example by:
- Modifying category definitions
- Adjusting confidence thresholds
- Changing feature extraction
- Using different language models through OpenRouter
- Adding more classifiers to the ensemble

## Related Resources

- [Module Types Guide](../../docs/guides/module-types.md)
- [Pipeline Guide](../../docs/guides/pipeline-guide.md)
- [LM Backends Guide](../../docs/guides/lm-backends.md)
