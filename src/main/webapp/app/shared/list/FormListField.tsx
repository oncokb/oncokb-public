import React from 'react';
import { observer } from 'mobx-react';
import styles from './styles.module.scss';
import { Row, Col, Button } from 'react-bootstrap';
import { AvGroup, AvInput } from 'availity-reactstrap-validation';
import autobind from 'autobind-decorator';
import { action, observable } from 'mobx';
import { PillButton } from '../button/PillButton';

type IListBoxProps = {
  list: string[];
  conflictingItems?: string[];
  onDelete: (item: string) => void;
};

@observer
class ListBox extends React.Component<IListBoxProps> {
  render() {
    return (
      <div className={styles.list_container}>
        <div className={styles.main}>
          {this.props.list.map(item => (
            <PillButton
              key={item}
              content={item}
              onDelete={this.props.onDelete}
              hasWarning={this.props.conflictingItems?.includes(item)}
            />
          ))}
        </div>
      </div>
    );
  }
}

type IFormListFieldProps = {
  list: string[];
  conflictingItems?: string[];
  addItem: (item: string) => void;
  deleteItem: (item: string) => void;
  labelText: string;
  placeholder?: string;
  boldLabel?: boolean;
};

@observer
export class FormListField extends React.Component<IFormListFieldProps> {
  @observable isInputValid = false;
  @observable inputText = '';
  @observable errorMessage = '';
  @observable showError = false;

  @autobind
  listLengthValidation(
    value: any,
    context: any,
    input: any,
    cb: (isValid: boolean | string) => void
  ) {
    if (this.props.list.length > 0) {
      cb(true);
    } else {
      cb(false);
      this.errorMessage = 'List cannot be empty!';
    }
  }

  @action.bound
  domainValidation() {
    if (this.inputText.length === 0) {
      this.errorMessage = '';
      return false;
    } else if (
      this.props.list.includes(this.inputText) ||
      !this.inputText.includes('.')
    ) {
      this.errorMessage = 'Domain is not valid';
      return false;
    }
    this.errorMessage = '';
    return true;
  }

  @action.bound
  onEnterKey(event: any) {
    if (event.which === 13 && this.isInputValid) {
      this.props.addItem(this.inputText);
      this.inputText = '';
      this.isInputValid = this.domainValidation();
    }
  }

  render() {
    return (
      <AvGroup>
        <Row>
          <Col>
            <div
              className={`mb-2 ${
                this.props.boldLabel ? 'font-weight-bold' : ''
              }`}
            >
              {this.props.labelText}
            </div>
            <div className="input-group">
              <AvInput
                name="listItemInput"
                placeholder={this.props.placeholder || ''}
                value={this.inputText}
                onChange={(event: any) => {
                  this.inputText = event.target.value;
                  this.isInputValid = this.domainValidation();
                }}
                validate={{
                  customLength: this.listLengthValidation,
                }}
                onKeyPress={this.onEnterKey}
                onBlur={() => {
                  // Only show the list length error message when the user clicks off the input
                  if (this.errorMessage) {
                    this.showError = true;
                  }
                }}
              />
              <div className="input-group-append">
                <Button
                  className={`${styles.add} btn btn-light`}
                  style={{ zIndex: 0 }}
                  onClick={() => {
                    this.props.addItem(this.inputText);
                    this.inputText = '';
                    this.isInputValid = this.domainValidation();
                  }}
                  disabled={!this.isInputValid}
                >
                  Add
                </Button>
              </div>
              <span
                className="text-danger"
                style={{
                  width: '100%',
                  marginTop: '0.25rem',
                  fontSize: '80%',
                }}
              >
                {this.showError && this.errorMessage}
              </span>
            </div>
          </Col>
          <Col>
            <ListBox
              list={this.props.list}
              onDelete={(item: string) => this.props.deleteItem(item)}
              conflictingItems={this.props.conflictingItems}
            />
          </Col>
        </Row>
      </AvGroup>
    );
  }
}
