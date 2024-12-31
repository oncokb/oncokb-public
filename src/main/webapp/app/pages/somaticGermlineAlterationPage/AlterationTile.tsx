import React from 'react';
import styles from './AlterationTile.module.scss';
import classNames from 'classnames';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';

type AlterationItemProps =
  | {
      title: string;
      value: JSX.Element | string;
      link?: undefined;
    }
  | {
      title: string;
      value: string;
      link: string;
    };

function AlterationItem({
  title: itemTitle,
  value,
  link,
}: AlterationItemProps) {
  return (
    <div>
      <h4 className={classNames(styles.itemHeader)}>{itemTitle}</h4>
      <div>
        {typeof value === 'string' ? (
          <div className={classNames('h5')}>
            {link ? (
              <div className={classNames(styles.itemLink)}>
                <ExternalLinkIcon link={link}>{value}</ExternalLinkIcon>
              </div>
            ) : (
              value
            )}
          </div>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

type AlterationTileProps = {
  title: string;
  items: (AlterationItemProps | [AlterationItemProps, AlterationItemProps])[];
};

export default function AlterationTile({
  title,
  items,
}: AlterationTileProps): JSX.Element {
  return (
    <div className={classNames(styles.alterationTileContainer)}>
      <div
        className={classNames('d-flex', 'flex-column', styles.alterationTile)}
      >
        <h3 className="h6">{title}</h3>
        <div className={classNames(styles.alterationTileItems)}>
          {items.map((parent, i) => {
            if (Array.isArray(parent)) {
              return parent.map((child, j) => {
                return <AlterationItem key={`${i}:${j}`} {...child} />;
              });
            } else {
              return (
                <div className={classNames(styles.alterationTileColumnMerge)}>
                  <AlterationItem key={i} {...parent} />
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
