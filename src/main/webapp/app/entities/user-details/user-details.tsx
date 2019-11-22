import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { ICrudGetAllAction } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities } from './user-details.reducer';
import { IUserDetails } from 'app/shared/model/user-details.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IUserDetailsProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export class UserDetails extends React.Component<IUserDetailsProps> {
  componentDidMount() {
    this.props.getEntities();
  }

  render() {
    const { userDetailsList, match } = this.props;
    return (
      <div>
        <h2 id="user-details-heading">
          User Details
          <Link to={`${match.url}/new`} className="btn btn-primary float-right jh-create-entity" id="jh-create-entity">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create a new User Details
          </Link>
        </h2>
        <div className="table-responsive">
          {userDetailsList && userDetailsList.length > 0 ? (
            <Table responsive aria-describedby="user-details-heading">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>License Type</th>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>City</th>
                  <th>Country</th>
                  <th>Address</th>
                  <th>User</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {userDetailsList.map((userDetails, i) => (
                  <tr key={`entity-${i}`}>
                    <td>
                      <Button tag={Link} to={`${match.url}/${userDetails.id}`} color="link" size="sm">
                        {userDetails.id}
                      </Button>
                    </td>
                    <td>{userDetails.licenseType}</td>
                    <td>{userDetails.jobTitle}</td>
                    <td>{userDetails.company}</td>
                    <td>{userDetails.city}</td>
                    <td>{userDetails.country}</td>
                    <td>{userDetails.address}</td>
                    <td>{userDetails.userId ? userDetails.userId : ''}</td>
                    <td className="text-right">
                      <div className="btn-group flex-btn-group-container">
                        <Button tag={Link} to={`${match.url}/${userDetails.id}`} color="info" size="sm">
                          <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                        </Button>
                        <Button tag={Link} to={`${match.url}/${userDetails.id}/edit`} color="primary" size="sm">
                          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                        </Button>
                        <Button tag={Link} to={`${match.url}/${userDetails.id}/delete`} color="danger" size="sm">
                          <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="alert alert-warning">No User Details found</div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ userDetails }: IRootState) => ({
  userDetailsList: userDetails.entities
});

const mapDispatchToProps = {
  getEntities
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserDetails);
