import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IToken, defaultValue } from 'app/shared/model/token.model';

export const ACTION_TYPES = {
  FETCH_TOKEN_LIST: 'token/FETCH_TOKEN_LIST',
  FETCH_TOKEN: 'token/FETCH_TOKEN',
  CREATE_TOKEN: 'token/CREATE_TOKEN',
  UPDATE_TOKEN: 'token/UPDATE_TOKEN',
  DELETE_TOKEN: 'token/DELETE_TOKEN',
  RESET: 'token/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IToken>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false
};

export type TokenState = Readonly<typeof initialState>;

// Reducer

export default (state: TokenState = initialState, action): TokenState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_TOKEN_LIST):
    case REQUEST(ACTION_TYPES.FETCH_TOKEN):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_TOKEN):
    case REQUEST(ACTION_TYPES.UPDATE_TOKEN):
    case REQUEST(ACTION_TYPES.DELETE_TOKEN):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_TOKEN_LIST):
    case FAILURE(ACTION_TYPES.FETCH_TOKEN):
    case FAILURE(ACTION_TYPES.CREATE_TOKEN):
    case FAILURE(ACTION_TYPES.UPDATE_TOKEN):
    case FAILURE(ACTION_TYPES.DELETE_TOKEN):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_TOKEN_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_TOKEN):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_TOKEN):
    case SUCCESS(ACTION_TYPES.UPDATE_TOKEN):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_TOKEN):
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

const apiUrl = 'api/tokens';

// Actions

export const getEntities: ICrudGetAllAction<IToken> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_TOKEN_LIST,
  payload: axios.get<IToken>(`${apiUrl}?cacheBuster=${new Date().getTime()}`)
});

export const getEntity: ICrudGetAction<IToken> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_TOKEN,
    payload: axios.get<IToken>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IToken> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_TOKEN,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IToken> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_TOKEN,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IToken> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_TOKEN,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
