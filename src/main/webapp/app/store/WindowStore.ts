import { action, observable, computed } from 'mobx';
import _ from 'lodash';
import autobind from 'autobind-decorator';
import { GRID_BREAKPOINTS } from 'app/config/constants';

export interface IWindowSize {
  width: number;
  height: number;
}

class WindowStore {
  @observable size: IWindowSize;

  private handleWindowResize = _.debounce(this.setWindowSize, 200);
  private windowObj: any;

  constructor() {
    this.windowObj = window;
    this.setWindowSize();
    this.windowObj.addEventListener('resize', this.handleWindowResize);
  }

  @autobind
  @action
  private setWindowSize() {
    this.size = {
      width: this.windowObj.innerWidth,
      height: this.windowObj.innerHeight
    };
  }

  @computed
  get isXLscreen() {
    return this.size.width > GRID_BREAKPOINTS.XL;
  }
}

export default WindowStore;
