const fs = require('fs');

// Read the file
let content = fs.readFileSync('app/page.tsx', 'utf8');

// Replace the footer logos with clickable links
content = content.replace(
  /{/\* Globe\/Web Logo \*\/}\s*<div className="w-7 h-7 flex items-center justify-center">/g,
  '{/* Globe/Web Logo */}\n              <a \n                href="https://www.twelvelabs.io/product/analyze" \n                target="_blank" \n                rel="noopener noreferrer"\n                className="w-7 h-7 flex items-center justify-center hover:opacity-80 transition-opacity"\n              >'
);

content = content.replace(
  /{/\* Discord Logo \*\/}\s*<div className="w-7 h-7 flex items-center justify-center">/g,
  '{/* Discord Logo */}\n              <a \n                href="https://discord.com/invite/Sh6BRfakJa" \n                target="_blank" \n                rel="noopener noreferrer"\n                className="w-7 h-7 flex items-center justify-center hover:opacity-80 transition-opacity"\n              >'
);

content = content.replace(
  /{/\* New Twitter\/X Logo \*\/}\s*<div className="w-7 h-7 flex items-center justify-center">/g,
  '{/* New Twitter/X Logo */}\n              <a \n                href="https://x.com/twelve_labs" \n                target="_blank" \n                rel="noopener noreferrer"\n                className="w-7 h-7 flex items-center justify-center hover:opacity-80 transition-opacity"\n              >'
);

// Replace the closing divs with closing a tags for the logos
content = content.replace(
  /<\/svg>\s*<\/div>\s*{/\* Discord Logo \*\/}/g,
  '</svg>\n              </a>\n              {/* Discord Logo */}'
);

content = content.replace(
  /<\/svg>\s*<\/div>\s*{/\* New Twitter\/X Logo \*\/}/g,
  '</svg>\n              </a>\n              {/* New Twitter/X Logo */}'
);

content = content.replace(
  /<\/svg>\s*<\/div>\s*<\/div>/g,
  '</svg>\n              </a>\n            </div>'
);

// Write the updated content back
fs.writeFileSync('app/page.tsx', content);

console.log('Footer links updated successfully!');
