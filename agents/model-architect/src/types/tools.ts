/**
 * Tool-related types and errors
 */

export interface ToolParameter {
  type: string;
  description: string;
  required?: boolean;
  default?: any;
  enum?: string[];
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    [key: string]: ToolParameter;
  };
  returns: {
    type: string;
    description: string;
    properties?: {
      [key: string]: {
        type: string;
        description: string;
      };
    };
  };
}

export interface ToolResponse {
  success: boolean;
  result?: any;
  error?: string;
}

export interface TrainingConfig {
  batchSize: number;
  epochs: number;
  learningRate: number;
  optimizer: string;
  lossFunction: string;
  metrics: string[];
}

export interface QuantizationConfig {
  precision: "fp32" | "fp16" | "int8";
  calibrationDataset?: string;
  layerWise?: boolean;
  excludeLayers?: string[];
}

export interface ONNXExportConfig {
  filename: string;
  opset?: number;
  dynamicAxes?: {
    [key: string]: {
      [key: string]: string;
    };
  };
  optimizationLevel?: 0 | 1 | 2 | 99;
}

export interface FeedbackPrompt {
  type: "architecture" | "optimization" | "quantization";
  description: string;
  options?: string[];
  currentValue: any;
  suggestedValue: any;
}

export interface FeedbackResponse {
  approved: boolean;
  value?: any;
  comments?: string;
}

// Error classes
export class ArchitectError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ArchitectError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class OptimizationError extends Error {
  constructor(message: string, public phase: string) {
    super(message);
    this.name = "OptimizationError";
  }
}
