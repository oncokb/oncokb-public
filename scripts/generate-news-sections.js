const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

const oncokbBaseUrls = [
  'https://oncokb.org',
  'http://oncokb.org',
  'https://www.oncokb.org',
  'http://www.oncokb.org',
  'https://beta.oncokb.org',
  'http://beta.oncokb.org',
];

const objectPropertyMark = '-------------------';
const objectPropertyMarkRegex = new RegExp(
  `"${objectPropertyMark}(.*)${objectPropertyMark}"`,
  'gm'
);

/**
 * Escapes special characters in a string to be used in a regular expression.
 *
 * This ensures that characters such as `.*+?^${}()|[]\` are treated as literals.
 *
 * @param {string} string - The input string to escape.
 * @returns {string} - The escaped string safe for use in a regex.
 *
 * @example
 * const escaped = escapeRegExp("Hello (world)!");
 * console.log(escaped); // "Hello \\(world\\)!"
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Replaces all occurrences of a substring in a given string.
 *
 * Since `String.prototype.replaceAll()` is not available in older Node.js versions,
 * this function uses `RegExp` with the global flag.
 *
 * @param {string} str - The original string.
 * @param {string} match - The substring to be replaced.
 * @param {string} replacement - The replacement string.
 * @returns {string} - The modified string with all occurrences replaced.
 *
 * @example
 * const result = replaceAll("Hello world, world!", "world", "Earth");
 * console.log(result); // "Hello Earth, Earth!"
 */
function replaceAll(str, match, replacement) {
  return str.replace(new RegExp(escapeRegExp(match), 'g'), () => replacement);
}

/**
 * Decodes specific HTML entities in a given string.
 *
 * This function currently only replaces `&quot;` with `"`.
 * Extend this function if more entities need to be decoded.
 *
 * @param {string} text - The input string containing HTML entities.
 * @returns {string} - The decoded string.
 *
 * @example
 * const decoded = decodeHtmlEntities("This is &quot;quoted&quot; text.");
 * console.log(decoded); // 'This is "quoted" text.'
 */
function decodeHtmlEntities(text) {
  return replaceAll(text, '&quot;', '"');
}

/**
 * Fixes HTML-escaped entities in a specific pattern within a string.
 *
 * This function finds occurrences matching `objectPropertyMarkRegex`,
 * extracts the inner content, decodes HTML entities, and wraps it in `{}`.
 *
 * @param {string} htmlString - The input HTML string to process.
 * @returns {string} - The fixed string with decoded entities.
 *
 * @example
 * const fixed = fixHtmlString('"----[&quot;Example&quot;]----"');
 * console.log(fixed); // '{["Example]"}'
 */
function fixHtmlString(htmlString) {
  return htmlString.replace(objectPropertyMarkRegex, (_, group) => {
    return `{${decodeHtmlEntities(group)}}`;
  });
}

/**
 * @param {import('markdown-it')} md - The markdown-it instance used for parsing.
 * @param {import('markdown-it').StateCore} state - The state object containing Markdown parsing tokens.
 * @returns {boolean | undefined} - The modified string with all occurrences replaced.
 *
 * @throws {Error} If a mutation is found in a row without an associated gene.
 */
function newlyAddedGenes(md, state) {
  let foundNewlyAddedGenes = false;
  let index = 0;
  let toRemoveStart = -1;
  let toRemoveEnd = -1;
  const genes = [];
  for (const token of state.tokens) {
    if (token.content.toLowerCase().includes('new gene')) {
      foundNewlyAddedGenes = true;
      toRemoveStart = index;
    } else if (foundNewlyAddedGenes && token.type === 'bullet_list_close') {
      toRemoveEnd = index;
      break;
    } else if (foundNewlyAddedGenes && token.type === 'inline') {
      genes.push(token.content);
    }
    index++;
  }
  if (toRemoveStart < 0 && toRemoveEnd < 0) {
    return true;
  } else if (toRemoveStart < 0 || toRemoveEnd < 0) {
    throw new Error(
      `Found one remove gene index, but not the other (${toRemoveStart}, ${toRemoveEnd})`
    );
  }

  const alterationPageLinkTags = createMarkdownToken(
    md,
    'NewlyAddedGenesListItem'
  );
  alterationPageLinkTags[0].attrSet(
    'genes',
    `${objectPropertyMark}${JSON.stringify(genes)}${objectPropertyMark}`
  );
  alterationPageLinkTags[1].tag = 'NewlyAddedGenesListItem';

  state.tokens = state.tokens.filter(
    (_, idx) => idx < toRemoveStart || idx > toRemoveEnd
  );
  state.tokens.splice(toRemoveStart, 0, ...alterationPageLinkTags);

  return true;
}

/**
 * @param {import('markdown-it').StateCore} state - The state object containing Markdown parsing tokens.
 * @returns {boolean | undefined} - The modified string with all occurrences replaced.
 *
 * @throws {Error} If a mutation is found in a row without an associated gene.
 */
function fixLinks(state) {
  for (const token of state.tokens) {
    if (token.type === 'inline') {
      let foundLocalLink = false;
      for (const child of token.children) {
        if (child.type === 'link_close' && foundLocalLink) {
          foundLocalLink = false;
          child.tag = 'Link';
          continue;
        } else if (child.type !== 'link_open') {
          continue;
        }
        const hrefIndex = child.attrIndex('href');
        if (hrefIndex < 0) {
          continue;
        }
        const currentUrl = child.attrs[hrefIndex][1];
        let replaceUrlString = '';
        for (const url of oncokbBaseUrls) {
          if (currentUrl.startsWith(url)) {
            replaceUrlString = url;
            foundLocalLink = true;
            break;
          }
        }
        if (foundLocalLink) {
          child.tag = 'Link';
          const attr = child.attrs[hrefIndex];
          attr[0] = 'to';
          attr[1] = currentUrl.replace(replaceUrlString, '');
        }
      }
    }
  }
}

