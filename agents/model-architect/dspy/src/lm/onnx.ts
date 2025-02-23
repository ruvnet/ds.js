import { LMDriver } from '../lm';
import * as ort from 'npm:onnxruntime-web';

/**
 * ONNX model driver for language model inference
 */
export class ONNXModel implements LMDriver {
  private session!: ort.InferenceSession;
  private modelPath: string;

  constructor(modelPath: string) {
    this.modelPath = modelPath;
  }

  async initialize(): Promise<void> {
    this.session = await ort.InferenceSession.create(this.modelPath);
  }

  async generate(prompt: string): Promise<string> {
    if (!this.session) {
      throw new Error('ONNX model not initialized. Call initialize() first.');
    }

    // Create input tensor
    const inputTensor = new ort.Tensor('string', [prompt], [1]);

    // Run inference
    const outputs = await this.session.run({
      input: inputTensor
    });

    // Get output text
    const outputData = outputs.output.data as string[];
    return outputData[0];
  }
}
