export interface LMDriver {
  generate(prompt: string): Promise<string>;
}
