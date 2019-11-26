import * as React from 'react';
import { CitationText } from 'app/components/CitationText';
import NewsList, { getNews, getNewsTitle } from 'app/pages/newsPage/NewsList';
import { NEWS_BY_DATE } from 'app/pages/newsPage/NewsPageContent';
import { ONCOKB_CONTACT_EMAIL, PAGE_ROUTE } from 'app/config/constants';
import { Link } from 'react-router-dom';

export const NewsPage = () => {
  return (
    <div className="news">
      <div>
        <p>
          While we aim to keep the information up to date and correct, there
          will inevitably be gaps or mistakes. Please help us to identify any
          issues by <b>sending an email to</b>{' '}
          <a href={`mailto:${ONCOKB_CONTACT_EMAIL}?subject=OncoKB Feedback`}>
            {ONCOKB_CONTACT_EMAIL}
          </a>
          , or use the feedback button that appears next to alterations in
          cBioPortal.
        </p>
        <p>
          <b>Stay tuned</b> for future data updates (improved annotations, new
          alterations), as well as new features. You can follow us on Twitter (
          <a
            href="https://twitter.com/OncoKB"
            target="_blank"
            rel="noopener noreferrer"
          >
            @OncoKB
          </a>
          ) or subscribe to our{' '}
          <b>
            <a data-toggle="modal" data-target="#myModal" href="">
              low-volume email list
            </a>
          </b>{' '}
          for updates.
        </p>
        <CitationText />
      </div>
      <div className="mt-2">
        <NewsList date={'12022019'}>
          <span>
            Established login procedures for access to downloadable data files
            and API. Please review the{' '}
            <Link to={PAGE_ROUTE.TERMS}>usage terms</Link> before using. OncoKB
            will continue to be accessible for no fee for research use in
            academic setting. A license is required to use OncoKB for commercial
            and/or clinical purposes. Fees will be used to support future
            development and maintenance of OncoKB. Please visit the{' '}
            <Link to={PAGE_ROUTE.REGISTER}>registration page</Link>.
          </span>
        </NewsList>
        <NewsList date={'08282019'} />
        <NewsList date={'08042019'} />
        <NewsList date={'06212019'} />
        <NewsList date={'05092019'} />
        <NewsList date={'01242019'} />
        <NewsList date={'12142018'} />
        <NewsList date={'11022018'} />
        <NewsList date={'10262018'} />
        <NewsList date={'10012018'} />
        <NewsList date={'08202018'} />
        <NewsList date={'07122018'} />
        <NewsList date={'02022018'} />
        <NewsList date={'10262017'} />

        <h3>{getNewsTitle('08172017')}</h3>
        <div>
          <b>
            The following FDA-approvals have been incorporated into the
            Actionable Genes table:
          </b>
          <ul>
            {getNews({
              key: 'news-08172017',
              content: NEWS_BY_DATE['08172017'].news
            })}
          </ul>
        </div>

        <NewsList date={'08022017'} />
        <NewsList date={'05152017'} />
        <NewsList date={'04052017'} />
        <NewsList date={'03072017'} />
        <NewsList date={'12292016'} />
        <NewsList date={'11222016'} />
        <NewsList date={'10242016'} />
        <NewsList date={'09162016'} />
        <NewsList date={'08102016'} />
        <NewsList date={'07062016'} />

        <h3>{getNewsTitle('07062016')}</h3>
        <div>
          <b>Improved clinical annotations:</b>
          <ul>
            {getNews({
              key: 'news-07062016',
              content: NEWS_BY_DATE['07062016'].news
            })}
          </ul>
        </div>
      </div>
      <h3>Jun 6, 2016</h3>
      <div>
        <p>
          We are happy to announce the <b>first release of OncoKB</b>, a
          knowledge base for precision medicine. Our goal is to comprehensively
          annotate the oncogenic effect of mutations observed in cancer, as well
          as their therapeutic implications. This release contains information
          about almost 3,000 alterations in 418 cancer genes. For each
          alteration, we categorize the biological and clinical effect, along
          with citations of the source of the information, and, when available,
          the therapeutic implications of a alteration. We have focussed on
          FDA-approved (Level 1) or guideline-listed (Level 2) biomarkers, as
          well as biomarkers that with clinical evidence for sensitivity and for
          which therapies are currently explored in clinical trials (Level 3).
          See the Levels of Evidence and Actionable Genes pages for more
          information.
        </p>
        <p>
          We have also{' '}
          <b>
            integrated information from OncoKB into the cBioPortal for Cancer
            Genomics
          </b>
          . When exploring alterations in{' '}
          <a
            href="http://www.cbioportal.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            cbioportal.org
          </a>
          , you will see annotations from OncoKB when available.{' '}
          <a
            href="http://www.cbioportal.org/case.do?cancer_study_id=luad_tcga_pub&sample_id=TCGA-49-4494-01"
            target="_blank"
            rel="noopener noreferrer"
          >
            Example of a lung cancer case.
          </a>
        </p>
      </div>
    </div>
  );
};
