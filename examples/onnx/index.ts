import { ONNXModel } from '../../src/lm/onnx';
import { Module } from '../../src/core/module';
import { Pipeline } from '../../src/core/pipeline';

import * as fs from 'fs';

interface TextInput {
  text: string;
}

interface SentimentOutput {
  sentiment: 'positive' | 'negative';
  confidence: number;
}

/**
 * Example module using ONNX model for sentiment classification
 */
class SentimentModule extends Module<TextInput, SentimentOutput> {
  private model: ONNXModel;
  private features: string[];
  private featureMap: Map<string, number>;

  constructor(modelPath: string) {
    super({
      name: 'SentimentClassifier',
      signature: {
        inputs: [{ name: 'text', type: 'string', required: true }],
        outputs: [
          { name: 'sentiment', type: 'string', required: true },
          { name: 'confidence', type: 'number', required: true }
        ]
      },
      promptTemplate: input => input.text,
      strategy: 'Predict'
    });

    // Load feature names
    this.features = fs.readFileSync('models/feature_names.txt', 'utf-8')
      .split('\n')
      .filter(f => f.length > 0);

    // Create feature map for quick lookup
    this.featureMap = new Map(this.features.map((f, i) => [f, i]));

    this.model = new ONNXModel({
      modelPath,
      executionProvider: 'wasm'
    });
  }

  async init(): Promise<void> {
    await this.model.init();
  }

  validateInput(input: TextInput): void {
    super.validateInput(input);
    if (!input.text || input.text.trim().length === 0) {
      throw new Error('Input text cannot be empty');
    }
  }

  private textToFeatures(text: string): Float32Array {
    const words = text.toLowerCase().split(/\s+/);
    const features = new Float32Array(this.features.length);
    
    // Count word occurrences
    for (const word of words) {
      const index = this.featureMap.get(word);
      if (index !== undefined) {
        features[index] += 1;
      }
    }

    return features;
  }

  async run(input: TextInput): Promise<SentimentOutput> {
    this.validateInput(input);

    // Convert text to feature vector
    const features = this.textToFeatures(input.text);

    try {
      // Run inference
      const result = await this.model.run({
        float_input: features
      });

      // Get prediction and confidence
      if (!result) {
        throw new Error('Model returned no result');
      }

      // Debug log the result structure
      console.log('Model output:', JSON.stringify(result, (key, value) => {
        if (value instanceof Float32Array) {
          return Array.from(value);
        }
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      }, 2));

      // Get probabilities tensor
      const probabilities = result.probabilities;
      if (!probabilities || !probabilities.cpuData) {
        throw new Error('Invalid probabilities tensor');
      }

      // Get confidence for positive class (index 1)
      const confidence = probabilities.cpuData[1];
      const normalizedConfidence = Math.max(0, Math.min(1, confidence));
      const sentiment = normalizedConfidence > 0.5 ? 'positive' as const : 'negative' as const;

      const output: SentimentOutput = { sentiment, confidence };
      this.validateOutput(output);
      return output;
    } catch (error) {
      throw new Error(`Inference failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.model.cleanup();
    } catch (error) {
      throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Create and configure a sentiment analysis pipeline
 */
export async function createSentimentAnalyzer(modelPath: string): Promise<[Pipeline, SentimentModule]> {
  const analyzer = new SentimentModule(modelPath);
  await analyzer.init();

  const pipeline = new Pipeline([analyzer], {
    stopOnError: true,
    debug: true
  });

  return [pipeline, analyzer];
}

async function main() {
  const modelPath = process.env.MODEL_PATH || 'models/text-classifier.onnx';
  
  console.log('Creating sentiment analysis pipeline...\n');
  const [pipeline, analyzer] = await createSentimentAnalyzer(modelPath);

  const inputs = [
    'This product is amazing and works great!',
    'I am very disappointed with the quality.',
    'The customer service was excellent.',
    'Would not recommend to anyone.'
  ];

  console.log('Analyzing sentiments...\n');
  try {
    for (const text of inputs) {
      const result = await pipeline.run({ text });
      if (!result.success || !result.finalOutput) {
        console.log(`Input: "${text}"`);
        console.log(`Error: ${result.error?.message || 'Unknown error'}\n`);
        continue;
      }
      console.log(`Input: "${text}"`);
      console.log(`Sentiment: ${result.finalOutput.sentiment}`);
      console.log(`Confidence: ${(result.finalOutput.confidence * 100).toFixed(1)}%\n`);
    }
  } catch (error) {
    console.error('Pipeline error:', error instanceof Error ? error.message : String(error));
  } finally {
    await analyzer.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}
