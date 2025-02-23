import { LMDriver } from "../lm.ts";
import * as ort from "onnxruntime-web";

export class ONNXModel implements LMDriver {
  private session!: ort.InferenceSession;
  private modelPath: string;

  constructor(modelPath: string) {
    this.modelPath = modelPath;
  }

  async initialize(): Promise<void> {
    try {
      this.session = await ort.InferenceSession.create(this.modelPath);
    } catch (error) {
      throw new Error(`Failed to load ONNX model: ${error}`);
    }
  }

  async generate(prompt: string): Promise<string> {
    if (!this.session) {
      throw new Error("Model not initialized. Call initialize() first.");
    }

    try {
      // Convert input to tensor
      const inputTensor = new ort.Tensor(
        "string",
        [prompt],
        [1]
      );

      // Run inference
      const outputs = await this.session.run({
        input: inputTensor
      });

      // Get output text
      const outputData = outputs.output.data as string[];
      return outputData[0];
    } catch (error) {
      throw new Error(`Failed to generate text: ${error}`);
    }
  }
}
