import { inject, observer } from 'mobx-react';
import React, { useState } from 'react';
import AuthenticationStore from './store/AuthenticationStore';
import { FormTextAreaField } from './shared/textarea/FormTextAreaField';
import { AvForm } from 'availity-reactstrap-validation';
import { Button } from 'react-bootstrap';
import { action, observable } from 'mobx';

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
  handleValidSubmit(event: any, values: any) {}

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
