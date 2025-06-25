// Extend the Window interface to include our custom function
declare global {
  interface Window {
    linkGlossaryTerms: () => void;
  }
}

export {};
