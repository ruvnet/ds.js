import { Module } from "../module.ts";
import { FieldType, signature } from "../signature.ts";

export class PredictModule extends Module {
  constructor() {
    super(signature(
      "PredictModule",
      "Makes predictions using a language model",
      {
        prompt: { type: FieldType.String, description: "Input prompt" },
        temperature: { type: FieldType.Number, description: "Sampling temperature", required: false }
      },
      {
        prediction: { type: FieldType.String, description: "Generated prediction" }
      }
    ));
  }

  async forward(inputs: Record<string, any>): Promise<Record<string, any>> {
    const { prompt, temperature = 0.7 } = inputs;

    // Generate prediction
    const prediction = await this.generateText(prompt);

    return {
      prediction
    };
  }
}
