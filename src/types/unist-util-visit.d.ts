declare module 'unist-util-visit' {
  export function visit(tree: any, test: any, visitor: (node: any, index?: number, parent?: any) => void): void;
  export default visit;
}

