import { Module } from '../../src/core/module';
import { LMDriver } from '../../src/lm/base';

export interface MIPROv2Input {
  text: string;
  context?: string;
}

export interface MIPROv2Output {
  result: string;
  confidence: number;
}

export class MIPROv2Module extends Module<MIPROv2Input, MIPROv2Output> {
  private model: LMDriver;
  private minLength = 10;
  private maxLength = 100;

  constructor(model: LMDriver) {
    super({
      name: "MIPROv2Module",
      signature: {
        inputs: [
          { name: "text", type: "string", description: "The input text to process" },
          { name: "context", type: "string", description: "Optional context for processing" }
        ],
        outputs: [
          { name: "result", type: "string", description: "The processed output text" },
          { name: "confidence", type: "number", description: "Confidence score of the output" }
        ]
      },
      promptTemplate: (input: MIPROv2Input) => 
        input.context ? 
          `Context: ${input.context}\nInput: ${input.text}` :
          `Input: ${input.text}`,
      strategy: "Predict"
    });
    
    this.model = model;
  }

  async run(input: MIPROv2Input): Promise<MIPROv2Output> {
    try {
      // Generate prompt
      const prompt = this.promptTemplate(input);

      // Generate output using the model
      const output = await this.model.generate(prompt);

      // Calculate confidence score
      const confidence = this.calculateConfidence(output);

      return {
        result: output,
        confidence
      };
    } catch (error) {
      console.error("Error in MIPROv2Module:", error);
      return {
        result: "Error processing input",
        confidence: 0
      };
    }
  }

  private calculateConfidence(output: string): number {
    const length = output.length;

    if (length < this.minLength) return 0.3;
    if (length > this.maxLength) return 0.7;
    
    return 0.3 + (0.4 * (length - this.minLength) / (this.maxLength - this.minLength));
  }
}
