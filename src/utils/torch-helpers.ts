import * as torch from 'js-pytorch';

/**
 * Helper functions for Torch model operations
 */
export class TorchUtils {
  /**
   * Create a tensor from array data
   */
  static createTensor(
    data: number[] | Float32Array,
    options?: {
      requiresGrad?: boolean;
    }
  ): torch.Tensor {
    return torch.tensor(Array.from(data), {
      requiresGrad: options?.requiresGrad || false
    });
  }

  /**
   * Move tensor to specified device
   */
  static toDevice(tensor: torch.Tensor, device: 'cpu' | 'webgl'): torch.Tensor {
    // WebGL acceleration is handled internally by js-pytorch
    return tensor.to(torch.device(device));
  }

  /**
   * Extract data from tensor
   */
  static extractTensorData(tensor: torch.Tensor): number[] {
    return Array.from(tensor.dataSync());
  }

  /**
   * Calculate memory usage of tensor
   */
  static calculateTensorMemory(tensor: torch.Tensor): number {
    // Get total number of elements
    const shape = tensor.shape;
    const totalElements = shape.reduce((a: number, b: number) => a * b, 1);
    // Assume float32 (4 bytes per element)
    return totalElements * 4;
  }
}
