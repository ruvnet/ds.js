import * as ort from 'onnxruntime-web';

/**
 * Helper functions for ONNX model operations
 */
export class ONNXUtils {
  /**
   * Validate model metadata
   */
  static validateModelMetadata(session: ort.InferenceSession): void {
    const inputNames = session.inputNames;
    const outputNames = session.outputNames;

    if (!inputNames.length || !outputNames.length) {
      throw new Error('Invalid model: missing input/output names');
    }
  }

  /**
   * Create a tensor from array data
   */
  static createTensor(
    data: number[] | Float32Array,
    dims: number[],
    type: 'float32' | 'int64' = 'float32'
  ): ort.Tensor {
    const arrayData = data instanceof Float32Array ? data : new Float32Array(data);
    return new ort.Tensor(type, arrayData, dims);
  }

  /**
   * Extract data from output tensor
   */
  static extractTensorData(tensor: ort.Tensor): number[] {
    return Array.from(tensor.data as Float32Array);
  }
}
