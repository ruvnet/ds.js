A detailed technical specification and functional overview of the DSPy capabilities and SDK that will be ported to DSPy.ts. This document is intended to guide development by describing all core features, interfaces, and integration points that the original DSPy (Declarative Self‑Improving Python) library provides and how they map to the JavaScript/TypeScript environment in DSPy.ts.

**DSPy Overview:**
DSPy is a framework originally written in Python for declaratively composing and optimizing language model (LM) pipelines. It abstracts prompt engineering into modular, self‑improving components. The goal of the DSPy.ts port is to bring these capabilities to JavaScript, enabling seamless in‑browser or Node.js deployment with integrations for ONNX Runtime Web and JS‑PyTorch.

**DSPy.ts Objectives:**
- **Declarative DSL:** Provide a domain‑specific language (DSL) for defining LM modules with explicit input/output signatures.
- **Signature Definitions:**
  Each module in DSPy defines its expected inputs and outputs using a typed schema. In DSPy.ts, these will be expressed as TypeScript interfaces or JSON schemas:
  - *InputField* and *OutputField* definitions (e.g., field name, type, description).
- **Execution Engine:**
  DSPy.ts will include a pipeline executor that:
  - Chains module calls sequentially or (in future versions) in parallel/conditional flows.
- **Abstract LM Driver Interface:**
  DSPy.ts will define an interface (e.g. `LMDriver`) that declares a `generate(prompt: string): Promise<string>` method. This allows the DSPy.ts pipeline to remain decoupled from specific LM implementations.

- **JS‑PyTorch Integration:**
  For scenarios requiring custom tensor operations or dynamic computation (e.g., for gradient tracking or auxiliary neural modules), DSPy.ts will also include a `TorchModel` driver that wraps JS‑PyTorch operations.

- **Custom Neural Modules:**
  DSPy.ts modules can optionally incorporate neural computation steps (using JS‑PyTorch) to post‑process LM outputs or to compute intermediate tensor representations.

- **Configuration API:**
  Global functions (such as `configureLM(lm: LMDriver)` and `getLM()`) allow the DSPy.ts user to set up and switch between different LM drivers seamlessly.

- **Extensible DSL:**
  The DSL is designed to be open to future module types. Developers can extend the base module class to add new strategies without modifying core DSPy.ts functionality.

- **TorchModel:**
  (Prototype) Wraps JS‑PyTorch for neural tensor operations, enabling custom neural processing in DSPy.ts.

This technical specification provides a comprehensive overview of DSPy's capabilities and functions that will be ported to DSPy.ts. It outlines the modular DSL, pipeline orchestration, LM integration, self‑improving prompt strategies, and utility support that form the core of DSPy. This document is intended to serve as the blueprint for the DSPy.ts development effort, ensuring that every aspect of the original DSPy functionality is preserved, extended, and adapted to modern JavaScript/TypeScript environments.

This specification is designed to guide the development team in porting DSPy to DSPy.ts, ensuring a robust, extensible, and performant JavaScript SDK for declarative self‑improving LM pipelines.
