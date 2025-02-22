/**
 * Sentiment Analysis Example using DSPy.ts
 * 
 * This example demonstrates how to use DSPy.ts to create a sentiment analysis pipeline
 * that uses OpenRouter API for language model inference.
 * 
 * ## Setup
 * - Set OPENROUTER_API_KEY environment variable with your OpenRouter API key
 * - (Optional) Set OPENROUTER_MODEL to specify the model (default is "anthropic/claude-3-sonnet:beta")
 */

import { configureLM, LMDriver, LMError, GenerationOptions } from "../../src/index";
import { PredictModule } from "../../src/modules/predict";
import { Pipeline } from "../../src/core/pipeline";

// OpenRouter LM implementation
class OpenRouterLM implements LMDriver {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(prompt: string, options?: GenerationOptions): Promise<string> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options?.maxTokens,
        temperature: options?.temperature ?? 0,
        stop: options?.stopSequences,
      })
    });

    if (!response.ok) {
      throw new LMError(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// Get API credentials from environment
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3-sonnet:beta";

if (!API_KEY) {
  throw new Error("OPENROUTER_API_KEY environment variable is not set");
}

// Define the sentiment analysis module
// Define module classes
class SentimentModule extends PredictModule<{ cleanText: string }, { sentiment: string; confidence: number }> {
  constructor() {
    super({
      name: 'SentimentAnalyzer',
      signature: {
        inputs: [
          { name: 'cleanText', type: 'string', description: 'Text to analyze' }
        ],
        outputs: [
          { name: 'sentiment', type: 'string', description: 'Predicted sentiment' },
          { name: 'confidence', type: 'number', description: 'Confidence score' }
        ]
      },
      promptTemplate: ({ cleanText }) => `
        Analyze the sentiment of the following text. Provide:
        1. A sentiment label (positive/negative/neutral)
        2. A confidence score between 0 and 1
        
        Text: "${cleanText}"
        
        Respond in JSON format:
        {
          "sentiment": "positive|negative|neutral",
          "confidence": 0.XX
        }
      `
    });
  }
}

class PreprocessModule extends PredictModule<{ text: string }, { cleanText: string }> {
  constructor() {
    super({
      name: 'TextPreprocessor',
      signature: {
        inputs: [{ name: 'text', type: 'string' }],
        outputs: [{ name: 'cleanText', type: 'string' }]
      },
      promptTemplate: ({ text }) => `
        Clean and normalize this text for sentiment analysis:
        "${text}"
        
        1. Remove special characters
        2. Fix obvious typos
        3. Standardize formatting
        
        Return the cleaned text only.
      `
    });
  }
}

class ValidationModule extends PredictModule<
  { sentiment: string; confidence: number },
  { isValid: boolean; sentiment: string; confidence: number }
> {
  constructor() {
    super({
      name: 'ResultValidator',
      signature: {
        inputs: [
          { name: 'sentiment', type: 'string' },
          { name: 'confidence', type: 'number' }
        ],
        outputs: [
          { name: 'isValid', type: 'boolean' },
          { name: 'sentiment', type: 'string' },
          { name: 'confidence', type: 'number' }
        ]
      },
      promptTemplate: ({ sentiment, confidence }) => `
        Validate the sentiment analysis result:
        - Sentiment: ${sentiment}
        - Confidence: ${confidence}
        
        Check if:
        1. Sentiment is one of: positive, negative, neutral
        2. Confidence is between 0 and 1
        
        Respond in JSON format:
        {
          "isValid": true/false,
          "sentiment": "same as input if valid",
          "confidence": same as input if valid
        }
      `
    });
  }
}

// Initialize modules
const preprocessModule = new PreprocessModule();
const sentimentModule = new SentimentModule();
const validationModule = new ValidationModule();

// Create the pipeline
const pipeline = new Pipeline(
  [preprocessModule, sentimentModule, validationModule],
  {
    stopOnError: true,
    debug: true,
    maxRetries: 2
  }
);

// Configure the LM
const lm = new OpenRouterLM(API_KEY, MODEL);
configureLM(lm);

// Main function to analyze sentiment
async function analyzeSentiment(text: string): Promise<{
  sentiment: string;
  confidence: number;
  isValid: boolean;
}> {
  const result = await pipeline.run({ text });
  if (!result.success) {
    throw result.error;
  }
  return result.finalOutput;
}

// Example usage
async function main() {
  const examples = [
    "I absolutely love this product! Best purchase ever.",
    "This was a terrible experience, would not recommend.",
    "The service was okay, nothing special."
  ];

  console.log("DSPy.ts Sentiment Analysis Example\n");

  for (const text of examples) {
    try {
      console.log("Text:", text);
      const result = await analyzeSentiment(text);
      console.log("Result:", result);
      console.log();
    } catch (err) {
      console.error("Error analyzing text:", (err as Error).message);
      console.log();
    }
  }
}

// Run if executed directly
if (process.argv[1] === __filename) {
  main().catch(console.error);
}

export { analyzeSentiment, pipeline, OpenRouterLM };
