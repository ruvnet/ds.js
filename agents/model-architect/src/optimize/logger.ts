import { ModelAnalysis, ModelMetrics } from "../types/metrics.ts";

/**
 * Handles logging for the optimization process
 */
export class OptimizationLogger {
  /**
   * Log optimization phase
   */
  logPhase(phase: string): void {
    console.log(`\n=== ${phase} ===\n`);
  }

  /**
   * Log model analysis
   */
  logAnalysis(analysis: ModelAnalysis): void {
    console.log("Current Metrics:");
    console.log(JSON.stringify(analysis.metrics, null, 2));
    
    console.log("\nBottlenecks:");
    analysis.bottlenecks.forEach(b => {
      console.log(`- ${b.layer}: ${b.metric} = ${b.value}`);
      console.log(`  Recommendation: ${b.recommendation}`);
    });
  }

  /**
   * Log improvement suggestions
   */
  logSuggestions(suggestions: ModelAnalysis["suggestions"]): void {
    console.log("\nImprovement Suggestions:");
    suggestions.forEach(s => {
      console.log(`- ${s.type}: ${s.description}`);
      console.log(`  Expected Impact: ${s.expectedImpact.metric} by ${s.expectedImpact.improvement}`);
      console.log(`  Confidence: ${s.confidence}`);
    });
  }

  /**
   * Log metrics improvement
   */
  logImprovement(oldMetrics: ModelMetrics, newMetrics: ModelMetrics): void {
    console.log("\nImprovements Found:");
    if (oldMetrics.accuracy !== undefined && newMetrics.accuracy !== undefined) {
      console.log(`- Accuracy: ${oldMetrics.accuracy} → ${newMetrics.accuracy}`);
    }
    if (oldMetrics.latency !== undefined && newMetrics.latency !== undefined) {
      console.log(`- Latency: ${oldMetrics.latency}ms → ${newMetrics.latency}ms`);
    }
    console.log(`- Memory: ${oldMetrics.memory}MB → ${newMetrics.memory}MB`);
    console.log(`- Parameters: ${oldMetrics.parameters} → ${newMetrics.parameters}`);
    if (oldMetrics.throughput !== undefined && newMetrics.throughput !== undefined) {
      console.log(`- Throughput: ${oldMetrics.throughput} → ${newMetrics.throughput} samples/sec`);
    }
    if (oldMetrics.powerConsumption !== undefined && newMetrics.powerConsumption !== undefined) {
      console.log(`- Power: ${oldMetrics.powerConsumption}W → ${newMetrics.powerConsumption}W`);
    }
  }

  /**
   * Log no improvement found
   */
  logNoImprovement(count: number, patience: number): void {
    console.log(`\nNo improvement found (${count}/${patience})`);
  }

  /**
   * Log early stopping
   */
  logEarlyStopping(): void {
    console.log("\nEarly stopping triggered - no further improvements found");
  }

  /**
   * Log goals met
   */
  logGoalsMet(): void {
    console.log("\nOptimization goals met!");
  }

  /**
   * Log error with context
   */
  logError(error: Error, context: string, response?: string): void {
    console.error(`Error in ${context}:`, error);
    if (response) {
      console.error("Raw response:", response);
    }
  }

  /**
   * Log optimization start
   */
  logStart(): void {
    console.log("\n=== Starting Recursive Optimization ===\n");
  }

  /**
   * Log optimization completion
   */
  logCompletion(success: boolean, message?: string): void {
    if (success) {
      console.log("\n=== Optimization Complete ===");
      if (message) {
        console.log(message);
      }
    } else {
      console.error("\n=== Optimization Failed ===");
      if (message) {
        console.error(message);
      }
    }
  }

  /**
   * Log ONNX export
   */
  logOnnxExport(path: string): void {
    console.log(`\nExporting optimized model to ONNX format at: ${path}`);
  }

  /**
   * Log iteration progress
   */
  logIterationProgress(iteration: number, maxIterations: number): void {
    console.log(`\nOptimization Iteration ${iteration}/${maxIterations}`);
  }

  /**
   * Log improvement percentages
   */
  logImprovementPercentages(improvements: Record<string, number>): void {
    console.log("\nImprovement Percentages:");
    Object.entries(improvements).forEach(([metric, percentage]) => {
      console.log(`- ${metric}: ${percentage.toFixed(2)}%`);
    });
  }

  /**
   * Log model architecture
   */
  logArchitecture(title: string, architecture: unknown): void {
    console.log(`\n${title}:`);
    console.log(JSON.stringify(architecture, null, 2));
  }
}
