declare module '*.json' {
  const value: any;
  export default value;
}
// allow these file patterns to be imported
declare module '*.scss';
declare module '*.png' {
  const value: any;
  export default value;
}
