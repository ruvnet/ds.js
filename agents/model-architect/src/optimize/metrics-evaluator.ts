import { ModelMetrics, OptimizationGoals, OptimizationStrategy } from "../types/metrics.ts";

/**
 * Evaluates model metrics against optimization goals
 */
export class MetricsEvaluator {
  private goals: OptimizationGoals;
  private strategy: OptimizationStrategy;

  constructor(goals: OptimizationGoals, strategy: OptimizationStrategy) {
    this.goals = goals;
    this.strategy = strategy;
  }

  /**
   * Check if metrics show improvement over previous metrics
   */
  isImprovement(newMetrics: ModelMetrics, currentMetrics: ModelMetrics): boolean {
    // Weight improvements by objective weights
    const weights = this.strategy.objectives;
    
    const accuracyImprovement = 
      ((newMetrics.accuracy ?? 0) - (currentMetrics.accuracy ?? 0)) * weights.accuracy;
    
    const latencyImprovement =
      ((currentMetrics.latency ?? 0) - (newMetrics.latency ?? 0)) * weights.latency;
    
    const memoryImprovement = 
      ((currentMetrics.memory - newMetrics.memory) / currentMetrics.memory) * weights.memory;
    
    const powerImprovement =
      ((currentMetrics.powerConsumption ?? 0) - (newMetrics.powerConsumption ?? 0)) * weights.power;

    const totalImprovement = 
      accuracyImprovement + 
      latencyImprovement + 
      memoryImprovement + 
      powerImprovement;

    return totalImprovement > 0;
  }

  /**
   * Check if optimization goals are met
   */
  goalsAreMet(metrics: ModelMetrics): boolean {
    if (this.goals.targetAccuracy && (metrics.accuracy ?? 0) < this.goals.targetAccuracy) {
      return false;
    }
    if (this.goals.maxLatency && (metrics.latency ?? 0) > this.goals.maxLatency) {
      return false;
    }
    if (this.goals.maxMemory && metrics.memory > this.goals.maxMemory) {
      return false;
    }
    if (this.goals.minThroughput && (metrics.throughput ?? 0) < this.goals.minThroughput) {
      return false;
    }
    if (this.goals.maxParameters && metrics.parameters > this.goals.maxParameters) {
      return false;
    }
    if (this.goals.powerBudget && (metrics.powerConsumption ?? 0) > this.goals.powerBudget) {
      return false;
    }
    return true;
  }

  /**
   * Calculate improvement percentages
   */
  calculateImprovements(oldMetrics: ModelMetrics, newMetrics: ModelMetrics): Record<string, number> {
    const improvements: Record<string, number> = {};

    if (oldMetrics.accuracy !== undefined && newMetrics.accuracy !== undefined) {
      improvements.accuracy = ((newMetrics.accuracy - oldMetrics.accuracy) / oldMetrics.accuracy) * 100;
    }

    if (oldMetrics.latency !== undefined && newMetrics.latency !== undefined) {
      improvements.latency = ((oldMetrics.latency - newMetrics.latency) / oldMetrics.latency) * 100;
    }

    improvements.memory = ((oldMetrics.memory - newMetrics.memory) / oldMetrics.memory) * 100;
    improvements.parameters = ((oldMetrics.parameters - newMetrics.parameters) / oldMetrics.parameters) * 100;

    if (oldMetrics.throughput !== undefined && newMetrics.throughput !== undefined) {
      improvements.throughput = ((newMetrics.throughput - oldMetrics.throughput) / oldMetrics.throughput) * 100;
    }

    if (oldMetrics.powerConsumption !== undefined && newMetrics.powerConsumption !== undefined) {
      improvements.power = ((oldMetrics.powerConsumption - newMetrics.powerConsumption) / oldMetrics.powerConsumption) * 100;
    }

    return improvements;
  }

  /**
   * Format metrics for logging
   */
  formatMetricsLog(oldMetrics: ModelMetrics, newMetrics: ModelMetrics): string {
    const lines: string[] = [];
    lines.push("\nImprovements Found:");

    if (oldMetrics.accuracy !== undefined && newMetrics.accuracy !== undefined) {
      lines.push(`- Accuracy: ${oldMetrics.accuracy} → ${newMetrics.accuracy}`);
    }
    if (oldMetrics.latency !== undefined && newMetrics.latency !== undefined) {
      lines.push(`- Latency: ${oldMetrics.latency}ms → ${newMetrics.latency}ms`);
    }
    lines.push(`- Memory: ${oldMetrics.memory}MB → ${newMetrics.memory}MB`);
    lines.push(`- Parameters: ${oldMetrics.parameters} → ${newMetrics.parameters}`);
    if (oldMetrics.throughput !== undefined && newMetrics.throughput !== undefined) {
      lines.push(`- Throughput: ${oldMetrics.throughput} → ${newMetrics.throughput} samples/sec`);
    }
    if (oldMetrics.powerConsumption !== undefined && newMetrics.powerConsumption !== undefined) {
      lines.push(`- Power: ${oldMetrics.powerConsumption}W → ${newMetrics.powerConsumption}W`);
    }

    return lines.join("\n");
  }
}
