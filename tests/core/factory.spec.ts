import { defineModule } from '../../src/core/factory';
import { PredictModule } from '../../src/modules/predict';

describe('Module Factory', () => {
  it('should create PredictModule by default', () => {
    const module = defineModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: ({ input }) => input
    });

    expect(module).toBeInstanceOf(PredictModule);
    expect(module.strategy).toBe('Predict');
  });

  it('should create PredictModule when strategy is explicitly set', () => {
    const module = defineModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: ({ input }) => input,
      strategy: 'Predict'
    });

    expect(module).toBeInstanceOf(PredictModule);
    expect(module.strategy).toBe('Predict');
  });

  it('should throw error for unimplemented strategies', () => {
    expect(() => defineModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: ({ input }) => input,
      strategy: 'ChainOfThought'
    })).toThrow('Strategy ChainOfThought not yet implemented');

    expect(() => defineModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: ({ input }) => input,
      strategy: 'ReAct'
    })).toThrow('Strategy ReAct not yet implemented');
  });

  it('should throw error for unknown strategies', () => {
    expect(() => defineModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'string' }]
      },
      promptTemplate: ({ input }) => input,
      strategy: 'Unknown' as any
    })).toThrow('Unknown strategy: Unknown');
  });
});
