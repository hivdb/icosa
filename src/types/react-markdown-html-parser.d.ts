declare module 'react-markdown/plugins/html-parser' {
  const htmlParser: (options?: any) => (tree: any, props: any) => any;
  export default htmlParser;
}
