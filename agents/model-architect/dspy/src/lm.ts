export abstract class LMDriver {
  abstract generate(prompt: string): Promise<string>;
}

let currentLM: LMDriver | null = null;

export function configureLM(lm: LMDriver) {
  currentLM = lm;
}

export function getLM(): LMDriver {
  if (!currentLM) {
    throw new Error("LM not configured. Call configureLM first.");
  }
  return currentLM;
}
