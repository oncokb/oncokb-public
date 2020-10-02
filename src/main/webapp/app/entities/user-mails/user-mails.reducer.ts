import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IUserMails, defaultValue } from 'app/shared/model/user-mails.model';

export const ACTION_TYPES = {
  FETCH_USERMAILS_LIST: 'userMails/FETCH_USERMAILS_LIST',
  FETCH_USERMAILS: 'userMails/FETCH_USERMAILS',
  CREATE_USERMAILS: 'userMails/CREATE_USERMAILS',
  UPDATE_USERMAILS: 'userMails/UPDATE_USERMAILS',
  DELETE_USERMAILS: 'userMails/DELETE_USERMAILS',
  RESET: 'userMails/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IUserMails>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false
};

export type UserMailsState = Readonly<typeof initialState>;

// Reducer

export default (state: UserMailsState = initialState, action): UserMailsState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_USERMAILS_LIST):
    case REQUEST(ACTION_TYPES.FETCH_USERMAILS):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_USERMAILS):
    case REQUEST(ACTION_TYPES.UPDATE_USERMAILS):
    case REQUEST(ACTION_TYPES.DELETE_USERMAILS):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_USERMAILS_LIST):
    case FAILURE(ACTION_TYPES.FETCH_USERMAILS):
    case FAILURE(ACTION_TYPES.CREATE_USERMAILS):
    case FAILURE(ACTION_TYPES.UPDATE_USERMAILS):
    case FAILURE(ACTION_TYPES.DELETE_USERMAILS):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_USERMAILS_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_USERMAILS):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_USERMAILS):
    case SUCCESS(ACTION_TYPES.UPDATE_USERMAILS):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_USERMAILS):
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

const apiUrl = 'api/user-mails';

// Actions

export const getEntities: ICrudGetAllAction<IUserMails> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_USERMAILS_LIST,
  payload: axios.get<IUserMails>(`${apiUrl}?cacheBuster=${new Date().getTime()}`)
});

export const getEntity: ICrudGetAction<IUserMails> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_USERMAILS,
    payload: axios.get<IUserMails>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IUserMails> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_USERMAILS,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IUserMails> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_USERMAILS,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IUserMails> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_USERMAILS,
    payload: axios.delete(requestUrl)
  });
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
