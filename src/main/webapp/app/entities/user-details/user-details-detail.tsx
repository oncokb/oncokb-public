import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
// tslint:disable-next-line:no-unused-variable
import { ICrudGetAction } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './user-details.reducer';
import { IUserDetails } from 'app/shared/model/user-details.model';
// tslint:disable-next-line:no-unused-variable
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IUserDetailsDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export class UserDetailsDetail extends React.Component<IUserDetailsDetailProps> {
  componentDidMount() {
    this.props.getEntity(this.props.match.params.id);
  }

  render() {
    const { userDetailsEntity } = this.props;
    return (
      <Row>
        <Col md="8">
          <h2>
            UserDetails [<b>{userDetailsEntity.id}</b>]
          </h2>
          <dl className="jh-entity-details">
            <dt>
              <span id="accountType">Account Type</span>
            </dt>
            <dd>{userDetailsEntity.accountType}</dd>
            <dt>
              <span id="jobTitle">Job Title</span>
            </dt>
            <dd>{userDetailsEntity.jobTitle}</dd>
            <dt>
              <span id="company">Company</span>
            </dt>
            <dd>{userDetailsEntity.company}</dd>
            <dt>
              <span id="city">City</span>
            </dt>
            <dd>{userDetailsEntity.city}</dd>
            <dt>
              <span id="country">Country</span>
            </dt>
            <dd>{userDetailsEntity.country}</dd>
            <dt>
              <span id="address">Address</span>
            </dt>
            <dd>{userDetailsEntity.address}</dd>
            <dt>User</dt>
            <dd>{userDetailsEntity.userId ? userDetailsEntity.userId : ''}</dd>
          </dl>
          <Button tag={Link} to="/entity/user-details" replace color="info">
            <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
          </Button>
          &nbsp;
          <Button tag={Link} to={`/entity/user-details/${userDetailsEntity.id}/edit`} replace color="primary">
            <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
          </Button>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = ({ userDetails }: IRootState) => ({
  userDetailsEntity: userDetails.entity
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserDetailsDetail);
