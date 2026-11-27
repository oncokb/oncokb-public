// example reference groups to capture:
//     (PMID: 11900253)
//     (PMID: 11753428, 16007150, 21467160)
//     (NCT1234567)
//     (https://www.ncbi.nlm.nih.gov/pubmed/11900253)
//     (FDA drug label, Pembrolizumab; accessed 11/24/26; https://www.accessdata.fda.gov/...)
// PMID/NCT/Abstract must lead the group; any other group is a reference
// only if it contains an https:// URL.
export const REF_CAPTURE = /(\(\s*(?:(?:PMID|NCT|Abstract):?|[^()]*?https:\/\/).*?(?:\([^()]*\).*?)*\))/i;
// The https URL inside a reference, excluding trailing punctuation such as ";" or "."
export const REF_URL = /https:\/\/\S+?(?=[.,;:]?(?:\s|$))/i;
export const VALID_LATIN_TEXT = /^[\p{Script=Latin}\p{M}\p{N}\p{Z}\p{P}\p{Sm}\p{Sc}\p{Sk}\r\n]+$/u;

export const ALTERNATIVE_ALLELES_REGEX = /([A-Z]+[0-9]+)([A-Z]+(\/[A-Z]+)*)/i;
