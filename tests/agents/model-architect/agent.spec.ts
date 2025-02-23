import { Agent } from "../../../agents/model-architect/index.ts";
import { AgentConfig } from "../../../agents/model-architect/src/types/index.ts";

import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.218.0/assert/mod.ts";

Deno.test("Agent constructor", () => {
  const config: AgentConfig = {
    mode: "autonomous",
    task: "image_classification"
  };
  const agent = new Agent(config);
    assertInstanceOf(agent, Agent);
  });

Deno.test("run with image classification", async () => {
  const config: AgentConfig = {
    mode: "autonomous",
    task: "image_classification",
    constraints: {
      maxParams: 1000000,
      quantization: {
        precision: "fp16"
      }
    }
  };
  const agent = new Agent(config);
  const architecture = await agent.run();
  
    // Verify architecture structure
    assertEquals(typeof architecture, "object");
    assertEquals(Array.isArray(architecture.layers), true);
    assertEquals(Array.isArray(architecture.inputShape), true);
    assertEquals(Array.isArray(architecture.outputShape), true);
    assertEquals(architecture.inputShape, [224, 224, 3]);
    assertEquals(architecture.outputShape, [1000]);
  });

Deno.test("run with text classification", async () => {
  const config: AgentConfig = {
    mode: "autonomous",
    task: "text_classification"
  };
  const agent = new Agent(config);
  const architecture = await agent.run();
  
    // Verify architecture structure
    assertEquals(typeof architecture, "object");
    assertEquals(Array.isArray(architecture.layers), true);
    assertEquals(Array.isArray(architecture.inputShape), true);
    assertEquals(Array.isArray(architecture.outputShape), true);
    assertEquals(architecture.inputShape, [512]);
    assertEquals(architecture.outputShape, [2]);
  });

Deno.test("run with unsupported task", async () => {
  const config: AgentConfig = {
    mode: "autonomous",
    task: "unsupported_task"
  };
  const agent = new Agent(config);
    try {
      await agent.run();
      throw new Error("Should have thrown an error");
    } catch (error) {
      assertEquals(error.message, "Unsupported task type: unsupported_task");
    }
  });
