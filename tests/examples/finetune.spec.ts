import { TextGeneratorModule, RewardModule, GRPOOptimizer, TrainingManager } from '../../examples/finetune';

describe('Fine-tuning Components', () => {
  describe('TextGeneratorModule', () => {
    let module: TextGeneratorModule;

    beforeEach(() => {
      module = new TextGeneratorModule({
        name: 'TestGenerator',
        promptTemplate: (input) => `Generate: ${input.text}`
      });
    });

    test('should generate valid output', async () => {
      const input = { text: 'Explain quantum computing' };
      const output = await module.run(input);

      expect(output).toHaveProperty('generated');
      expect(output).toHaveProperty('quality');
      expect(typeof output.generated).toBe('string');
      expect(typeof output.quality).toBe('number');
      expect(output.quality).toBeGreaterThanOrEqual(0);
      expect(output.quality).toBeLessThanOrEqual(1);
    });

    test('should handle unknown topics gracefully', async () => {
      const input = { text: 'Explain something completely unknown' };
      const output = await module.run(input);

      expect(output.quality).toBeLessThan(0.5);
      expect(output.generated).toContain("don't have enough knowledge");
    });

    test('should calculate valid log probabilities', async () => {
      const output = {
        generated: 'Quantum computing uses qubits',
        quality: 0.8
      };

      const logProbs = await module.getLogProbabilities(output);
      expect(Array.isArray(logProbs)).toBe(true);
      expect(logProbs.length).toBeGreaterThan(0);
      logProbs.forEach(prob => {
        expect(isFinite(prob)).toBe(true);
      });
    });

    test('should update weights within bounds', async () => {
      const gradients = new Array(10).fill(0.1);
      await module.updateWeights(gradients);

      // Access private weights for testing
      const weights = (module as any).weights;
      Object.values(weights).forEach((weight) => {
        expect(typeof weight).toBe('number');
        if (typeof weight === 'number') {
          expect(weight).toBeGreaterThanOrEqual(0.1);
          expect(weight).toBeLessThanOrEqual(0.95);
        }
      });
    });
  });

  describe('RewardModule', () => {
    let module: RewardModule;

    beforeEach(() => {
      module = new RewardModule({
        name: 'TestReward',
        promptTemplate: (input) => `Evaluate: ${input.generated}`
      });
    });

    test('should calculate valid rewards', async () => {
      const input = {
        generated: 'A high quality explanation of quantum computing using qubits and quantum mechanics',
        quality: 0.9
      };

      const output = await module.run(input);
      expect(output).toHaveProperty('reward');
      expect(output).toHaveProperty('feedback');
      expect(typeof output.reward).toBe('number');
      expect(typeof output.feedback).toBe('string');
      expect(output.reward).toBeGreaterThanOrEqual(0);
      expect(output.reward).toBeLessThanOrEqual(1);
    });

    test('should penalize low quality inputs', async () => {
      const input = {
        generated: 'Short text',
        quality: 0.3
      };

      const output = await module.run(input);
      expect(output.reward).toBeLessThan(0.5);
    });

    test('should reward diverse vocabulary', async () => {
      const input = {
        generated: 'A comprehensive explanation with diverse vocabulary and complex concepts',
        quality: 0.8
      };

      const output = await module.run(input);
      expect(output.reward).toBeGreaterThan(0.6);
    });
  });

  describe('GRPOOptimizer', () => {
    let optimizer: GRPOOptimizer;
    let module: TextGeneratorModule;

    beforeEach(() => {
      optimizer = new GRPOOptimizer({
        learningRate: 0.01,
        epochs: 2,
        miniBatchSize: 2
      });

      module = new TextGeneratorModule({
        name: 'TestGenerator',
        promptTemplate: (input) => `Generate: ${input.text}`
      });
    });

    test('should update model and return valid metrics', async () => {
      const outputs = [
        { generated: 'Test output 1', quality: 0.8 },
        { generated: 'Test output 2', quality: 0.7 }
      ];

      const rewards = [
        { reward: 0.8, feedback: 'Good' },
        { reward: 0.7, feedback: 'Okay' }
      ];

      const metrics = await optimizer.update(module, outputs, rewards);

      expect(metrics).toHaveProperty('batchId');
      expect(metrics).toHaveProperty('avgReward');
      expect(metrics).toHaveProperty('policyLoss');
      expect(metrics).toHaveProperty('valueLoss');
      expect(metrics.avgReward).toBeGreaterThan(0);
      expect(isFinite(metrics.policyLoss)).toBe(true);
    });

    test('should handle empty batch gracefully', async () => {
      const metrics = await optimizer.update(module, [], []);
      expect(metrics.avgReward).toBe(0);
      expect(metrics.policyLoss).toBe(0);
      expect(metrics.valueLoss).toBe(0);
    });
  });

  describe('TrainingManager', () => {
    let manager: TrainingManager;
    let onBatchComplete: jest.Mock;

    beforeEach(() => {
      const module = new TextGeneratorModule({
        name: 'TestGenerator',
        promptTemplate: (input) => `Generate: ${input.text}`
      });

      const rewardModule = new RewardModule({
        name: 'TestReward',
        promptTemplate: (input) => `Evaluate: ${input.generated}`
      });

      const optimizer = new GRPOOptimizer({
        learningRate: 0.01,
        epochs: 2
      });

      onBatchComplete = jest.fn();

      manager = new TrainingManager({
        module,
        optimizer,
        rewardModule,
        onBatchComplete
      });
    });

    test('should process training batch successfully', async () => {
      const batch = [
        { text: 'Test input 1' },
        { text: 'Test input 2' }
      ];

      const metrics = await manager.trainOnBatch(batch);

      expect(metrics).toBeDefined();
      expect(onBatchComplete).toHaveBeenCalled();
      expect(metrics.avgReward).toBeGreaterThanOrEqual(0);
      expect(metrics.avgReward).toBeLessThanOrEqual(1);
    });

    test('should handle single item batch', async () => {
      const batch = [{ text: 'Single test input' }];
      const metrics = await manager.trainOnBatch(batch);

      expect(metrics).toBeDefined();
      expect(onBatchComplete).toHaveBeenCalled();
    });
  });
});
