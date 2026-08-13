/* Vite's `?raw` import suffix, used to inline a stylesheet into <noscript>. */
declare module "*.css?raw" {
  const content: string;
  export default content;
}
