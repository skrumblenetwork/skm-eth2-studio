## Skrumble ASTwalker
`skm-astwalker` module walks through solidity AST and spits out AST nodes.

#### Example
```ts
import { AstWalker } from "skm-astwalker";

const astWalker = new AstWalker();
astWalker.on("node", node => {
  if (node.nodeType === "ContractDefinition") {
    checkContract(st, node);
  }

  if (node.nodeType === "PragmaDirective") {
    checkProgramDirective(st, node);
  }
});
```
For more examples see `tests`.
