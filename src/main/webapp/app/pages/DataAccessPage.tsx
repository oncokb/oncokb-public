import * as React from 'react';
import oncokbClient from 'app/shared/api/oncokbClientInstance';
import { CitationText } from 'app/components/CitationText';
import { AuthDownloadButton } from 'app/components/authDownloadButton/AuthDownloadButton';
import { Link } from 'react-router-dom';
import { DATA_RELEASES, DataRelease, DEFAULT_MARGIN_BOTTOM_LG, PAGE_ROUTE } from 'app/config/constants';
import LicenseExplanation from 'app/shared/texts/LicenseExplanation';
import { ButtonSelections } from 'app/components/LicenseSelection';
import { RouterStore } from 'mobx-react-router';
import { inject, observer } from 'mobx-react';
import { SwaggerApiLink } from 'app/shared/links/SwaggerApiLink';
import { remoteData } from 'cbioportal-frontend-commons';
import oncokbPrivateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { DownloadAvailability } from 'app/shared/api/generated/OncoKbPrivateAPI';
import _ from 'lodash';
import { Row, Col } from 'react-bootstrap';
import { getNewsTitle } from 'app/pages/newsPage/NewsList';
import InfoIcon from 'app/shared/icons/InfoIcon';

type DownloadAvailabilityWithDate = DataRelease & DownloadAvailability;
@inject('routing')
@observer
export default class DataAccessPage extends React.Component<{
  routing: RouterStore
}> {

  readonly dataAvailability = remoteData<DownloadAvailabilityWithDate[]>({
    async invoke() {
      const result = await oncokbPrivateClient.utilDataReleaseDownloadAvailabilityGetUsingGET({});
      const availableVersions = _.reduce(result, (acc, next) => {
        acc[next.version] = next;
        return acc;
      }, {} as { [key: string]: DownloadAvailability });
      return _.reduce(DATA_RELEASES.filter(release => _.has(availableVersions, release.version)), (acc, next) => {
        const currentVersionData: DownloadAvailability = availableVersions[next.version];
        if (currentVersionData.hasAllActionableVariants
          || currentVersionData.hasAllAnnotatedVariants
          || currentVersionData.hasAllCuratedGenes
          || currentVersionData.hasCancerGeneList) {
          acc.push({
            ...availableVersions[next.version],
            date: next.date
          });
        }
        return acc;
      }, [] as DownloadAvailabilityWithDate[]);
    },
    default: []
  });

  render() {
    return (
      <>
        <div className={'mb-4'}>
          <h6>
            <LicenseExplanation/>
            <span>
              {' '}For bulk downloads and API access, please register below for an account. See this page for more information about commercial use [need to draft].
            </span>
          </h6>
          <ButtonSelections routing={this.props.routing}/>
          <h6>Once registered and logged in, you will have access to the following:</h6>
        </div>
        <div className={'mb-3'}>
          <h5 className="title">Annotating Your Files</h5>
          <div>
            You can annotate your data files (mutations, copy number alterations, fusions, and clinical data) with{' '}
            <a href="https://github.com/oncokb/oncokb-annotator" target="_blank" rel="noopener noreferrer">
              OncoKB Annotator
            </a>
            .
          </div>
        </div>
        <div className={'mb-3'}>
          <h5 className="title">Web API</h5>
          <div>
            You can programmatically access the OncoKB data via its{' '}
            <SwaggerApiLink content={'web API'}/>
            .
          </div>
        </div>
        <div className={'mb-3'}>
          <h5 className="title">Data Download</h5>
          <div>
            OncoKB annotations are fully available for download. Please review the{' '}
            <a href="terms">
              <u>usage terms</u>
            </a>{' '}
            before downloading. Previous versions are available{' '}
            <a href="https://github.com/oncokb/oncokb-public/tree/master/data" target="_blank"
               rel="noopener noreferrer">
              here
            </a>
            .
          </div>
        </div>
        <div className={'mb-3'}>
          <CitationText/>
        </div>
        <div>
          {this.dataAvailability.result.map(item => (
            <>
              <h5>
                {getNewsTitle(item.date)} ({item.version})
              </h5>
              <Row className={DEFAULT_MARGIN_BOTTOM_LG}>
                <Col>
                  {item.hasAllCuratedGenes ? (
                    <AuthDownloadButton
                      fileName={`all_curated_genes_${item.version}.tsv`}
                      getDownloadData={() => oncokbClient.utilsAllCuratedGenesTxtGetUsingGET({
                        version: item.version
                      })}
                      buttonText="All Curated Genes"
                    />
                  ) : null}
                  {item.hasAllAnnotatedVariants ? (
                    <AuthDownloadButton
                      fileName={`all_annotated_variants_${item.version}.tsv`}
                      getDownloadData={() => oncokbClient.utilsAllAnnotatedVariantsTxtGetUsingGET({
                        version: item.version
                      })}
                      buttonText="All Curated Alterations"
                    />
                  ) : null}
                  {item.hasAllActionableVariants ? (
                    <AuthDownloadButton
                      fileName={`all_actionable_variants_${item.version}.tsv`}
                      getDownloadData={() => oncokbClient.utilsAllActionableVariantsTxtGetUsingGET({
                        version: item.version
                      })}
                      buttonText="Actionable Alterations"
                    />
                  ) : null}
                  {item.hasCancerGeneList ? (
                    <AuthDownloadButton
                      fileName={`cancer_gene_list_${item.version}.tsv`}
                      getDownloadData={() => oncokbClient.utilsCancerGeneListTxtGetUsingGET({
                        version: item.version
                      })}
                      buttonText="Cancer Gene List"
                    />
                  ) : null}
                </Col>
              </Row>
            </>
          ))}
        </div>
      </>
    );
  }
};
