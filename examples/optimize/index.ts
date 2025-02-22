/**
 * Optimizer Example using DSPy.ts
 * 
 * This example demonstrates how to use DSPy.ts optimizers to improve module performance
 * by automatically generating and selecting few-shot examples.
 * 
 * ## Setup
 * - Set OPENROUTER_API_KEY environment variable with your OpenRouter API key
 * - (Optional) Set OPENROUTER_MODEL to specify the model (default is "anthropic/claude-3-sonnet:beta")
 */

import { configureLM, getLM, LMDriver, LMError, GenerationOptions } from "../../src/index";
import { PredictModule } from "../../src/modules/predict";
import { Pipeline } from "../../src/core/pipeline";
import { BootstrapFewShot } from "../../src/optimize/bootstrap";

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

// Define module to optimize
class SentimentModule extends PredictModule<
  { text: string },
  { sentiment: 'positive' | 'negative' | 'neutral'; confidence: number }
> {
  constructor() {
    super({
      name: 'SentimentAnalyzer',
      signature: {
        inputs: [{ name: 'text', type: 'string' }],
        outputs: [
          { name: 'sentiment', type: 'string' },
          { name: 'confidence', type: 'number' }
        ]
      },
      promptTemplate: ({ text }) => `
        Analyze the sentiment of this text and respond in JSON format:
        "${text}"
        
        Response format:
        {
          "sentiment": "positive|negative|neutral",
          "confidence": 0.XX
        }
      `
    });
  }
}

// Get API credentials from environment
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3-sonnet:beta";

if (!API_KEY) {
  throw new Error("OPENROUTER_API_KEY environment variable is not set");
}

// Configure the LM
const lm = new OpenRouterLM(API_KEY, MODEL);
configureLM(lm);

// Training data
const trainset = [
  {
    input: { text: "I love this product! It's amazing!" },
    output: { sentiment: "positive" as const, confidence: 0.95 }
  },
  {
    input: { text: "This is the worst experience ever." },
    output: { sentiment: "negative" as const, confidence: 0.9 }
  },
  {
    input: { text: "The weather is okay today." },
    output: { sentiment: "neutral" as const, confidence: 0.8 }
  },
  // Unlabeled examples for bootstrapping
  {
    input: { text: "The service was fantastic and exceeded my expectations!" }
  },
  {
    input: { text: "I'm really disappointed with the quality." }
  }
];

// Metric function
function exactMatchMetric(
  input: { text: string },
  output: { sentiment: string; confidence: number },
  expected?: { sentiment: string; confidence: number }
): number {
  if (!expected) return 0;
  return output.sentiment === expected.sentiment ? 1 : 0;
}

// Example usage
async function main() {
  console.log("DSPy.ts Optimizer Example\n");

  // Create base module
  const baseModule = new SentimentModule();

  // Create and configure optimizer
  const optimizer = new BootstrapFewShot(exactMatchMetric, {
    maxLabeledDemos: 2,
    maxBootstrappedDemos: 2,
    minScore: 0.8,
    debug: true
  });

  // Optimize the module
  console.log("Optimizing module...\n");
  const optimizedModule = await optimizer.compile(baseModule, trainset);

  // Test both modules
  const testExamples = [
    "The customer service was exceptional and they went above and beyond.",
    "I regret purchasing this item, complete waste of money.",
    "The movie was neither great nor terrible, just average."
  ];

  console.log("Testing base module:");
  for (const text of testExamples) {
    try {
      const result = await baseModule.run({ text });
      console.log(`Text: "${text}"`);
      console.log("Result:", result);
      console.log();
    } catch (err) {
      console.error("Error:", (err as Error).message);
      console.log();
    }
  }

  console.log("\nTesting optimized module:");
  for (const text of testExamples) {
    try {
      const result = await optimizedModule.run({ text });
      console.log(`Text: "${text}"`);
      console.log("Result:", result);
      console.log();
    } catch (err) {
      console.error("Error:", (err as Error).message);
      console.log();
    }
  }

  // Save the optimized module
  optimizer.save("optimized-sentiment.json");
  console.log("\nOptimized module saved to optimized-sentiment.json");
}

// Run if executed directly
if (process.argv[1] === __filename) {
  main().catch(console.error);
}

export { SentimentModule, exactMatchMetric };
