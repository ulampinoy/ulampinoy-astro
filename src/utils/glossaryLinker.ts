import type { CollectionEntry } from 'astro:content';

// Cache for glossary terms to avoid repeated file reads
let glossaryTerms: { term: string; slug: string }[] | null = null;

/**
 * Get all glossary terms from the content collection
 */
async function getGlossaryTerms() {
  if (glossaryTerms) return glossaryTerms;
  
  try {
    const glossaryEntries = await import.meta.glob(
      '/src/content/glossary/**/*.md',
      { eager: true }
    );

    const terms = Object.entries(glossaryEntries).map(([path, entry]) => {
      // Extract the slug from the path
      const slug = path
        .replace('/src/content/glossary/', '')
        .replace('/index.md', '')
        .replace('.md', '');
      
      return {
        term: (entry as any).frontmatter.title,
        slug: `/glossary/${slug}`,
      };
    });

    // Sort by term length (longest first) to handle nested terms
    terms.sort((a, b) => b.term.length - a.term.length);
    
    glossaryTerms = terms;
    return terms;
  } catch (error) {
    console.error('Error loading glossary terms:', error);
    return [];
  }
}

/**
 * Process content to add links to glossary terms
 */
export async function processGlossaryLinks(html: string): Promise<string> {
  const glossaryTerms = await getGlossaryTerms();
  if (glossaryTerms.length === 0) return html;

  // Skip processing if the content is empty
  if (!html || typeof html !== 'string') return html;

  // Create a temporary container to parse the HTML
  const container = document.createElement('div');
  container.innerHTML = html;

  // Skip code blocks and preformatted text
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip text nodes inside code blocks, pre, or script tags
        if (node.parentElement?.closest('code, pre, script, style, a')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    },
    false
  );

  // Collect all text nodes
  let node;
  while ((node = walker.nextNode() as Text)) {
    if (node.nodeValue?.trim()) {
      textNodes.push(node);
    }
  }

  // Process each glossary term
  for (const { term, slug } of glossaryTerms) {
    // Skip very short terms to avoid false positives
    if (term.length < 4) continue;

    const regex = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
    
    // Process each text node
    for (const textNode of textNodes) {
      if (!textNode.nodeValue) continue;
      
      // Skip if the text doesn't contain the term (case-insensitive)
      if (!textNode.nodeValue.toLowerCase().includes(term.toLowerCase())) continue;
      
      // Create a document fragment to hold the new nodes
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;
      
      // Process all matches in this text node
      while ((match = regex.exec(textNode.nodeValue)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(textNode.nodeValue.substring(lastIndex, match.index)));
        }
        
        // Create the link for the match
        const link = document.createElement('a');
        link.href = slug;
        link.className = 'text-amber-600 hover:text-amber-700 hover:underline font-medium';
        link.setAttribute('data-glossary-term', '');
        link.textContent = match[0];
        
        fragment.appendChild(link);
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text after the last match
      if (lastIndex < textNode.nodeValue.length) {
        fragment.appendChild(document.createTextNode(textNode.nodeValue.substring(lastIndex)));
      }
      
      // Replace the original text node with the new nodes
      if (textNode.parentNode) {
        textNode.parentNode.replaceChild(fragment, textNode);
      }
    }
  }

  return container.innerHTML;
}
