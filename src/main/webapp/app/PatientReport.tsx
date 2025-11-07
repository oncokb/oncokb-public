import { inject, observer } from 'mobx-react';
import React from 'react';
import AuthenticationStore from './store/AuthenticationStore';
import { FormTextAreaField } from './shared/textarea/FormTextAreaField';
import { AvForm } from 'availity-reactstrap-validation';
import { Button } from 'react-bootstrap';
import { action, observable } from 'mobx';
import { getStoredUserToken } from './indexUtils';

interface IPatientReportPageProps {
  authenticationStore: AuthenticationStore;
}

@inject('authenticationStore')
@observer
export default class PatientReportPage extends React.Component<
  IPatientReportPageProps
> {
  @observable mutations = '';
  @observable copyNumberAlterations = '';
  @observable structuralVariants = '';

  @action.bound
  handleValidSubmit() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'http://localhost:5173/report/tsv';
    form.target = '_blank';

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'token';
    tokenInput.value = getStoredUserToken();
    form.appendChild(tokenInput);

    const mutationsInput = document.createElement('input');
    mutationsInput.type = 'hidden';
    mutationsInput.name = 'mutations';
    mutationsInput.value = this.mutations;
    form.appendChild(mutationsInput);

    const copyNumberAlterationsInput = document.createElement('input');
    copyNumberAlterationsInput.type = 'hidden';
    copyNumberAlterationsInput.name = 'copyNumberAlterations';
    copyNumberAlterationsInput.value = this.copyNumberAlterations;
    form.appendChild(copyNumberAlterationsInput);

    const structuralVariantsInput = document.createElement('input');
    structuralVariantsInput.type = 'hidden';
    structuralVariantsInput.name = 'structuralVariants';
    structuralVariantsInput.value = this.structuralVariants;
    form.appendChild(structuralVariantsInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  render() {
    if (!this.props.authenticationStore.isUserAuthenticated) {
      return <div>Please login</div>;
    }

    return (
      <AvForm onValidSubmit={this.handleValidSubmit}>
        <FormTextAreaField
          allowFileUpload
          label="Mutations"
          value={this.mutations}
          onTextAreaChange={event => (this.mutations = event.target.value)}
          rows={5}
        />
        <FormTextAreaField
          allowFileUpload
          label="Copy Number Alterations"
          value={this.copyNumberAlterations}
          onTextAreaChange={event =>
            (this.copyNumberAlterations = event.target.value)
          }
          rows={5}
        />
        <FormTextAreaField
          allowFileUpload
          label="Structural Variants"
          value={this.structuralVariants}
          onTextAreaChange={event =>
            (this.structuralVariants = event.target.value)
          }
          rows={5}
        />
        <Button type="submit">Submit</Button>
      </AvForm>
    );
  }
}