/**
 * @param {import('markdown-it')} md - The markdown-it instance used for token processing.
 * @param {import('markdown-it').StateCore} state - The state object containing Markdown parsing tokens.
 * @returns {boolean | undefined} - The modified string with all occurrences replaced.
 *
 * @throws {Error} If a mutation is found in a row without an associated gene.
 */
function addAutoTableLinks(md, state) {
  let inTh = false;
  let inTd = false;
  let columnIdx = 0;
  let geneIdx = -1;
  let mutationIdx = -1;
  let currentGene = '';
  for (const token of state.tokens) {
    if (token.type === 'th_open') {
      inTh = true;
    } else if (token.type === 'th_close') {
      inTh = false;
      columnIdx++;
    } else if (token.type === 'td_open') {
      inTd = true;
    } else if (token.type === 'td_close') {
      inTd = false;
      columnIdx++;
    } else if (token.type === 'tr_open') {
      columnIdx = 0;
      currentGene = '';
    } else if (inTd && columnIdx === geneIdx && token.type === 'inline') {
      const child = token.children[0];
      currentGene = child.content;
      child.content = `{getAlternativeGenePageLinks('${child.content}')}`;
    } else if (inTd && columnIdx === mutationIdx && token.type === 'inline') {
      const child = token.children[0];
      if (currentGene === '') {
        throw new Error(`No gene for this row and mutation "${child.content}"`);
      }
      const alterationPageLinkTags = createMarkdownToken(
        md,
        'AlterationPageLink'
      );
      alterationPageLinkTags[0].attrSet('hugoSymbol', currentGene);
      alterationPageLinkTags[0].attrSet('alteration', child.content);
      token.children = alterationPageLinkTags;
    } else if (inTh && token.content === 'Gene') {
      geneIdx = columnIdx;
    } else if (inTh && token.content === 'Mutation') {
      mutationIdx = columnIdx;
    }
  }
}

/**
 * Creates a Markdown token with a specified tag.
 *
 * @param {import('markdown-it')} md - The markdown-it instance used for parsing.
 * @param {string} tag - The tag to set on the first non-text token.
 * @returns {import('markdown-it').Token[]} - An array of markdown-it token objects with the modified tag.
 *
 * @example
 * const md = require('markdown-it')();
 * const tokens = createMarkdownToken(md, 'custom-tag');
 * console.log(tokens);
 */
function createMarkdownToken(md, tag) {
  // can't figure out how to make a token on my own so I'm forcing
  // markdown-it to make me one
  const alterationPageLinkTags = md
    .parse('[placeholder](placeholder)', {})[1]
    .children.filter(x => x.type !== 'text');
  alterationPageLinkTags[0].type = 'para';
  alterationPageLinkTags[0].tag = tag;
  alterationPageLinkTags[0].attrs = [];
  alterationPageLinkTags[1].tag = tag;
  return alterationPageLinkTags;
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
}).use(md => {
  // https://markdown-it.github.io/markdown-it
  // https://github.com/markdown-it/markdown-it/blob/master/docs/examples/renderer_rules.md
  md.renderer.rules.table_open = function () {
    return '<div className="table-responsive">\n<table className="table">';
  };

  md.renderer.rules.table_close = function () {
    return '</table>\n</div>';
  };

  md.core.ruler.push('add-auto-table-links', state => {
    addAutoTableLinks(md, state);
  });

  md.core.ruler.push('fix-links', state => fixLinks(state));
  md.core.ruler.push('fix-styles', state => {
    for (const token of state.tokens) {
      if (token.attrs != null && token.attrs.length > 0) {
        token.attrs = token.attrs.filter(([name]) => name !== 'style');
      }
      if (token.type === 'table_open') {
        token.attrSet('className', 'table');
      }
    }
    return true;
  });
  md.core.ruler.push('newly-added-genes', state => {
    newlyAddedGenes(md, state);
  });
});

const args = process.argv.slice(2);
let inputFolder = null;
let outputFolder = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-f' && args[i + 1]) {
    inputFolder = path.resolve(args[i + 1]);
  } else if (args[i] === '-o' && args[i + 1]) {
    outputFolder = path.resolve(args[i + 1]);
  }
}

if (!inputFolder || !outputFolder) {
  console.error(
    'Error: Both -f (input folder) and -o (output folder) arguments are required.'
  );
  process.exit(1);
}

// Ensure input folder exists
if (!fs.existsSync(inputFolder) || !fs.statSync(inputFolder).isDirectory()) {
  console.error(
    `Error: Input folder "${inputFolder}" does not exist or is not a directory.`
  );
  process.exit(1);
}

// Ensure output folder exists, or create it
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Read all Markdown files in the input folder
const files = fs.readdirSync(inputFolder).filter(file => file.endsWith('.md'));

if (files.length === 0) {
  console.warn(`Warning: No markdown files found in "${inputFolder}".`);
}

files.forEach(file => {
  const filePath = path.join(inputFolder, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const htmlContent = fixHtmlString(md.render(content));

  const componentName = path
    .basename(file, '.md')
    .replace(/[^a-zA-Z0-9]/g, '_');

  const tsxContent = `import React from 'react';
import { Link } from 'react-router-dom';
import { AlterationPageLink, getAlternativeGenePageLinks } from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';

export default function ${componentName}() {
  return (
    <>
      ${htmlContent}
    </>
  );
}`;

  const outputFilePath = path.join(outputFolder, `${componentName}.tsx`);
  fs.writeFileSync(outputFilePath, tsxContent, 'utf-8');
  console.log(`Generated: ${outputFilePath}`);
});
