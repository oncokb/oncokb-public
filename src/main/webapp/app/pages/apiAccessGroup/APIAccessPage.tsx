import * as React from 'react';
import oncokbClient from 'app/shared/api/oncokbClientInstance';
import { CitationText } from 'app/components/CitationText';
import { AuthDownloadButton } from 'app/components/authDownloadButton/AuthDownloadButton';
import {
  API_DOCUMENT_LINK,
  DATA_RELEASES,
  DataRelease,
  DEFAULT_MARGIN_BOTTOM_LG,
  DEMO_WEBSITE_LINK,
  ONCOKB_TM,
  PAGE_ROUTE,
  PAGE_TITLE,
  USER_AUTHORITY,
} from 'app/config/constants';
import { RouterStore } from 'mobx-react-router';
import { inject, observer } from 'mobx-react';
import { SwaggerApiLink } from 'app/shared/links/SwaggerApiLink';
import { remoteData } from 'cbioportal-frontend-commons';
import oncokbPrivateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { DownloadAvailability } from 'app/shared/api/generated/OncoKbPrivateAPI';
import _ from 'lodash';
import { Button, Col, Row } from 'react-bootstrap';
import { getNewsTitle } from 'app/pages/newsPage/NewsList';
import { LICENSE_HASH_KEY } from 'app/pages/RegisterPage';
import { action, computed, observable } from 'mobx';
import WindowStore from 'app/store/WindowStore';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import DocumentTitle from 'react-document-title';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { Linkout } from 'app/shared/links/Linkout';
import { If, Then, Else } from 'react-if';
import { getPageTitle } from 'app/shared/utils/Utils';

type DownloadAvailabilityWithDate = DataRelease & DownloadAvailability;

const getDataTitle = (date: string, version: string) => {
  return `${getNewsTitle(date)} (${version})`;
};

const BUTTON_CLASS_NAME = 'mr-2 my-1';
const DownloadButtonGroups: React.FunctionComponent<{
  data: DownloadAvailabilityWithDate;
}> = props => {
  return (
    <>
      {props.data.hasAllCuratedGenes ? (
        <AuthDownloadButton
          className={BUTTON_CLASS_NAME}
          fileName={`all_curated_genes_${props.data.version}.tsv`}
          getDownloadData={() =>
            oncokbClient.utilsAllCuratedGenesTxtGetUsingGET({
              version: props.data.version,
            })
          }
          buttonText="All Curated Genes"
        />
      ) : null}
      {props.data.hasCancerGeneList ? (
        <AuthDownloadButton
          className={BUTTON_CLASS_NAME}
          fileName={`cancer_gene_list_${props.data.version}.tsv`}
          getDownloadData={() =>
            oncokbClient.utilsCancerGeneListTxtGetUsingGET({
              version: props.data.version,
            })
          }
          buttonText="Cancer Gene List"
        />
      ) : null}
      {props.data.hasAllActionableVariants ? (
        <AuthDownloadButton
          className={BUTTON_CLASS_NAME}
          fileName={`oncokb_${props.data.version.replace('.', '_')}.sql.gz`}
          getDownloadData={async () => {
            const data = await oncokbPrivateClient.utilDataSqlDumpGetUsingGET({
              version: props.data.version,
            });
            return data;
          }}
          buttonText="Data Dump"
        />
      ) : null}
    </>
  );
};

