import React from 'react';
import {
  levelOfEvidence2Level,
  OncoKBAnnotationIcon
} from 'app/shared/utils/Utils';
import { If, Then, Else } from 'react-if';
import Highlighter from 'react-highlight-words';
import styles from './SearchOption.module.scss';
import { SuggestCuration } from 'app/components/SuggestCuration';
import { ExtendedTypeaheadSearchResp } from 'app/pages/HomePage';
import classnames from 'classnames';

export enum SearchOptionType {
  GENE = 'GENE',
  VARIANT = 'VARIANT',
  DRUG = 'DRUG',
  TEXT = 'TEXT'
}
type SearchOptionProps = {
  search: string | undefined;
  type: SearchOptionType;
  data: ExtendedTypeaheadSearchResp;
};
const LevelString: React.FunctionComponent<{
  highestSensitiveLevel: string | undefined;
  highestResistanceLevel: string | undefined;
}> = props => {
  return (
    <>
      {' '}
      {props.highestSensitiveLevel ? (
        <span
          className={`oncokb level-${levelOfEvidence2Level(
            props.highestSensitiveLevel,
            true
          )}`}
        >
          Level {props.highestSensitiveLevel}{' '}
        </span>
      ) : (
        undefined
      )}
      {props.highestResistanceLevel ? (
        <span
          className={`oncokb level-${levelOfEvidence2Level(
            props.highestResistanceLevel,
            true
          )}`}
        >
          Level {props.highestResistanceLevel}
        </span>
      ) : (
        undefined
      )}
    </>
  );
};
const GeneSearchOption: React.FunctionComponent<{
  search: string;
  data: ExtendedTypeaheadSearchResp;
}> = props => {
  return (
    <>
      <div>
        <Highlighter
          searchWords={[props.search]}
          textToHighlight={`${props.data.gene.hugoSymbol} (Entrez Gene: ${props.data.gene.entrezGeneId})`}
        />
        {props.data.highestSensitiveLevel ||
        props.data.highestResistanceLevel ? (
          <span className={styles.subTitle}>
            {' '}
            Highest level of evidence:
            <LevelString
              highestSensitiveLevel={props.data.highestSensitiveLevel}
              highestResistanceLevel={props.data.highestResistanceLevel}
            />
          </span>
        ) : (
          undefined
        )}
      </div>
      {props.data.gene.geneAliases.length > 0 ? (
        <i>
          <div className={styles.subTitle}>
            <span>Also known as </span>
            <Highlighter
              searchWords={[props.search]}
              textToHighlight={`${props.data.gene.geneAliases.join(', ')}`}
            />
          </div>
        </i>
      ) : (
        undefined
      )}
    </>
  );
};

const AlterationSearchOption: React.FunctionComponent<{
  search: string;
  data: ExtendedTypeaheadSearchResp;
}> = props => {
  return (
    <>
      <div className={'d-flex align-items-center'}>
        <Highlighter
          textToHighlight={props.data.gene.hugoSymbol}
          searchWords={[props.search]}
        />{' '}
        /
        <Highlighter
          textToHighlight={props.data.alterationsName}
          searchWords={[props.search]}
        />
        <OncoKBAnnotationIcon
          className={'mb-1 ml-1'}
          oncogenicity={props.data.oncogenicity}
          vus={props.data.vus}
          sensitiveLevel={props.data.highestSensitiveLevel}
          resistanceLevel={props.data.highestResistanceLevel}
        />
        <If condition={!props.data.variantExist}>
          <span className={'ml-auto'}>
            <span>Not annotated by OncoKB</span>
            <SuggestCuration suggestion={props.search} />
          </span>
        </If>
      </div>
      {props.data.annotation ? (
        <div className={styles.subTitle}>
          <span>{props.data.annotation}</span>
        </div>
      ) : (
        undefined
      )}
    </>
  );
};

const DrugSearchOption: React.FunctionComponent<{
  search: string;
  data: ExtendedTypeaheadSearchResp;
}> = props => {
  return (
    <>
      <div>
        <Highlighter
          searchWords={[props.search]}
          textToHighlight={props.data.drug.drugName}
        />
      </div>
      <div className={styles.subTitle}>
        The drug is
        <LevelString
          highestSensitiveLevel={props.data.highestSensitiveLevel}
          highestResistanceLevel={props.data.highestResistanceLevel}
        />
        {` ${props.data.gene.hugoSymbol} `}
        {props.data.variants.length > 1
          ? `(${props.data.alterationsName})`
          : ''}
        {props.data.variants.length === 1 ? props.data.alterationsName : ''}
        {` ${props.data.tumorTypesName}`}
      </div>
    </>
  );
};

export const SearchOption: React.FunctionComponent<SearchOptionProps> = props => {
  const searchKeyword = props.search ? props.search : '';
  return (
    <div className={classnames(styles.match)}>
      <If condition={props.type === SearchOptionType.GENE}>
        <Then>
          <GeneSearchOption search={searchKeyword} data={props.data} />
        </Then>
        <Else>
          <If condition={props.type === SearchOptionType.VARIANT}>
            <Then>
              <AlterationSearchOption
                search={searchKeyword}
                data={props.data}
              />
            </Then>
            <Else>
              <If condition={props.type === SearchOptionType.DRUG}>
                <Then>
                  <DrugSearchOption search={searchKeyword} data={props.data} />
                </Then>
                <Else>
                  <If condition={props.type === SearchOptionType.TEXT}>
                    <Then>
                      <span>{props.data.annotation}</span>
                    </Then>
                  </If>
                </Else>
              </If>
            </Else>
          </If>
        </Else>
      </If>
    </div>
  );
};
