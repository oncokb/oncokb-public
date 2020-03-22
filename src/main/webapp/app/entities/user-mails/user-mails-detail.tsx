import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { ICrudGetAction, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './user-mails.reducer';
import { IUserMails } from 'app/shared/model/user-mails.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IUserMailsDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const UserMailsDetail = (props: IUserMailsDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { userMailsEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2>
          UserMails [<b>{userMailsEntity.id}</b>]
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="sentDate">Sent Date</span>
          </dt>
          <dd>
            <TextFormat value={userMailsEntity.sentDate} type="date" format={APP_DATE_FORMAT} />
          </dd>
          <dt>
            <span id="sentBy">Sent By</span>
          </dt>
          <dd>{userMailsEntity.sentBy}</dd>
          <dt>
            <span id="mailType">Mail Type</span>
          </dt>
          <dd>{userMailsEntity.mailType}</dd>
          <dt>
            <span id="sentFrom">Sent From</span>
          </dt>
          <dd>{userMailsEntity.sentFrom}</dd>
          <dt>User</dt>
          <dd>{userMailsEntity.userLogin ? userMailsEntity.userLogin : ''}</dd>
        </dl>
        <Button tag={Link} to="/user-mails" replace color="info">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/user-mails/${userMailsEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ userMails }: IRootState) => ({
  userMailsEntity: userMails.entity
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(UserMailsDetail);
