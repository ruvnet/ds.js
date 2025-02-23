import { MIPROv2Module } from '../../examples/MIPROv2/mipro-v2-pipeline';
import { DummyLM } from '../../src/lm/dummy';

// Mock DummyLM
jest.mock('../../src/lm/dummy', () => ({
  DummyLM: jest.fn().mockImplementation(() => ({
    generate: jest.fn().mockResolvedValue('Generated test output')
  }))
}));

describe('MIPROv2Module', () => {
  let module: MIPROv2Module;
  let dummyLM: DummyLM;

  beforeEach(() => {
    jest.clearAllMocks();
    dummyLM = new DummyLM();
    module = new MIPROv2Module(dummyLM);
  });

  describe('Initialization', () => {
    it('should create module with DummyLM', () => {
      expect(DummyLM).toHaveBeenCalled();
    });
  });

  describe('run', () => {
    it('should process input without context', async () => {
      const input = { text: 'Test input' };
      const result = await module.run(input);

      expect(result).toEqual({
        result: 'Generated test output',
        confidence: expect.any(Number)
      });
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should process input with context', async () => {
      const input = {
        text: 'Test input',
        context: 'Test context'
      };
      const result = await module.run(input);

      expect(result).toEqual({
        result: 'Generated test output',
        confidence: expect.any(Number)
      });
    });

    it('should handle model generation error', async () => {
      // Mock DummyLM to throw error
      (dummyLM.generate as jest.Mock).mockRejectedValue(new Error('Model error'));

      const input = { text: 'Test input' };
      const result = await module.run(input);

      expect(result).toEqual({
        result: 'Error processing input',
        confidence: 0
      });
    });
  });

  describe('confidence calculation', () => {
    it('should calculate low confidence for short output', async () => {
      (dummyLM.generate as jest.Mock).mockResolvedValue('Short');

      const result = await module.run({ text: 'Test' });
      expect(result.confidence).toBe(0.3);
    });

    it('should calculate high confidence for long output', async () => {
      const longOutput = 'A'.repeat(150);
      (dummyLM.generate as jest.Mock).mockResolvedValue(longOutput);

      const result = await module.run({ text: 'Test' });
      expect(result.confidence).toBe(0.7);
    });

    it('should calculate medium confidence for average output', async () => {
      const mediumOutput = 'A'.repeat(50);
      (dummyLM.generate as jest.Mock).mockResolvedValue(mediumOutput);

      const result = await module.run({ text: 'Test' });
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.confidence).toBeLessThan(0.7);
    });
  });
});
