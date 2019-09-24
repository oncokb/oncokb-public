declare module '*.json' {
  const value: any;
  export default value;
}
// allow these file patterns to be imported
declare module '*.scss';
declare module '*.jpg';
declare module '*.ppt';
declare module '*.pdf';
declare module '*.png' {
  const value: any;
  export default value;
}

declare module 'availity-reactstrap-validation';
declare module 'react-responsive-tabs';
