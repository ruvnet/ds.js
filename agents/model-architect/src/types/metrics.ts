import { ModelArchitecture } from "./index.ts";

export interface ModelMetrics {
  // Performance metrics
  accuracy?: number;
  loss?: number;
  latency?: number;  // ms
  throughput?: number;  // samples/sec
  
  // Resource metrics
  parameters: number;
  memory: number;  // MB
  flops: number;
  
  // Optimization metrics
  compressionRatio?: number;
  accuracyLoss?: number;
  speedup?: number;
  
  // Hardware-specific metrics
  cpuUtilization?: number;
  gpuUtilization?: number;
  powerConsumption?: number;  // watts

  // Analysis metrics
  parameterCount?: number;
  layerCount?: number;
  computationalComplexity?: string;
  inferenceTime?: number;
  estimatedMemoryUsage?: number;
  estimatedGpuUtilization?: number;

  // Architecture
  architecture?: ModelArchitecture;
}

export interface OptimizationMetrics {
  // Architecture search metrics
  searchSpace: number;
  evaluatedModels: number;
  bestAccuracy: number;
  convergenceRate: number;
  
  // Training metrics
  epochHistory: {
    loss: number[];
    accuracy: number[];
    learningRate: number[];
  };
  
  // Validation metrics
  crossValidation: {
    mean: number;
    std: number;
    folds: number[];
  };
}

export interface QuantizationMetrics {
  // Size reduction
  originalSize: number;  // bytes
  quantizedSize: number;  // bytes
  compressionRatio: number;
  
  // Performance impact
  accuracyDrop: number;
  speedup: number;
  latencyReduction: number;
  
  // Layer-wise metrics
  layerMetrics: {
    [layerName: string]: {
      originalBits: number;
      quantizedBits: number;
      error: number;
    };
  };
}

export interface OptimizationGoals {
  targetAccuracy?: number;
  maxLatency?: number;
  maxMemory?: number;
  minThroughput?: number;
  maxParameters?: number;
  powerBudget?: number;
}

export interface OptimizationStrategy {
  // Search strategy
  method: "random" | "grid" | "bayesian" | "evolutionary";
  maxIterations: number;
  earlyStoppingPatience: number;
  
  // Hyperparameter ranges
  parameterRanges: {
    [param: string]: {
      min: number;
      max: number;
      step?: number;
      scale?: "linear" | "log";
    };
  };
  
  // Multi-objective weights
  objectives: {
    accuracy: number;
    latency: number;
    memory: number;
    power: number;
  };
}

export interface ModelAnalysis {
  // Basic stats
  metrics: ModelMetrics;
  optimization: OptimizationMetrics;
  quantization: QuantizationMetrics;
  
  // Detailed analysis
  bottlenecks: {
    layer: string;
    metric: string;
    value: number;
    recommendation: string;
  }[];
  
  // Improvement suggestions
  suggestions: {
    type: "architecture" | "training" | "quantization";
    description: string;
    expectedImpact: {
      metric: string;
      improvement: number;
    };
    confidence: number;
  }[];
  
  // Historical progress
  history: {
    timestamp: number;
    metrics: ModelMetrics;
    changes: string[];
  }[];
}

export interface ReasoningStep {
  thought: string;
  action?: string;
  observation?: string;
  metrics?: Partial<ModelMetrics>;
  analysis?: Partial<ModelAnalysis>;
}

export interface OptimizationResult {
  success: boolean;
  metrics: ModelMetrics;
  analysis: ModelAnalysis;
  history: ReasoningStep[];
}
