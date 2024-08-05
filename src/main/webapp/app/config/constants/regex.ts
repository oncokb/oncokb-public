// example reference groups to capture:
//     (PMID: 11900253)
//     (PMID: 11753428, 16007150, 21467160)
//     (NCT1234567)
export const REF_CAPTURE = /(\(\s*(?:PMID|NCT|Abstract):?.*?(?:\([^()]*\).*?)*\))/i;
export const VALID_LATIN_TEXT = /^[\p{Script=Latin}\p{M}\p{N}\p{Z}\p{P}\p{Sm}\p{Sc}\p{Sk}]+$/u;
