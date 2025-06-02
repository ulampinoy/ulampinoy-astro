#!/bin/bash

# Directory containing markdown files
BLOG_DIR="src/content/blog"

# Process each markdown file
for file in "$BLOG_DIR"/*.md; do
    echo "Processing: $file"
    
    # Create temporary file
    temp_file="${file}.tmp"
    
    # Process the file
    awk '
    BEGIN { 
        print "---"
        in_frontmatter = 0
        in_content = 0
    }
    
    # Start of frontmatter
    /^---/ {
        if (in_frontmatter) {
            in_frontmatter = 0
            in_content = 1
            print "author: \"UlamPinoy\""
            print "draft: false"
            print "---"
        } else {
            in_frontmatter = 1
        }
        next
    }
    
    # Process frontmatter
    in_frontmatter && /^title:/ { printf "title: \"%s\"\n", substr($0, 7); next }
    in_frontmatter && /^description:/ { printf "description: \"%s\"\n", substr($0, 13); next }
    in_frontmatter && /^whetter:/ { printf "whetter: \"%s\"\n", substr($0, 9); next }
    in_frontmatter && /^coverImage:/ { sub("/static/", "/", $2); printf "image: %s\n", $2; next }
    in_frontmatter && /^sideImage:/ { sub("/static/", "/", $2); printf "sideImage: %s\n", $2; next }
    in_frontmatter && /^sideNote:/ { printf "sidenote: \"%s\"\n", substr($0, 10); next }
    in_frontmatter && /^sideImageCaption:/ { printf "sideImageCaption: \"%s\"\n", substr($0, 17); next }
    in_frontmatter && /^(date|tags|related):/ { print; next }
    
    # Process content
    in_content { 
        gsub("/static/images/", "/images/")
        print
    }
    ' "$file" > "$temp_file"
    
    # Replace original with processed file
    mv "$temp_file" "$file"
    
    echo "Completed: $file"
done

echo "All files processed!"