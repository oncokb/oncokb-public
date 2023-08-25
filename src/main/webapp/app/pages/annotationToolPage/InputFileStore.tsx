import { action, observable, computed } from 'mobx';

class InputFileStore {
  @observable validFileCount = 0;
  @observable isFileUploaded = false;
  @observable uploadedFileContents: string[] = new Array(4).fill('');

  // potentially switch to an array of four truth values of enums?
  // Cause we can't just set it initially to all valid since all empty files shouldn't be annotated on
  @action incrementValidFileCount() {
    this.validFileCount++;
  }

  @action decrementValidFileCount() {
    this.validFileCount--;
  }

  @action setFileContent(index: number, content: string) {
    /* eslint-disable no-console */
    console.log(`File content for index ${index}:`, content);
    /* eslint-enable no-console */

    this.uploadedFileContents[index] = content;
  }

  @computed get allFilesUploaded() {
    return this.validFileCount === 4;
  }
}

const inputFileStore = new InputFileStore();
export default inputFileStore;
