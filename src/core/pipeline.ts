import { Module } from './module';

/**
 * Configuration options for pipeline execution
 */
export interface PipelineConfig {
  stopOnError?: boolean;
  debug?: boolean;
  maxRetries?: number;
  retryDelay?: number;  // milliseconds
}

/**
 * Result of a pipeline execution step
 */
interface StepResult {
  moduleName: string;
  input: any;
  output: any;
  duration: number;
  error?: Error;
}

/**
 * Pipeline execution result
 */
export interface PipelineResult {
  finalOutput: any;
  steps: StepResult[];
  totalDuration: number;
  success: boolean;
  error?: Error;
}

/**
 * Executes a series of DSPy.ts modules as a pipeline
 */
export class Pipeline {
  private modules: Module<any, any>[];
  private config: Required<PipelineConfig>;

  constructor(
    modules: Module<any, any>[],
    config: PipelineConfig = {}
  ) {
    this.modules = modules;
    this.config = {
      stopOnError: true,
      debug: false,
      maxRetries: 0,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * Execute the pipeline with initial input
   */
  public async run(initialInput: any): Promise<PipelineResult> {
    const startTime = Date.now();
    const steps: StepResult[] = [];
    let currentData = initialInput;

    try {
      for (const module of this.modules) {
        const stepResult = await this.executeStep(module, currentData);
        steps.push(stepResult);

        if (stepResult.error) {
          if (this.config.stopOnError) {
            return this.createErrorResult(steps, startTime, stepResult.error);
          }
          // If not stopping on error, continue with original input
          this.logDebug(`Continuing after error in ${module.name}`);
        } else {
          // Only update current data if step succeeded
          currentData = stepResult.output;
        }
      }

      return {
        finalOutput: currentData,
        steps,
        totalDuration: Date.now() - startTime,
        success: true
      };
    } catch (error) {
      return this.createErrorResult(steps, startTime, error as Error);
    }
  }

  /**
   * Execute a single pipeline step with retry logic
   */
  private async executeStep(
    module: Module<any, any>,
    input: any
  ): Promise<StepResult> {
    const stepStart = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.logDebug(`Retrying ${module.name} (attempt ${attempt + 1})`);
          await this.delay(this.config.retryDelay);
        }

        const output = await module.run(input);
        
        return {
          moduleName: module.name,
          input,
          output,
          duration: Date.now() - stepStart
        };
      } catch (error) {
        lastError = error as Error;
        this.logDebug(`Error in ${module.name}: ${error}`);
      }
    }

    return {
      moduleName: module.name,
      input,
      output: input,  // On failure, pass through original input
      duration: Date.now() - stepStart,
      error: lastError
    };
  }

  /**
   * Create error result object
   */
  private createErrorResult(
    steps: StepResult[],
    startTime: number,
    error: Error
  ): PipelineResult {
    return {
      finalOutput: null,
      steps,
      totalDuration: Date.now() - startTime,
      success: false,
      error
    };
  }

  /**
   * Log debug message if debug mode is enabled
   */
  private logDebug(message: string): void {
    if (this.config.debug) {
      console.log(`[Pipeline Debug] ${message}`);
    }
  }

  /**
   * Helper to create a delay promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
