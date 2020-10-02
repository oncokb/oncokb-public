import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { ICrudGetAllAction, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities } from './token-stats.reducer';
import { ITokenStats } from 'app/shared/model/token-stats.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ITokenStatsProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export const TokenStats = (props: ITokenStatsProps) => {
  useEffect(() => {
    props.getEntities();
  }, []);

  const { tokenStatsList, match } = props;
  return (
    <div>
      <h2 id="token-stats-heading">
        Token Stats
        <Link to={`${match.url}/new`} className="btn btn-primary float-right jh-create-entity" id="jh-create-entity">
          <FontAwesomeIcon icon="plus" />
          &nbsp; Create new Token Stats
        </Link>
      </h2>
      <div className="table-responsive">
        {tokenStatsList && tokenStatsList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Access Ip</th>
                <th>Resource</th>
                <th>Access Time</th>
                <th>Usage Count</th>
                <th>Token</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tokenStatsList.map((tokenStats, i) => (
                <tr key={`entity-${i}`}>
                  <td>
                    <Button tag={Link} to={`${match.url}/${tokenStats.id}`} color="link" size="sm">
                      {tokenStats.id}
                    </Button>
                  </td>
                  <td>{tokenStats.accessIp}</td>
                  <td>{tokenStats.resource}</td>
                  <td>
                    <TextFormat type="date" value={tokenStats.accessTime} format={APP_DATE_FORMAT} />
                  </td>
                  <td>{tokenStats.usageCount}</td>
                  <td>{tokenStats.token ? <Link to={`token/${tokenStats.token.id}`}>{tokenStats.token.id}</Link> : ''}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${tokenStats.id}`} color="info" size="sm">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${tokenStats.id}/edit`} color="primary" size="sm">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${tokenStats.id}/delete`} color="danger" size="sm">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="alert alert-warning">No Token Stats found</div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ tokenStats }: IRootState) => ({
  tokenStatsList: tokenStats.entities
});

const mapDispatchToProps = {
  getEntities
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(TokenStats);
