// Shim for libraries that still require Ramda's deprecated
// "src" entry point. Re-export the function from the ESM build
// so tooling can resolve it without touching the unexported
// internal module.
import forEach from 'ramda/es/forEach.js';
export default forEach;
