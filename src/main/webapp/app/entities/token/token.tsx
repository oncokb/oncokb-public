import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { ICrudGetAllAction, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities } from './token.reducer';
import { IToken } from 'app/shared/model/token.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ITokenProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export const Token = (props: ITokenProps) => {
  useEffect(() => {
    props.getEntities();
  }, []);

  const { tokenList, match, loading } = props;
  return (
    <div>
      <h2 id="token-heading">
        Tokens
        <Link to={`${match.url}/new`} className="btn btn-primary float-right jh-create-entity" id="jh-create-entity">
          <FontAwesomeIcon icon="plus" />
          &nbsp; Create new Token
        </Link>
      </h2>
      <div className="table-responsive">
        {tokenList && tokenList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Token</th>
                <th>Creation</th>
                <th>Expiration</th>
                <th>Usage Limit</th>
                <th>Current Usage</th>
                <th>Renewable</th>
                <th>User</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tokenList.map((token, i) => (
                <tr key={`entity-${i}`}>
                  <td>
                    <Button tag={Link} to={`${match.url}/${token.id}`} color="link" size="sm">
                      {token.id}
                    </Button>
                  </td>
                  <td>{token.token}</td>
                  <td>{token.creation ? <TextFormat type="date" value={token.creation} format={APP_DATE_FORMAT} /> : null}</td>
                  <td>{token.expiration ? <TextFormat type="date" value={token.expiration} format={APP_DATE_FORMAT} /> : null}</td>
                  <td>{token.usageLimit}</td>
                  <td>{token.currentUsage}</td>
                  <td>{token.renewable ? 'true' : 'false'}</td>
                  <td>{token.user ? token.user.id : ''}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${token.id}`} color="info" size="sm">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${token.id}/edit`} color="primary" size="sm">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${token.id}/delete`} color="danger" size="sm">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Tokens found</div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ token }: IRootState) => ({
  tokenList: token.entities,
  loading: token.loading,
});

const mapDispatchToProps = {
  getEntities,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(Token);
