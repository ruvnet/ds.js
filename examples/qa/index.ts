/**
 * Question Answering Example using DSPy.ts
 * 
 * This example demonstrates how to use DSPy.ts to create a QA pipeline
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

// Define module classes
class QuestionValidatorModule extends PredictModule<
  { question: string },
  { isValid: boolean; cleanQuestion: string; type: string }
> {
  constructor() {
    super({
      name: 'QuestionValidator',
      signature: {
        inputs: [
          { name: 'question', type: 'string' }
        ],
        outputs: [
          { name: 'isValid', type: 'boolean' },
          { name: 'cleanQuestion', type: 'string' },
          { name: 'type', type: 'string' }
        ]
      },
      promptTemplate: ({ question }) => `
        Validate this question and determine its type.
        
        Question: "${question}"
        
        Respond in JSON format:
        {
          "isValid": true/false,
          "cleanQuestion": "cleaned question text",
          "type": "factual|opinion|clarification|etc"
        }
      `
    });
  }
}

class ContextRetrieverModule extends PredictModule<
  { isValid: boolean; cleanQuestion: string; type: string },
  { contexts: string[]; cleanQuestion: string }
> {
  constructor() {
    super({
      name: 'ContextRetriever',
      signature: {
        inputs: [
          { name: 'cleanQuestion', type: 'string' },
          { name: 'type', type: 'string' }
        ],
        outputs: [
          { name: 'contexts', type: 'object' },
          { name: 'cleanQuestion', type: 'string' }
        ]
      },
      promptTemplate: ({ cleanQuestion, type }) => `
        Generate relevant context information for this ${type} question.
        
        Question: "${cleanQuestion}"
        
        Provide 2-3 relevant pieces of context information.
        Respond in JSON format:
        {
          "contexts": [
            "context 1",
            "context 2",
            "context 3"
          ],
          "cleanQuestion": "${cleanQuestion}"
        }
      `
    });
  }
}

class AnswerGeneratorModule extends PredictModule<
  { contexts: string[]; cleanQuestion: string },
  { answer: string; confidence: number; cleanQuestion: string }
> {
  constructor() {
    super({
      name: 'AnswerGenerator',
      signature: {
        inputs: [
          { name: 'contexts', type: 'object' },
          { name: 'cleanQuestion', type: 'string' }
        ],
        outputs: [
          { name: 'answer', type: 'string' },
          { name: 'confidence', type: 'number' },
          { name: 'cleanQuestion', type: 'string' }
        ]
      },
      promptTemplate: ({ contexts, cleanQuestion }) => `
        Generate an answer to the question using the provided context.
        
        Question: "${cleanQuestion}"
        
        Context:
        ${contexts.map((ctx, i) => `${i + 1}. ${ctx}`).join('\n')}
        
        Respond in JSON format:
        {
          "answer": "detailed answer based on context",
          "confidence": 0.XX,
          "cleanQuestion": "${cleanQuestion}"
        }
      `
    });
  }
}

class AnswerVerifierModule extends PredictModule<
  { answer: string; confidence: number; cleanQuestion: string },
  { isValid: boolean; answer: string; confidence: number }
> {
  constructor() {
    super({
      name: 'AnswerVerifier',
      signature: {
        inputs: [
          { name: 'answer', type: 'string' },
          { name: 'confidence', type: 'number' },
          { name: 'cleanQuestion', type: 'string' }
        ],
        outputs: [
          { name: 'isValid', type: 'boolean' },
          { name: 'answer', type: 'string' },
          { name: 'confidence', type: 'number' }
        ]
      },
      promptTemplate: ({ answer, confidence, cleanQuestion }) => `
        Verify this answer:
        
        Question: "${cleanQuestion}"
        Answer: "${answer}"
        Confidence: ${confidence}
        
        Check if:
        1. Answer directly addresses the question
        2. Answer is complete and coherent
        3. Confidence score is justified
        
        Respond in JSON format:
        {
          "isValid": true/false,
          "answer": "same as input if valid, or corrected version",
          "confidence": same as input if valid, or adjusted score
        }
      `
    });
  }
}

// Initialize modules
const questionValidator = new QuestionValidatorModule();
const contextRetriever = new ContextRetrieverModule();
const answerGenerator = new AnswerGeneratorModule();
const answerVerifier = new AnswerVerifierModule();

// Create the pipeline
const pipeline = new Pipeline(
  [questionValidator, contextRetriever, answerGenerator, answerVerifier],
  {
    stopOnError: true,
    debug: true,
    maxRetries: 2
  }
);

// Configure the LM
const lm = new OpenRouterLM(API_KEY, MODEL);
configureLM(lm);

// Main function to answer questions
async function answerQuestion(question: string): Promise<{
  answer: string;
  confidence: number;
  isValid: boolean;
}> {
  const result = await pipeline.run({ question });
  if (!result.success) {
    throw result.error;
  }
  return result.finalOutput;
}

// Example usage
async function main() {
  const examples = [
    "What is the capital of France?",
    "How does photosynthesis work?",
    "What are the main causes of climate change?"
  ];

  console.log("DSPy.ts Question Answering Example\n");

  for (const question of examples) {
    try {
      console.log("Question:", question);
      const result = await answerQuestion(question);
      console.log("Answer:", result.answer);
      console.log("Confidence:", result.confidence);
      console.log("Valid:", result.isValid);
      console.log();
    } catch (err) {
      console.error("Error answering question:", (err as Error).message);
      console.log();
    }
  }
}

// Run if executed directly
if (process.argv[1] === __filename) {
  main().catch(console.error);
}

export { answerQuestion, pipeline, OpenRouterLM };
