import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';

type TextNode = Node & { value: string; };
type LinkNode = Node & { url: string; children: TextNode[]; data?: any; };

interface GlossaryTerm {
  term: string;
  slug: string;
}

export default function remarkGlossaryLinks(terms: GlossaryTerm[]) {
  return (tree: Node) => {
    // Sort terms by length (longest first) to handle nested terms
    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);

    // First pass: collect all text nodes that need to be processed
    const textNodes: { node: TextNode; parent: Parent }[] = [];
    
    visit(tree, 'text', (node: TextNode, index: number, parent: Parent) => {
      // Skip if parent is a link or code block
      if (
        parent &&
        (parent.type === 'link' || 
         parent.type === 'code' ||
         (parent.type === 'element' && parent.tagName === 'code') ||
         (parent.type === 'element' && parent.tagName === 'a'))
      ) {
        return;
      }

      // Check if the text contains any of our glossary terms
      const hasTerm = sortedTerms.some(({ term }) => 
        node.value.toLowerCase().includes(term.toLowerCase())
      );

      if (hasTerm) {
        textNodes.push({ node, parent });
      }
    });

    // Process each text node that contains glossary terms
    for (const { node, parent } of textNodes) {
      let text = node.value;
      const nodes: (TextNode | LinkNode)[] = [];
      let lastIndex = 0;

      // Process the text to find and replace glossary terms with links
      for (const { term, slug } of sortedTerms) {
        if (term.length < 4) continue; // Skip short terms

        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        let match;

        while ((match = regex.exec(text)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            nodes.push({
              type: 'text',
              value: text.substring(lastIndex, match.index)
            } as TextNode);
          }

          // Add the link
          nodes.push({
            type: 'link',
            url: slug,
            children: [{
              type: 'text',
              value: match[0]
            }],
            data: {
              hProperties: {
                className: 'text-amber-600 hover:text-amber-700 hover:underline font-medium',
                'data-glossary-term': ''
              }
            }
          } as unknown as LinkNode);

          lastIndex = match.index + match[0].length;
        }
      }

      // Add remaining text
      if (lastIndex < text.length) {
        nodes.push({
          type: 'text',
          value: text.substring(lastIndex)
        } as TextNode);
      }

      // Replace the original node with the new nodes
      if (nodes.length > 0) {
        const parentChildren = parent.children as Node[];
        const index = parentChildren.indexOf(node);
        if (index !== -1) {
          parentChildren.splice(index, 1, ...nodes as Node[]);
        }
      }
    }
  };
}
