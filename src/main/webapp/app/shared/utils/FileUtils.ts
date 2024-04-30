export function downloadFile(
  fileName: string,
  content: string,
  options: BlobPropertyBag = { type: 'text/tsv' }
) {
  const blob = new Blob([content], options);
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = fileName;
  downloadLink.click();
}
