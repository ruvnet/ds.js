/**
 * Base classes and types for DSPy.ts optimizers
 */

import { Module } from '../core/module';
import { Pipeline } from '../core/pipeline';

/**
 * Metric function type for evaluating program outputs
 */
export type MetricFunction<TInput = any, TOutput = any> = (
  input: TInput,
  output: TOutput,
  expected?: TOutput
) => number;

/**
 * Base optimizer configuration
 */
export interface OptimizerConfig {
  maxIterations?: number;
  numThreads?: number;
  debug?: boolean;
}

/**
 * Training example type
 */
export interface TrainingExample<TInput = any, TOutput = any> {
  input: TInput;
  output?: TOutput;
}

/**
 * Base class for all DSPy.ts optimizers
 */
export abstract class Optimizer<TInput = any, TOutput = any> {
  protected config: Required<OptimizerConfig>;
  protected metric: MetricFunction<TInput, TOutput>;

  constructor(metric: MetricFunction<TInput, TOutput>, config: OptimizerConfig = {}) {
    this.metric = metric;
    this.config = {
      maxIterations: 10,
      numThreads: 1,
      debug: false,
      ...config
    };
  }

  /**
   * Compile a program or module with optimization
   */
  abstract compile(
    program: Module<any, any> | Pipeline,
    trainset: TrainingExample<TInput, TOutput>[]
  ): Promise<Module<any, any> | Pipeline>;

  /**
   * Save the optimized program to a file
   */
  abstract save(path: string, saveFieldMeta?: boolean): void;

  /**
   * Load an optimized program from a file
   */
  abstract load(path: string): void;

  protected log(message: string) {
    if (this.config.debug) {
      console.log(`[Optimizer] ${message}`);
    }
  }
}
