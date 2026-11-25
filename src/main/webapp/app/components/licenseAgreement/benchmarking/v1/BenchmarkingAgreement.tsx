import React from 'react';
import styles from '../../licenseAgreement.module.scss';
import { ONCOKB_TM } from 'app/config/constants';

export const BenchmarkingAgreement = () => {
  return (
    <div>
      <h3>{ONCOKB_TM} Benchmarking Agreement</h3>
      <p>
        This approval applies only to the benchmarking study described in your
        request and approved by {ONCOKB_TM}.
      </p>

      <ol className={styles.orderedList}>
        <li>
          <u>{ONCOKB_TM} will be used for evaluation, not model development</u>
          <p>
            You may use {ONCOKB_TM} as an external reference to evaluate the
            model or method you described to the {ONCOKB_TM} team.
          </p>
          <p>
            If this study is intended to evaluate a fixed system, the model or
            method, including any prompts, decision rules, or other relevant
            settings, must be finalized before reviewing the {ONCOKB_TM}{' '}
            results.
          </p>
          <p>
            You may not use the {ONCOKB_TM} results to train, fine-tune,
            optimize, or otherwise improve the model or method under this
            approval. This includes using {ONCOKB_TM} results to:
          </p>
          <ul>
            <li>revise or optimize prompts;</li>
            <li>select among models or model versions;</li>
            <li>change decision rules or thresholds;</li>
            <li>create training, fine-tuning, or synthetic examples; or</li>
            <li>
              repeatedly modify and re-evaluate the system based on its
              performance against {ONCOKB_TM}.
            </li>
          </ul>
        </li>

        <li>
          <u>
            {ONCOKB_TM} results may only be stored as needed for the approved
            study
          </u>
          <p>
            You may store or cache {ONCOKB_TM} results as reasonably necessary
            to conduct the approved benchmarking study and reproduce its
            results.
          </p>
          <p>
            Stored {ONCOKB_TM} information may only be used for the approved
            study and must be maintained in accordance with the storage and
            retention requirements specified in your approval, if applicable.
          </p>
          <p>
            You may not use cached results to create or maintain a local copy of{' '}
            {ONCOKB_TM}, or distribute cached {ONCOKB_TM} annotations to others.
          </p>
          <p>
            At the end of the approved retention period, {ONCOKB_TM}-derived
            information must be deleted or continued retention must be
            separately approved.
          </p>
        </li>

        <li>
          <u>
            Publications may report benchmark results but should not reproduce{' '}
            {ONCOKB_TM}
          </u>
          <p>
            You may report aggregate benchmark results, such as performance
            metrics and high-level analyses of agreement or disagreement with
            {ONCOKB_TM}.
          </p>
          <p>
            You may not publish or distribute substantial {ONCOKB_TM} content
            without separate permission. This includes collections of individual
            {ONCOKB_TM} annotations, variant-level annotation tables,
            screenshots, or other material that would reproduce {ONCOKB_TM}{' '}
            content.
          </p>
          <p>
            Publications and presentations resulting from the approved
            benchmarking study must appropriately acknowledge {ONCOKB_TM}.
          </p>
          <p>
            When describing benchmark performance, results should be presented
            as measuring agreement with {ONCOKB_TM}. Agreement with {ONCOKB_TM}{' '}
            should not, by itself, be represented as establishing the clinical
            correctness, safety, or clinical validity of a model or method.
          </p>
        </li>

        <li>
          <u>
            {ONCOKB_TM}-derived benchmark data may not be redistributed unless
            approved
          </u>
          <p>
            Unless your approval specifically allows it, you may not publicly
            release or redistribute a benchmark dataset containing {ONCOKB_TM}{' '}
            annotations, classifications, or other {ONCOKB_TM}-derived labels.
          </p>
          <p>
            This restriction also applies when the underlying variants or cohort
            are publicly available if those variants have been paired with
            {ONCOKB_TM}-derived annotations or labels.
          </p>
          <p>
            If you would like to release a benchmark dataset containing{''}
            {ONCOKB_TM}-derived information, you must obtain separate approval
            before doing so.
          </p>
        </li>

        <li>
          <u>
            {ONCOKB_TM} annotations obtained from third-party sources remain
            subject to applicable restrictions
          </u>
          <p>
            If you obtain {ONCOKB_TM} annotations through a cohort dataset, data
            export, publication supplement, repository, or another third-party
            source, you are responsible for confirming that your use of those
            annotations is permitted for the approved benchmarking study.
          </p>
          <p>
            The availability of {ONCOKB_TM}-derived information through another
            source does not necessarily provide permission to reuse, publish, or
            redistribute that information.
          </p>
        </li>

        <li>
          <u>Approval is limited to this study</u>
          <p>
            This agreement applies only to the approved benchmarking study
            described above.
          </p>
          <p>
            Please contact {ONCOKB_TM} before making significant changes to the
            approved study, including:
          </p>
          <ul>
            <li>evaluating a different model or method;</li>
            <li>adding substantially different cohorts or datasets;</li>
            <li>
              substantially increasing the number or scope of {ONCOKB_TM}{' '}
              queries;
            </li>
            <li>
              using {ONCOKB_TM} results to develop or improve the evaluated
              system; or
            </li>
            <li>
              publicly releasing an {ONCOKB_TM}-derived benchmark or benchmark
              dataset.
            </li>
          </ul>
          <p>
            Public rankings, certification programs, commercial comparisons, or
            statements suggesting that {ONCOKB_TM} or Memorial Sloan Kettering
            Cancer Center endorses, certifies, or validates a model, method,
            product, or organization require separate written authorization.
          </p>
        </li>
      </ol>

      <h5>Relationship to Other OncoKB Terms</h5>
      <p>
        This agreement supplements, and does not replace, any other {ONCOKB_TM}{' '}
        license, terms of use, data-use agreement, or other agreement that
        applies to your access to or use of {ONCOKB_TM}.
      </p>
    </div>
  );
};
