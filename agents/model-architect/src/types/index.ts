// Base types
export interface LayerConfig {
  type: string;
  units?: number;
  kernelSize?: number[];
  activation?: string;
  filters?: number;
  padding?: string;
  strides?: number[];
  dropout?: number;
  vocabSize?: number;  // For Embedding layers
}

export interface ModelArchitecture {
  layers: LayerConfig[];
  inputShape: number[];
  outputShape: number[];
  skipConnections?: {
    from: number;
    to: number;
  }[];
}

export interface AgentConfig {
  mode: "autonomous" | "interactive";
  task: string;
  dataset?: string;
  baseModel?: string;
  constraints?: Record<string, any>;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
}

// Re-export all types from metrics.ts and tools.ts
export * from "./metrics.ts";
export * from "./tools.ts";

// Add architecture property to ModelMetrics
import { ModelMetrics as BaseModelMetrics } from "./metrics.ts";

export interface ModelMetrics extends BaseModelMetrics {
  architecture?: ModelArchitecture;
}

// Export optimization constraints type
export interface OptimizationConstraints {
  // Model size constraints
  maxParams?: number;
  maxParameters?: number;
  maxMemory?: number;

  // Performance constraints
  minAccuracy?: number;
  maxLatency?: number;
  minThroughput?: number;

  // Training constraints
  minBatchSize?: number;
  maxBatchSize?: number;
  minEpochs?: number;
  maxEpochs?: number;
  learningRateRange?: {
    min: number;
    max: number;
  };

  // Hardware constraints
  powerBudget?: number;
  hardwareTarget?: string;
  maxGpuMemory?: number;
  minGpuUtilization?: number;
  maxGpuUtilization?: number;

  // Framework and environment
  framework?: string;
  quantization?: {
    precision: "fp32" | "fp16" | "int8";
    calibrationDataset?: string;
  };
  
  // Architecture constraints
  minLayers?: number;
  maxLayers?: number;
  allowedLayerTypes?: string[];
  skipConnections?: boolean;
  
  // Optimization strategy
  optimizationMethod?: "random" | "grid" | "bayesian" | "evolutionary";
  maxIterations?: number;
  earlyStoppingPatience?: number;
  crossValidationFolds?: number;
}
