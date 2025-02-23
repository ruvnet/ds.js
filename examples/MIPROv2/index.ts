import { MIPROv2Module } from './mipro-v2-pipeline';
import { DummyLM } from '../../src/lm/dummy';

async function main() {
  // Initialize model and module
  const model = new DummyLM();
  await model.init();
  const module = new MIPROv2Module(model);

  // Example 1: Basic usage
  console.log("\nExample 1: Basic usage");
  const basicResult = await module.run({
    text: "What is machine learning?"
  });
  console.log("Input: Basic question about ML");
  console.log("Output:", basicResult);

  // Example 2: With context
  console.log("\nExample 2: With context");
  const contextResult = await module.run({
    text: "What is machine learning?",
    context: "Explaining AI concepts to beginners"
  });
  console.log("Input: ML question with beginner context");
  console.log("Output:", contextResult);

  // Example 3: Error handling
  console.log("\nExample 3: Error handling");
  try {
    // Force an error by passing invalid input
    const errorResult = await module.run({
      text: ""
    });
    console.log("Output:", errorResult);
  } catch (error) {
    console.log("Error handled gracefully:", error);
  }

  // Example 4: Different confidence levels
  console.log("\nExample 4: Different confidence levels");
  const shortResult = await module.run({
    text: "Short"
  });
  console.log("Short input confidence:", shortResult.confidence);

  const longResult = await module.run({
    text: "A much longer input that should result in a higher confidence score due to the length of the generated response"
  });
  console.log("Long input confidence:", longResult.confidence);
}

if (require.main === module) {
  main().catch(console.error);
}
