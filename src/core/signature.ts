/**
 * Defines the structure for input and output fields of a DSPy.ts module.
 */
export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  description?: string;
  required?: boolean;
}

/**
 * The signature interface describes the expected input and output fields for a module.
 */
export interface Signature {
  inputs: FieldDefinition[];
  outputs: FieldDefinition[];
}

/**
 * Type guard to validate field definitions
 */
export function isValidFieldDefinition(field: any): field is FieldDefinition {
  if (!field || typeof field !== 'object') {
    return false;
  }

  // Check required properties
  if (typeof field.name !== 'string') {
    return false;
  }

  // Validate type is one of the allowed values
  if (!['string', 'number', 'boolean', 'object'].includes(field.type)) {
    return false;
  }

  // Optional properties type checking
  if (field.description !== undefined && typeof field.description !== 'string') {
    return false;
  }

  if (field.required !== undefined && typeof field.required !== 'boolean') {
    return false;
  }

  return true;
}
