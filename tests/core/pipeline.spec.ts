import { Pipeline, PipelineConfig } from '../../src/core/pipeline';
import { Module } from '../../src/core/module';
import { PredictModule } from '../../src/modules/predict';
import { configureLM } from '../../src/index';
import { DummyLM } from '../../src/lm/dummy';

describe('Pipeline', () => {
  beforeAll(async () => {
    // Configure and initialize DummyLM with specific responses
    const dummyLM = new DummyLM(new Map([
      ['hello', 'HELLO'],
      ['HELLO', 'Processed: HELLO'],
      ['{"output": "Success"}', '{"output": "Success"}']
    ]));
    await dummyLM.init(); // Initialize the LM
    configureLM(dummyLM);
  });

  it('should execute modules in sequence', async () => {
    const module1 = new PredictModule({
      name: 'Module1',
      signature: {
        inputs: [{ name: 'text', type: 'string' }],
        outputs: [{ name: 'upper', type: 'string' }]
      },
      promptTemplate: ({ text }) => text
    });

    const module2 = new PredictModule({
      name: 'Module2',
      signature: {
        inputs: [{ name: 'upper', type: 'string' }],
        outputs: [{ name: 'result', type: 'string' }]
      },
      promptTemplate: ({ upper }) => upper
    });

    const pipeline = new Pipeline([module1, module2]);
    const result = await pipeline.run({ text: 'hello' });

    expect(result.success).toBe(true);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].moduleName).toBe('Module1');
    expect(result.steps[1].moduleName).toBe('Module2');
    expect(result.finalOutput.result).toBe('Processed: HELLO');
  });

  it('should handle errors according to config', async () => {
    const errorModule = new PredictModule({
      name: 'ErrorModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: () => { throw new Error('Test error'); }
    });

    // With stopOnError: true
    const strictPipeline = new Pipeline([errorModule], { stopOnError: true });
    const strictResult = await strictPipeline.run({ input: 'test' });
    expect(strictResult.success).toBe(false);
    expect(strictResult.error).toBeDefined();
    expect(strictResult.error?.message).toContain('Test error');

    // With stopOnError: false
    const lenientPipeline = new Pipeline([errorModule], { stopOnError: false });
    const lenientResult = await lenientPipeline.run({ input: 'test' });
    expect(lenientResult.steps[0].error).toBeDefined();
    expect(lenientResult.finalOutput).toEqual({ input: 'test' });
  });

  it('should support retry logic', async () => {
    let attempts = 0;
    const retryModule = new PredictModule({
      name: 'RetryModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: () => {
        attempts++;
        if (attempts === 1) throw new Error('First attempt fails');
        return '{"output": "Success"}';
      }
    });

    const pipeline = new Pipeline([retryModule], {
      maxRetries: 1,
      retryDelay: 100,
      debug: true // Enable debug mode to test logging
    });

    const result = await pipeline.run({ input: 'test' });
    expect(result.success).toBe(true);
    expect(attempts).toBe(2);
    expect(result.finalOutput.output).toBe('Success');
  });

  it('should log debug messages when debug mode is enabled', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const errorModule = new PredictModule({
      name: 'DebugModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: () => { throw new Error('Debug test error'); }
    });

    const pipeline = new Pipeline([errorModule], { 
      debug: true,
      maxRetries: 1
    });
    await pipeline.run({ input: 'test' });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Pipeline Debug]'));
    consoleSpy.mockRestore();
  });
});
