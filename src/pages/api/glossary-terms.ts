import { getCollection } from 'astro:content';

export async function GET() {
  try {
    const glossaryEntries = await getCollection('glossary');
    
    // Map to the format we need
    const terms = glossaryEntries.map(entry => ({
      term: entry.data.title,
      slug: `/glossary/${entry.slug}`
    }));
    
    return new Response(JSON.stringify(terms), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching glossary terms:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch glossary terms' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
