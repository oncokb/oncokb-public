import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { ITokenStats, defaultValue } from 'app/shared/model/token-stats.model';

export const ACTION_TYPES = {
  FETCH_TOKENSTATS_LIST: 'tokenStats/FETCH_TOKENSTATS_LIST',
  FETCH_TOKENSTATS: 'tokenStats/FETCH_TOKENSTATS',
  CREATE_TOKENSTATS: 'tokenStats/CREATE_TOKENSTATS',
  UPDATE_TOKENSTATS: 'tokenStats/UPDATE_TOKENSTATS',
  DELETE_TOKENSTATS: 'tokenStats/DELETE_TOKENSTATS',
  RESET: 'tokenStats/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<ITokenStats>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false
};

export type TokenStatsState = Readonly<typeof initialState>;

// Reducer

export default (state: TokenStatsState = initialState, action): TokenStatsState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_TOKENSTATS_LIST):
    case REQUEST(ACTION_TYPES.FETCH_TOKENSTATS):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_TOKENSTATS):
    case REQUEST(ACTION_TYPES.UPDATE_TOKENSTATS):
    case REQUEST(ACTION_TYPES.DELETE_TOKENSTATS):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_TOKENSTATS_LIST):
    case FAILURE(ACTION_TYPES.FETCH_TOKENSTATS):
    case FAILURE(ACTION_TYPES.CREATE_TOKENSTATS):
    case FAILURE(ACTION_TYPES.UPDATE_TOKENSTATS):
    case FAILURE(ACTION_TYPES.DELETE_TOKENSTATS):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_TOKENSTATS_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_TOKENSTATS):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_TOKENSTATS):
    case SUCCESS(ACTION_TYPES.UPDATE_TOKENSTATS):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_TOKENSTATS):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {}
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

const apiUrl = 'api/token-stats';

// Actions

export const getEntities: ICrudGetAllAction<ITokenStats> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_TOKENSTATS_LIST,
  payload: axios.get<ITokenStats>(`${apiUrl}?cacheBuster=${new Date().getTime()}`)
});

export const getEntity: ICrudGetAction<ITokenStats> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_TOKENSTATS,
    payload: axios.get<ITokenStats>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<ITokenStats> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_TOKENSTATS,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<ITokenStats> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_TOKENSTATS,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<ITokenStats> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_TOKENSTATS,
    payload: axios.delete(requestUrl)
  });
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
