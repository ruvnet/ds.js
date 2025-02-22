import { isValidFieldDefinition, FieldDefinition } from '../../src/core/signature';

describe('Field Definition Validation', () => {
  it('should validate correct field definitions', () => {
    const validField: FieldDefinition = {
      name: 'testField',
      type: 'string',
      description: 'A test field'
    };
    expect(isValidFieldDefinition(validField)).toBe(true);
  });

  it('should reject invalid field definitions', () => {
    const invalidField = {
      name: 'testField',
      type: 'invalid_type'
    };
    expect(isValidFieldDefinition(invalidField)).toBe(false);
  });

  it('should handle missing optional fields', () => {
    const minimalField: FieldDefinition = {
      name: 'testField',
      type: 'number'
    };
    expect(isValidFieldDefinition(minimalField)).toBe(true);
  });

  it('should validate all valid types', () => {
    const types: Array<'string' | 'number' | 'boolean' | 'object'> = ['string', 'number', 'boolean', 'object'];
    
    types.forEach(type => {
      const field: FieldDefinition = {
        name: 'test',
        type
      };
      expect(isValidFieldDefinition(field)).toBe(true);
    });
  });

  it('should reject null or undefined fields', () => {
    expect(isValidFieldDefinition(null)).toBe(false);
    expect(isValidFieldDefinition(undefined)).toBe(false);
  });

  it('should reject fields with missing required properties', () => {
    expect(isValidFieldDefinition({ type: 'string' })).toBe(false);
    expect(isValidFieldDefinition({ name: 'test' })).toBe(false);
  });

  it('should validate fields with all properties', () => {
    const fullField: FieldDefinition = {
      name: 'testField',
      type: 'string',
      description: 'test description',
      required: true
    };
    expect(isValidFieldDefinition(fullField)).toBe(true);
  });

  it('should reject fields with invalid property types', () => {
    expect(isValidFieldDefinition({ 
      name: 123,
      type: 'string' 
    })).toBe(false);

    expect(isValidFieldDefinition({ 
      name: 'test',
      type: 'string',
      description: 123
    })).toBe(false);

    expect(isValidFieldDefinition({ 
      name: 'test',
      type: 'string',
      required: 'yes'
    })).toBe(false);
  });
});
