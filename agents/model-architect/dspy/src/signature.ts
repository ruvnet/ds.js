export enum FieldType {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Object = "object",
  Array = "array"
}

export interface Field {
  type: FieldType;
  description?: string;
  required?: boolean;
}

export interface InputSignature {
  [key: string]: Field;
}

export interface OutputSignature {
  [key: string]: Field;
}

export interface ModuleSignature {
  name: string;
  description?: string;
  inputs: InputSignature;
  outputs: OutputSignature;
}

export interface Signature {
  name: string;
  description?: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

export function input(type: FieldType, description?: string, required = true): Field {
  return { type, description, required };
}

export function output(type: FieldType, description?: string): Field {
  return { type, description };
}

export function signature(name: string, description: string, inputs: InputSignature, outputs: OutputSignature): ModuleSignature {
  return { name, description, inputs, outputs };
}

export function validateInput(signature: InputSignature, input: any): boolean {
  for (const [key, field] of Object.entries(signature)) {
    if (field.required && !(key in input)) {
      return false;
    }
    if (key in input && typeof input[key] !== field.type) {
      return false;
    }
  }
  return true;
}

export function validateOutput(signature: OutputSignature, output: any): boolean {
  for (const [key, field] of Object.entries(signature)) {
    if (!(key in output)) {
      return false;
    }
    if (typeof output[key] !== field.type) {
      return false;
    }
  }
  return true;
}