@inject('routing', 'windowStore', 'authenticationStore')
@observer
export default class APIAccessPage extends React.Component<{
  routing: RouterStore;
  windowStore: WindowStore;
  authenticationStore: AuthenticationStore;
}> {
  @observable selectedVersion: {
    label: string;
    value: string;
  };
  readonly dataAvailability = remoteData<DownloadAvailabilityWithDate[]>({
    async invoke() {
      const result = await oncokbPrivateClient.utilDataAvailabilityGetUsingGET(
        {}
      );
      const availableVersions = _.reduce(
        result,
        (acc, next) => {
          acc[next.version] = next;
          return acc;
        },
        {} as { [key: string]: DownloadAvailability }
      );
      // do not provide data on version 1
      return _.reduce(
        DATA_RELEASES.filter(
          release =>
            _.has(availableVersions, release.version) &&
            !release.version.startsWith('v1')
        ),
        (acc, next) => {
          const currentVersionData: DownloadAvailability =
            availableVersions[next.version];
          if (
            currentVersionData.hasAllActionableVariants ||
            currentVersionData.hasAllAnnotatedVariants ||
            currentVersionData.hasAllCuratedGenes ||
            currentVersionData.hasCancerGeneList
          ) {
            acc.push({
              ...availableVersions[next.version],
              date: next.date,
            });
          }
          return acc;
        },
        [] as DownloadAvailabilityWithDate[]
      );
    },
    default: [],
  });

  @action
  onApplyForLicense = () => {
    this.props.routing.history.push(PAGE_ROUTE.REGISTER);
  };

  @computed
  get selectedData() {
    if (this.selectedVersion) {
      return _.chain(this.dataAvailability.result)
        .filter(item => item.version === this.selectedVersion.value)
        .first()
        .value();
    } else {
      return undefined;
    }
  }

  render() {
    return (
      <DocumentTitle title={getPageTitle(PAGE_TITLE.API_ACCESS)}>
        <>
          <If condition={this.props.authenticationStore.account !== undefined}>
            <Then>
              <Row>
                <Col>
                  <div className={'mb-3'}>
                    <h5 className="title">Annotating Your Files</h5>
                    <div>
                      You can annotate your data files (mutations, copy number
                      alterations, fusions, and clinical data) with{' '}
                      <a
                        href="https://github.com/oncokb/oncokb-annotator"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ONCOKB_TM} Annotator
                      </a>
                      .
                    </div>
                  </div>
                  <div className={'mb-3'}>
                    <h5 className="title">Web API</h5>
                    <div>
                      You can programmatically access the {ONCOKB_TM} data via
                      its <SwaggerApiLink>web API</SwaggerApiLink>.
                      <div>
                        Please specify your API token in the request header with{' '}
                        <code>Authorization: Bearer [your token]</code>.
                      </div>
                      <div>
                        Your token is available in your{' '}
                        <Link to={PAGE_ROUTE.ACCOUNT_SETTINGS}>
                          Account Settings
                        </Link>
                        .
                      </div>
                      <div>
                        Example:{' '}
                        <code>
                          curl -H &quot;Authorization: Bearer [your token]&quot;
                          https://www.oncokb.org/api/v1/utils/allCuratedGenes
                        </code>
                      </div>
                      <div className={'mt-2'}>
                        Please see our detailed{' '}
                        <Linkout link={API_DOCUMENT_LINK}>
                          API documentation
                        </Linkout>{' '}
                        for more information.
                      </div>
                    </div>
                  </div>
                  {this.props.authenticationStore.account &&
                  this.props.authenticationStore.account.authorities.includes(
                    USER_AUTHORITY.ROLE_DATA_DOWNLOAD
                  ) ? (
                    <>
                      <div className={'mb-3'}>
                        <h5 className="title">Data Download</h5>
                      </div>
                      {this.dataAvailability.isComplete &&
                      this.dataAvailability.result.length > 0 ? (
                        <>
                          <h6 className="title">
                            {getDataTitle(
                              this.dataAvailability.result[0].date,
                              this.dataAvailability.result[0].version
                            )}
                            , the latest
                          </h6>
                          <DownloadButtonGroups
                            data={this.dataAvailability.result[0]}
                          />

                          {this.dataAvailability.result.length > 1 ? (
                            <>
                              <hr />
                              <Row className={'mb-3'}>
                                <Col lg={4} xs={12}>
                                  <Select
                                    value={this.selectedVersion}
                                    placeholder={'Select previous version'}
                                    options={this.dataAvailability.result
                                      .slice(1)
                                      .map(data => {
                                        return {
                                          value: data.version,
                                          label: getDataTitle(
                                            data.date,
                                            data.version
                                          ),
                                        };
                                      })}
                                    onChange={(selectedOption: any) =>
                                      (this.selectedVersion = selectedOption)
                                    }
                                    isClearable={true}
                                  />
                                </Col>
                              </Row>

                              {this.selectedData !== undefined ? (
                                <>
                                  <Row className={DEFAULT_MARGIN_BOTTOM_LG}>
                                    <Col>
                                      <DownloadButtonGroups
                                        data={this.selectedData}
                                      />
                                    </Col>
                                  </Row>
                                </>
                              ) : null}
                            </>
                          ) : null}
                        </>
                      ) : null}
                    </>
                  ) : null}
                </Col>
              </Row>
            </Then>
            <Else>
              <Row>
                <Col>
                  <p>
                    Programmatic access to {ONCOKB_TM} via its API requires a
                    license. Research licenses in an academic setting are free,
                    all other uses require a fee. Please review the{' '}
                    <Link to={PAGE_ROUTE.TERMS}>terms of use</Link> before
                    proceeding. <CitationText /> Please visit the{' '}
                    <Link to={PAGE_ROUTE.REGISTER}>registration page</Link> to
                    apply for a license.
                  </p>
                  <p>
                    You can also use our{' '}
                    <Linkout link={DEMO_WEBSITE_LINK}>demo website</Linkout>,{' '}
                    which includes the full data of BRAF, TP53 and ROS1, before
                    committing to our license.
                  </p>

                  <p>
                    Once registered and logged in, you will have access to the
                    following:
                  </p>
                  <div>
                    <h5 className="title">File Annotator</h5>
                    <p>
                      You can annotate your data files (mutations, copy number
                      alterations, fusions, and clinical data) with{' '}
                      <a
                        href="https://github.com/oncokb/oncokb-annotator"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ONCOKB_TM} Annotator
                      </a>
                      .
                    </p>
                  </div>
                  <div>
                    <h5 className="title">Web API</h5>
                    <p>
                      You can programmatically access the {ONCOKB_TM} data via
                      its <SwaggerApiLink>web API</SwaggerApiLink>, using a
                      token available in your{' '}
                      <Link to={PAGE_ROUTE.ACCOUNT_SETTINGS}>
                        Account Settings
                      </Link>
                      . Please see our detailed{' '}
                      <Linkout link={API_DOCUMENT_LINK}>
                        API documentation
                      </Linkout>{' '}
                      for more information.
                    </p>
                  </div>
                </Col>
              </Row>
            </Else>
          </If>
        </>
      </DocumentTitle>
    );
  }
}
