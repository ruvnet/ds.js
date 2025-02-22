import { Module } from './module';

/**
 * Configuration for pipeline execution
 */
export interface PipelineConfig {
  stopOnError?: boolean;
  debug?: boolean;
}

/**
 * Executes a series of DS.js modules as a pipeline.
 * Each module's output is passed as input to the next module.
 */
export async function runPipeline(
  modules: Array<Module<any, any>>,
  initialInput: any,
  config: PipelineConfig = { stopOnError: true, debug: false }
): Promise<any> {
  let currentData = initialInput;

  for (const module of modules) {
    try {
      if (config.debug) {
        console.log(`Running module: ${module.name}`);
        console.log('Input:', currentData);
      }

      currentData = await module.run(currentData);

      if (config.debug) {
        console.log('Output:', currentData);
      }
    } catch (error) {
      if (config.stopOnError) {
        throw error;
      }
      console.error(`Error in module ${module.name}:`, error);
    }
  }

  return currentData;
}
