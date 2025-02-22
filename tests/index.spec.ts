import { configureLM, getLM, LMError } from '../src/index';
import { DummyLM } from '../src/lm/dummy';

describe('Global LM Configuration', () => {
  afterEach(() => {
    // Reset global LM after each test
    configureLM(null as any);
  });

  it('should throw error when LM is not configured', () => {
    expect(() => getLM()).toThrow(LMError);
  });

  it('should allow configuring and retrieving LM', async () => {
    const dummyLM = new DummyLM();
    await dummyLM.init();
    
    configureLM(dummyLM);
    expect(getLM()).toBe(dummyLM);
  });

  it('should work with custom responses', async () => {
    const dummyLM = new DummyLM(new Map([
      ['test', 'response']
    ]));
    await dummyLM.init();
    
    configureLM(dummyLM);
    const lm = getLM();
    const response = await lm.generate('test');
    expect(response).toBe('response');
  });
});
