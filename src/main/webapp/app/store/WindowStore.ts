import { action, observable, computed } from 'mobx';
import _ from 'lodash';
import autobind from 'autobind-decorator';
import { GRID_BREAKPOINTS, PAGE_ROUTE } from 'app/config/constants';
import React from 'react';

export interface IWindowSize {
  width: number;
  height: number;
}

class WindowStore {
  @observable size: IWindowSize;
  private handleWindowResize = _.debounce(this.setWindowSize, 200);
  private windowObj: any;
  private onClickEvents: { (event: any): void }[] = [];

  constructor() {
    this.windowObj = window;
    this.setWindowSize();
    this.windowObj.addEventListener('resize', this.handleWindowResize);
    this.windowObj.addEventListener('click', (event: any) => {
      this.onClickEvents.forEach(item => item(event));
    });
  }

  public registerOnClickEvent(func: { (event: any): void }) {
    this.onClickEvents.push(func);
  }

  @autobind
  @action
  private setWindowSize() {
    this.size = {
      width: this.windowObj.innerWidth,
      height: this.windowObj.innerHeight,
    };
  }

  @computed
  get isXLscreen() {
    return this.size.width >= GRID_BREAKPOINTS.XL;
  }

  @computed
  get isLargeScreen() {
    return this.size.width >= GRID_BREAKPOINTS.LG;
  }

  @computed
  get baseUrl() {
    return (
      window.location.hostname +
      (window.location.port ? `:${window.location.port}` : '')
    );
  }
}

export default WindowStore;
