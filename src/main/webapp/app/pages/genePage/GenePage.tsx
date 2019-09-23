import React from 'react';
import { observer, inject } from 'mobx-react';
import { AnnotationStore } from 'app/store/AnnotationStore';
import { observable, action } from 'mobx';
import { If, Else, Then } from 'react-if';
import { Redirect } from 'react-router';
import { Row, Col, Button } from 'react-bootstrap';
import { Gene } from 'app/shared/api/generated/OncoKbAPI';
import styles from './GenePage.module.scss';
import { levelOfEvidence2Level, reduceJoin } from 'app/shared/utils/Utils';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import autobind from 'autobind-decorator';

enum GENE_TYPE_DESC {
  ONCOGENE = 'Oncogene',
  TUMOR_SUPPRESSOR = 'Tumor Suppressor'
}

const getGeneTypeSentence = (oncogene: boolean, tsg: boolean) => {
  let geneTypes = [];
  if (oncogene) {
    geneTypes.push(GENE_TYPE_DESC.ONCOGENE);
  } else if (tsg) {
    return geneTypes.push(GENE_TYPE_DESC.TUMOR_SUPPRESSOR);
  }
  return geneTypes.join(', ');
};

const getHighestLevelStrings = (highestSensitiveLevel: string | undefined, highestResistanceLevel: string | undefined) => {
  let levels: React.ReactNode[] = [];
  if (highestSensitiveLevel) {
    const level = levelOfEvidence2Level(highestSensitiveLevel);
    levels.push(<span className={`oncokb level-${level}`}>Level {level}</span>);
  }
  if (highestResistanceLevel) {
    const level = levelOfEvidence2Level(highestResistanceLevel);
    levels.push(<span className={`oncokb level-${level}`}>Level {level}</span>);
  }
  return <>{reduceJoin(levels, ', ')}</>;
};

type GeneInfo = {
  gene: Gene;
  highestSensitiveLevel: string | undefined;
  highestResistanceLevel: string | undefined;
};

const GeneInfo: React.FunctionComponent<GeneInfo> = props => {
  const gene = props.gene;
  const info: (JSX.Element | string)[] = [];

  // gene type
  if (gene.oncogene !== undefined || gene.tsg !== undefined) {
    info.push(
      <div className={styles.highlightGeneInfo}>
        <b>{getGeneTypeSentence(gene.oncogene, gene.tsg)}</b>
      </div>
    );
  }

  // highest LoE
  if (props.highestResistanceLevel || props.highestSensitiveLevel) {
    info.push(
      <div className={styles.highlightGeneInfo}>
        <b>Highest level of evidence: {getHighestLevelStrings(props.highestSensitiveLevel, props.highestResistanceLevel)}</b>
      </div>
    );
  }

  if (gene.geneAliases.length > 0) {
    info.push(<div>{`Also known as ${gene.geneAliases.join(', ')}`}</div>);
  }

  const additionalInfo: React.ReactNode[] = [
    <span>
      Gene ID:{' '}
      <Button className={styles.geneAdditionalInfoButton} variant="link" href={`https://www.ncbi.nlm.nih.gov/gene/${gene.entrezGeneId}`}>
        {gene.entrezGeneId}
      </Button>
    </span>
  ];
  if (gene.curatedIsoform) {
    additionalInfo.push(
      <span>
        Isoform:{' '}
        <Button className={styles.geneAdditionalInfoButton} variant="link" href={`https://www.ensembl.org/id/${gene.curatedIsoform}`}>
          {gene.curatedIsoform}
        </Button>
      </span>
    );
  }
  if (gene.curatedRefSeq) {
    additionalInfo.push(
      <span>
        RefSeq:{' '}
        <Button
          className={styles.geneAdditionalInfoButton}
          variant="link"
          href={`https://www.ncbi.nlm.nih.gov/nuccore/${gene.curatedRefSeq}`}
        >
          {gene.curatedRefSeq}
        </Button>
      </span>
    );
  }

  info.push(<div className={styles.geneAdditionalInfo}>{reduceJoin(additionalInfo, '')}</div>);

  return (
    <>
      {info.map(record => (
        <Row>
          <Col>{record}</Col>
        </Row>
      ))}
    </>
  );
};

const GeneBackground: React.FunctionComponent<{
  show: boolean;
  geneBackground: string;
  hugoSymbol: string;
  onClick: () => void;
  className?: string;
}> = props => {
  return (
    <div className={props.className}>
      <div onClick={() => props.onClick()}>
        <i>{`${props.show ? 'Hide' : 'Show'} ${props.hugoSymbol} background`}</i>
        <i className={`fa ${props.show ? 'fa-arrow-circle-o-up' : 'fa-arrow-circle-o-down'} ml-2`} />
      </div>
      {props.show ? <div>{props.geneBackground}</div> : undefined}
    </div>
  );
};

@inject('routing')
@observer
export default class GenePage extends React.Component<{}> {
  @observable hugoSymbol: string;
  @observable alteration: string;
  @observable showGeneBackground = false;

  private store: AnnotationStore;

  constructor(props: any) {
    super(props);
    this.hugoSymbol = props.match.params ? props.match.params.hugoSymbol : undefined;
    this.store = new AnnotationStore({
      hugoSymbol: this.hugoSymbol,
      alteration: this.alteration
    });
  }

  @autobind
  @action
  toggleGeneBackground() {
    this.showGeneBackground = !this.showGeneBackground;
  }

  render() {
    return (
      <If condition={!!this.hugoSymbol}>
        <Then>
          <If condition={this.store.gene.isComplete && this.store.geneNumber.isComplete}>
            <Then>
              <Row>
                <Col lg={6} xs={12}>
                  <div className="">
                    <GeneInfo
                      gene={this.store.gene.result!}
                      highestSensitiveLevel={this.store.geneNumber.result.highestSensitiveLevel}
                      highestResistanceLevel={this.store.geneNumber.result.highestResistanceLevel}
                    />
                    {this.store.geneSummary.result ? <div className="mt-2">{this.store.geneSummary.result}</div> : undefined}
                    {this.store.geneBackground.result ? (
                      <GeneBackground
                        className="mt-2"
                        show={this.showGeneBackground}
                        hugoSymbol={this.hugoSymbol}
                        geneBackground={this.store.geneBackground.result}
                        onClick={this.toggleGeneBackground}
                      />
                    ) : (
                      undefined
                    )}
                  </div>
                </Col>
                <Col lg={6} xs={12} />
              </Row>
            </Then>
            <Else>
              <LoadingIndicator size={'big'} center={true} isLoading={this.store.gene.isPending || this.store.geneNumber.isPending} />
            </Else>
          </If>
        </Then>
        <Else>
          <Redirect to={'/'} />
        </Else>
      </If>
    );
  }
}
