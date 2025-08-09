declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module 'found/RouterContext';
declare module './views/mut-annot-viewer' {
  const value: any;
  export default value;
}
declare module './views/mut-annot-viewer/*' {
  const value: any;
  export default value;
}
