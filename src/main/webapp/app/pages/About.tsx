import * as React from 'react';

class About extends React.Component<{}> {
  public render() {
    return (
      <React.Fragment>
        <p>
          The INSIGHT resource was developed in a collaboration between the Berger and Taylor labs along with key institutional partners at
          Memorial Sloan Kettering with the goal of establishing a resource of integrated germline and somatic alterations identified by
          clinical sequencing of active cancer patients. Provided here are pathogenic germline variants and their tumor-specific zygosity
          changes by gene, lineage, and cancer type in 17,152 prospectively sequenced cancer patients. All analyses are described in:
        </p>

        <ul>
          <li>Srinivasan P, Bandlamudi C, et al. “The role of germline pathogenicity in tumogenesis” In preparation</li>
        </ul>

        <p>Incremental updates based on increasingly larger cohort analysis will be provided at regular intervals.</p>

        <h5 className="text-center text-uppercase font-weight-bold mt-4">Contributors</h5>

        <p>
          Members of the Berger and Taylor labs along with members of Computational Sciences in the Kravis Center for Molecular Oncology,
          Clinical Bioinformatics in Diagnostic Molecular Pathology, and the Niehaus Center for Inherited Cancer Genomics.
        </p>
      </React.Fragment>
    );
  }
}

export default About;
