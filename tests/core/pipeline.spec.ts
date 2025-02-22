import { Module } from '../../src/core/module';
import { runPipeline, PipelineConfig } from '../../src/core/pipeline';

// Test modules for pipeline testing
class UppercaseModule extends Module<{ text: string }, { upper: string }> {
  constructor() {
    super({
      name: 'UppercaseModule',
      signature: {
        inputs: [{ name: 'text', type: 'string', required: true }],
        outputs: [{ name: 'upper', type: 'string', required: true }]
      },
      promptTemplate: ({ text }) => text,
      strategy: 'Predict'
    });
  }

  async run(input: { text: string }): Promise<{ upper: string }> {
    this.validateInput(input);
    const result = { upper: input.text.toUpperCase() };
    this.validateOutput(result);
    return result;
  }
}

class PrefixModule extends Module<{ upper: string }, { result: string }> {
  constructor() {
    super({
      name: 'PrefixModule',
      signature: {
        inputs: [{ name: 'upper', type: 'string', required: true }],
        outputs: [{ name: 'result', type: 'string', required: true }]
      },
      promptTemplate: ({ upper }) => upper,
      strategy: 'Predict'
    });
  }

  async run(input: { upper: string }): Promise<{ result: string }> {
    this.validateInput(input);
    const result = { result: `PREFIX_${input.upper}` };
    this.validateOutput(result);
    return result;
  }
}

class ErrorModule extends Module<any, any> {
  constructor() {
    super({
      name: 'ErrorModule',
      signature: {
        inputs: [{ name: 'any', type: 'string' }],
        outputs: [{ name: 'any', type: 'string' }]
      },
      promptTemplate: () => '',
      strategy: 'Predict'
    });
  }

  async run(): Promise<any> {
    throw new Error('Test error');
  }
}

describe('Pipeline Executor', () => {
  it('should execute modules in sequence', async () => {
    const modules = [
      new UppercaseModule(),
      new PrefixModule()
    ];

    const result = await runPipeline(modules, { text: 'hello' });
    expect(result).toEqual({ result: 'PREFIX_HELLO' });
  });

  it('should handle errors according to config', async () => {
    const modules = [new ErrorModule()];

    // Should throw with stopOnError: true
    await expect(runPipeline(modules, {}, { stopOnError: true }))
      .rejects
      .toThrow('Test error');

    // Should not throw with stopOnError: false
    const result = await runPipeline(modules, {}, { stopOnError: false });
    expect(result).toEqual({});
  });

  it('should log debug information when debug is enabled', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const modules = [new UppercaseModule()];

    await runPipeline(modules, { text: 'test' }, { debug: true });

    expect(consoleSpy).toHaveBeenCalledWith('Running module: UppercaseModule');
    expect(consoleSpy).toHaveBeenCalledWith('Input:', { text: 'test' });
    expect(consoleSpy).toHaveBeenCalledWith('Output:', { upper: 'TEST' });

    consoleSpy.mockRestore();
  });

  it('should log errors when stopOnError is false', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const modules = [new ErrorModule()];

    await runPipeline(modules, {}, { stopOnError: false });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in module ErrorModule:',
      new Error('Test error')
    );

    consoleErrorSpy.mockRestore();
  });

  it('should use default config when none provided', async () => {
    const modules = [new UppercaseModule()];
    const result = await runPipeline(modules, { text: 'test' });
    expect(result).toEqual({ upper: 'TEST' });
  });

  it('should validate module inputs and outputs', async () => {
    const modules = [
      new UppercaseModule(),
      new PrefixModule()
    ];

    // Invalid input type
    await expect(runPipeline(modules, { text: 123 as any }))
      .rejects
      .toThrow('Invalid input: text must be of type string');

    // Missing required input
    await expect(runPipeline(modules, {}))
      .rejects
      .toThrow('Missing required input field: text');
  });
});
