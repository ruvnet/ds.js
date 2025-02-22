import { DummyLM } from '../../src/lm/dummy';
import { LMError } from '../../src/lm/base';

describe('DummyLM', () => {
  let dummyLM: DummyLM;

  beforeEach(() => {
    dummyLM = new DummyLM();
  });

  it('should require initialization before use', async () => {
    await expect(dummyLM.generate('test')).rejects.toThrow(LMError);
    await dummyLM.init();
    await expect(dummyLM.generate('test')).resolves.toBeDefined();
  });

  it('should return custom responses when defined', async () => {
    const customResponses = new Map([
      ['test prompt', 'test response']
    ]);
    dummyLM = new DummyLM(customResponses);
    await dummyLM.init();

    const response = await dummyLM.generate('test prompt');
    expect(response).toBe('test response');
  });

  it('should generate default response for unknown prompts', async () => {
    await dummyLM.init();
    const response = await dummyLM.generate('unknown prompt');
    expect(response).toContain('unknown prompt');
    expect(response).toContain('DummyLM response');
  });

  it('should respect generation options', async () => {
    await dummyLM.init();
    const response = await dummyLM.generate('test', { maxTokens: 50 });
    expect(response).toContain('50 tokens');
  });

  it('should allow adding and clearing custom responses', async () => {
    await dummyLM.init();
    dummyLM.setResponse('custom prompt', 'custom response');
    
    let response = await dummyLM.generate('custom prompt');
    expect(response).toBe('custom response');

    dummyLM.clearResponses();
    response = await dummyLM.generate('custom prompt');
    expect(response).not.toBe('custom response');
    expect(response).toContain('DummyLM response');
  });

  it('should cleanup properly', async () => {
    await dummyLM.init();
    await dummyLM.cleanup();
    await expect(dummyLM.generate('test')).rejects.toThrow(LMError);
  });
});
