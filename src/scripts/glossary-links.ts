// Extend the Window interface to include our custom function
declare global {
  interface Window {
    linkGlossaryTerms: () => Promise<void>;
  }
}

// Define types for our glossary terms
interface GlossaryTerm {
  term: string;
  slug: string;
}

// Define the portion type for the replace function
interface Portion {
  node: Node;
  text: string;
}

// Track which terms have been linked in this article
const linkedTerms = new Set<string>();

// Get all glossary terms from the page
const linkGlossaryTerms = async (): Promise<void> => {
  try {
    // Fetch glossary terms from the API
    const response = await fetch('/api/glossary-terms');
    if (!response.ok) throw new Error('Failed to fetch glossary terms');
    
    const terms: GlossaryTerm[] = await response.json();
    
    // Sort terms by length (longest first) to handle nested terms
    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);
    
    // Get all text nodes in the article content
    const article = document.querySelector('article');
    if (!article) return;
    
    // Process each term
    for (const { term, slug } of sortedTerms) {
      if (term.length < 4) continue; // Skip short terms
      
      // Skip if we've already linked this term
      const termKey = term.toLowerCase();
      if (linkedTerms.has(termKey)) continue;
      
      // Create a regex to match the term as a whole word
      const regex = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'i'); // Remove 'g' flag
      
      // Find and replace text in the article
      findAndReplaceDOMText({
        target: article as HTMLElement,
        find: regex,
        replace: (portion: Portion) => {
          // Skip if already inside a link or code block
          const parentElement = portion.node.parentElement as HTMLElement;
          if (parentElement?.closest('a, code, pre, .no-glossary, [data-glossary-term]')) {
            return portion.text;
          }
          
          // Mark this term as linked
          linkedTerms.add(termKey);
          
          // Create the link
          const link = document.createElement('a');
          link.href = slug;
          link.className = 'text-amber-600 hover:text-amber-700 hover:underline font-medium';
          link.setAttribute('data-glossary-term', '');
          link.textContent = portion.text;
          
          // Return the link for the first match, text for others
          return link;
        }
      });
    }
  } catch (error) {
    console.error('Error linking glossary terms:', error);
  }
};

// Make the function available globally
if (typeof window !== 'undefined') {
  window.linkGlossaryTerms = linkGlossaryTerms;
}

export default linkGlossaryTerms;

// Interface for findAndReplaceDOMText options
interface FindAndReplaceOptions {
  target: HTMLElement;
  find: RegExp | string;
  replace: (portion: Portion) => string | Node;
}

// Helper function to find and replace text in the DOM
function findAndReplaceDOMText(options: FindAndReplaceOptions): void {
  const { target, find, replace } = options;
  const regex = find instanceof RegExp ? find : new RegExp(find, 'g');
  
  // Create a tree walker to find all text nodes
  const walker = document.createTreeWalker(
    target,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node: Node): number => {
        // Skip if parent is a script, style, or has no-glossary class
        const parent = node.parentElement;
        if (!parent || 
            parent.tagName === 'SCRIPT' || 
            parent.tagName === 'STYLE' ||
            parent.classList.contains('no-glossary')) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Only accept nodes with text that matches our regex
        return regex.test((node as Text).nodeValue || '') ? 
          NodeFilter.FILTER_ACCEPT : 
          NodeFilter.FILTER_SKIP;
      }
    },
    // @ts-ignore - TypeScript has incorrect type definitions for createTreeWalker
    false
  );
  
  // Collect all matching text nodes
  const textNodes: Text[] = [];
  let currentNode: Text | null = null;
  while ((currentNode = walker.nextNode() as Text | null)) {
    if (currentNode) {
      textNodes.push(currentNode);
    }
  }
  
  // Process each matching node
  for (const node of textNodes) {
    const text = node.nodeValue || '';
    const matches = Array.from(text.matchAll(regex));
    if (!matches.length) continue;
    
    let lastIndex = 0;
    const fragment = document.createDocumentFragment();
    
    for (const match of matches) {
      const matchIndex = match.index || 0;
      const matchText = match[0];
      const matchEnd = matchIndex + matchText.length;
      
      // Add text before the match
      if (matchIndex > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, matchIndex)));
      }
      
      // Add the replacement
      const replacement = replace({
        node: node,
        text: matchText
      });
      
      if (typeof replacement === 'string') {
        fragment.appendChild(document.createTextNode(replacement));
      } else if (replacement instanceof Node) {
        fragment.appendChild(replacement);
      }
      
      lastIndex = matchEnd;
    }
    
    // Add any remaining text after the last match
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    
    // Replace the original node with the new content
    node.parentNode?.replaceChild(fragment, node);
  }
}

// Initialize when the DOM is loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    linkGlossaryTerms();
  });
}
