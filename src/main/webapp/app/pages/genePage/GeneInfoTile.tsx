import styles from 'app/pages/genePage/GenePage.module.scss';
import InfoTile from 'app/components/infoTile/InfoTile';
import LoETile from 'app/components/infoTile/LoETile';
import React from 'react';
import { GeneNumber } from 'app/shared/api/generated/OncoKbPrivateAPI';
import {
  Oncogenicity,
  Pathogenicity,
} from 'app/components/oncokbMutationMapper/OncokbMutationMapper';
import classnames from 'classnames';

export interface IGeneInfoTil {
  isGermline: boolean;
  geneNumber: GeneNumber;
  oncogenicities: Oncogenicity[];
  pathogenicities: Pathogenicity[];
}

const GeneInfoTile = (props: IGeneInfoTil) => {
  let count = 1;
  if (props.isGermline) count++;
  if (
    props.geneNumber.highestSensitiveLevel ||
    props.geneNumber.highestResistanceLevel ||
    props.geneNumber.highestDiagnosticImplicationLevel ||
    props.geneNumber.highestPrognosticImplicationLevel ||
    props.geneNumber.highestFdaLevel
  ) {
    count++;
  }

  const tileStyle = count === 2 ? styles.evenInfoTile : styles.autoInfoTile;

  return (
    <div className={styles.infoTileContainer}>
      {props.isGermline && (
        <InfoTile
          className={classnames(styles.infoTile, tileStyle)}
          title={'Genetic Risk'}
          categories={[
            {
              title: 'Penetrance',
              content: props.geneNumber.penetrance,
            },
            {
              title: 'Mechanism of Inheritance',
              content: props.geneNumber.inheritanceMechanism,
            },
          ]}
        />
      )}
      <LoETile
        className={classnames(styles.infoTile, tileStyle)}
        highestSensitiveLevel={props.geneNumber.highestSensitiveLevel}
        highestResistanceLevel={props.geneNumber.highestResistanceLevel}
        highestDiagnosticImplicationLevel={
          props.geneNumber.highestDiagnosticImplicationLevel
        }
        highestPrognosticImplicationLevel={
          props.geneNumber.highestPrognosticImplicationLevel
        }
        highestFdaLevel={props.geneNumber.highestFdaLevel}
      />
      <InfoTile
        className={classnames(styles.infoTile, tileStyle)}
        title={`Annotated ${props.isGermline ? 'variants' : 'alterations'}`}
        categories={
          props.isGermline
            ? props.pathogenicities.map(pathogenicity => {
                return {
                  title: pathogenicity.pathogenicity,
                  content: pathogenicity.counts.toString(),
                };
              })
            : props.oncogenicities.map(oncogenicity => {
                return {
                  title: oncogenicity.oncogenicity,
                  content: oncogenicity.counts.toString(),
                };
              })
        }
      />
    </div>
  );
};

export default GeneInfoTile;
