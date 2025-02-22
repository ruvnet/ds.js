import { PredictModule } from '../../src/modules/predict';
import { configureLM } from '../../src/index';
import { DummyLM } from '../../src/lm/dummy';

describe('PredictModule', () => {
  beforeAll(async () => {
    // Configure and initialize DummyLM
    const dummyLM = new DummyLM(new Map([
      ['{"name":"test"}', '{"greeting":"Hello, test!"}']
    ]));
    await dummyLM.init(); // Initialize the LM
    configureLM(dummyLM);
  });

  it('should create module with correct configuration', () => {
    const module = new PredictModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'name', type: 'string' }],
        outputs: [{ name: 'greeting', type: 'string' }]
      },
      promptTemplate: ({ name }) => JSON.stringify({ name })
    });

    expect(module.name).toBe('TestModule');
    expect(module.strategy).toBe('Predict');
  });

  it('should validate input fields', async () => {
    const module = new PredictModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'name', type: 'string', required: true }],
        outputs: [{ name: 'greeting', type: 'string' }]
      },
      promptTemplate: ({ name }) => JSON.stringify({ name })
    });

    await expect(module.run({} as any))
      .rejects.toThrow('Missing required input field: name');
  });

  it('should run successfully with valid input', async () => {
    const module = new PredictModule({
      name: 'TestModule',
      signature: {
        inputs: [{ name: 'name', type: 'string' }],
        outputs: [{ name: 'greeting', type: 'string' }]
      },
      promptTemplate: ({ name }) => JSON.stringify({ name })
    });

    const result = await module.run({ name: 'test' });
    expect(result.greeting).toBe('Hello, test!');
  });
});
