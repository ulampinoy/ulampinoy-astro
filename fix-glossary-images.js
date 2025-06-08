import fs from 'fs';
import path from 'path';

const glossaryDir = path.join(new URL(import.meta.url).pathname, '../src/content/glossary');

// Get all markdown files in glossary directory
const files = fs.readdirSync(glossaryDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
  const filePath = path.join(glossaryDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace image paths from /images/glossary/ to /images/
  const updatedContent = content.replace(/image:\s*\/images\/glossary\//g, 'image: /images/');
  
  // Write back the updated content
  fs.writeFileSync(filePath, updatedContent);
});

console.log('Image paths have been updated in all glossary files.');
