import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IUserDetails, defaultValue } from 'app/shared/model/user-details.model';

export const ACTION_TYPES = {
  FETCH_USERDETAILS_LIST: 'userDetails/FETCH_USERDETAILS_LIST',
  FETCH_USERDETAILS: 'userDetails/FETCH_USERDETAILS',
  CREATE_USERDETAILS: 'userDetails/CREATE_USERDETAILS',
  UPDATE_USERDETAILS: 'userDetails/UPDATE_USERDETAILS',
  DELETE_USERDETAILS: 'userDetails/DELETE_USERDETAILS',
  RESET: 'userDetails/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IUserDetails>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false
};

export type UserDetailsState = Readonly<typeof initialState>;

// Reducer

export default (state: UserDetailsState = initialState, action): UserDetailsState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_USERDETAILS_LIST):
    case REQUEST(ACTION_TYPES.FETCH_USERDETAILS):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_USERDETAILS):
    case REQUEST(ACTION_TYPES.UPDATE_USERDETAILS):
    case REQUEST(ACTION_TYPES.DELETE_USERDETAILS):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_USERDETAILS_LIST):
    case FAILURE(ACTION_TYPES.FETCH_USERDETAILS):
    case FAILURE(ACTION_TYPES.CREATE_USERDETAILS):
    case FAILURE(ACTION_TYPES.UPDATE_USERDETAILS):
    case FAILURE(ACTION_TYPES.DELETE_USERDETAILS):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_USERDETAILS_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_USERDETAILS):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_USERDETAILS):
    case SUCCESS(ACTION_TYPES.UPDATE_USERDETAILS):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_USERDETAILS):
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

const apiUrl = 'api/user-details';

// Actions

export const getEntities: ICrudGetAllAction<IUserDetails> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_USERDETAILS_LIST,
  payload: axios.get<IUserDetails>(`${apiUrl}?cacheBuster=${new Date().getTime()}`)
});

export const getEntity: ICrudGetAction<IUserDetails> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_USERDETAILS,
    payload: axios.get<IUserDetails>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IUserDetails> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_USERDETAILS,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IUserDetails> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_USERDETAILS,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IUserDetails> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_USERDETAILS,
    payload: axios.delete(requestUrl)
  });
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
