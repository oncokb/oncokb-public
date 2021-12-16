import React from 'react';
import { Form } from 'react-bootstrap';
import { Oncogenicity } from 'app/components/oncokbMutationMapper/OncokbMutationMapper';

const OncogenicityCheckboxes: React.FunctionComponent<{
  oncogenicities: Oncogenicity[];
  selectedOncogenicities: string[] | undefined;
  onToggle: (oncogenicity: string) => void;
}> = props => {
  return (
    <Form className={'d-flex flex-row-reverse'}>
      <div className="mb-3">
        {props.oncogenicities.map((oncogenicity, index) => (
          <Form.Check
            inline
            onChange={() => undefined}
            onClick={() => props.onToggle(oncogenicity.oncogenicity)}
            checked={
              props.selectedOncogenicities === undefined ||
              props.selectedOncogenicities.includes(oncogenicity.oncogenicity)
            }
            label={`${oncogenicity.counts} ${oncogenicity.oncogenicity}`}
            type={'checkbox'}
            key={`oncogenicity-${index}`}
            id={`oncogenicity-${index}`}
          />
        ))}
      </div>
    </Form>
  );
};
export default OncogenicityCheckboxes;
