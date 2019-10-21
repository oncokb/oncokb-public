import * as React from 'react';
import oncokbClient from 'app/shared/api/oncokbClientInstance';
import { CitationText } from 'app/components/CitationText';
import { AuthDownloadButton } from 'app/components/authDownloadButton/AuthDownloadButton';
import { Link } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants';
import LicenseExplanation from 'app/shared/texts/LicenseExplanation';
import { ButtonSelections } from 'app/components/LicenseSelection';
import { RouterStore } from 'mobx-react-router';
import { inject } from 'mobx-react';
import { SwaggerApiLink } from 'app/shared/links/SwaggerApiLink';

export const DataAccessPage: React.FunctionComponent<{
  routing: RouterStore
}> = inject('routing')((props) => {
  return (
    <>
      <div className={'mb-4'}>
        <h6>
          <LicenseExplanation/>
          <span>
          {' '}For bulk downloads and API access, please register below for an account. See this page for more information about commercial use [need to draft].
        </span>
        </h6>
        <ButtonSelections routing={props.routing}/>
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
          <a href="https://github.com/oncokb/oncokb-public/tree/master/data" target="_blank" rel="noopener noreferrer">
            here
          </a>
          .
        </div>
      </div>
      <div className={'mb-3'}>
        <CitationText/>
      </div>
      <div>
        <AuthDownloadButton
          fileName="allCuratedGenes.tsv"
          getDownloadData={() => oncokbClient.utilsAllCuratedGenesTxtGetUsingGET({})}
          buttonText="All Curated Genes"
        />
        <AuthDownloadButton
          fileName="allAnnotatedVariants.tsv"
          getDownloadData={() => oncokbClient.utilsAllAnnotatedVariantsTxtGetUsingGET({})}
          buttonText="All Curated Alterations"
        />
        <AuthDownloadButton
          fileName="allActionableVariants.tsv"
          getDownloadData={() => oncokbClient.utilsAllActionableVariantsTxtGetUsingGET({})}
          buttonText="Actionable Alterations"
        />
      </div>
    </>
  );
});
