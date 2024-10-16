import React, { CSSProperties } from 'react';
import styles from './info-tile.module.scss';
import { COLOR_GREY } from 'app/config/theme';
import classnames from 'classnames';

export type Category = {
  title: string;
  content?: JSX.Element | string;
  className?: string;
};
export type InfoTile = {
  title: string;
  categories: Category[];
  className?: string;
};

const Category: React.FunctionComponent<Category> = props => {
  const isNa = props.content === undefined || props.content === null;
  const isText = isNa || typeof props.content === 'string';
  const style: CSSProperties = { height: '3rem' };
  if (isText) {
    style.fontSize = '1.5rem';
    style.fontFamily = 'Gotham Bold';
  }
  return (
    <div className={classnames(props.className, 'flex-grow-1')}>
      <div style={{ color: COLOR_GREY }} className={'mb-1'}>
        {props.title}
      </div>
      <div className={classnames('d-flex align-items-center')} style={style}>
        {props.content}
      </div>
    </div>
  );
};

const InfoTile: React.FunctionComponent<InfoTile> = props => {
  return props.categories.length > 0 ? (
    <div className={classnames(styles.tile, 'mr-2', props.className)}>
      <div className={'h6 font-bold mb-2'}>{props.title}</div>
      <div className={'d-flex'}>
        {props.categories.map(category => (
          <Category {...category} className={styles.category} />
        ))}
      </div>
    </div>
  ) : (
    <></>
  );
};

export default InfoTile;
