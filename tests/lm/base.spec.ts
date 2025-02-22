import { LMError } from '../../src/lm/base';

describe('LM Error', () => {
  it('should create error with cause', () => {
    const cause = new Error('Original error');
    const lmError = new LMError('LM failed', cause);
    
    expect(lmError.message).toBe('LM failed');
    expect(lmError.cause).toBe(cause);
    expect(lmError.name).toBe('LMError');
  });

  it('should create error without cause', () => {
    const lmError = new LMError('LM failed');
    
    expect(lmError.message).toBe('LM failed');
    expect(lmError.cause).toBeUndefined();
    expect(lmError.name).toBe('LMError');
  });
});
