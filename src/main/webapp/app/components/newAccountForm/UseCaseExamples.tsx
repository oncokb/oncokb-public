import React from 'react';
import styles from './UseCaseExamples.module.scss';
import classnames from 'classnames';
import checkmark from 'content/images/checkmark.svg';
import xmark from 'content/images/xmark.svg';
import OptimizedImage from 'app/shared/image/OptimizedImage';

export default function UseCaseExamples() {
  return (
    <section className={classnames(styles.container)}>
      <div className={classnames(styles.examples)}>
        <section>
          <h3>
            Answers with sufficient detail
            <OptimizedImage alt="checkmark" src={checkmark} />
          </h3>
          <div>
            <p>
              "We are researching mutations that drive metastatic breast cancer.
              We have a cohort of retrospective patient samples in a private
              instance of cBioPortal and we need OncoKB annotation to
              differentiate driver versus passenger mutations"
            </p>
            <p>
              "Our research focuses on bladder cancer and we want to use OncoKB
              to see which mutations in the FGFR genes have not yet been
              characterized so that we can focus biological characterization on
              these VUS"
            </p>
          </div>
        </section>
        <section>
          <h3>
            Answers that require further clarification
            <OptimizedImage alt="x-mark" src={xmark} />
          </h3>
          <div>
            <p>"Academic"</p>
            <p>"For research"</p>
            <p>"I plan to use OncoKB in oncology research."</p>
            <p>
              "OncoKB will be used as a resource for the annotation and
              interpretation of cancer-associated genomic variants in
              translational studies"
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
