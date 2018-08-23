import { OrderedMap } from 'immutable';

import {
  LanguageDidChangeAction,
  FontSizeChangeAction,
  ExecutionAction,
  ExecutionOutputAction,
  ClearAction,
  ConnectedAction,
  CreateAction,
  JoinAction,
} from './actions';

export type State = {
  clientId: string | null;
  codeId: string | null;
  codeName: string | null;
  userName: string;
  clientType: 'host' | 'guest' | null;
  language: string;
  fontSize: number;
  output: OrderedMap<string, any[][]>;
};

const INITIAL_STATE: State = {
  clientId: null,
  codeId: null,
  codeName: null,
  userName: '',
  clientType: null,
  language: 'javascript',
  fontSize: 12,
  output: OrderedMap(),
};

type Action =
  | LanguageDidChangeAction
  | FontSizeChangeAction
  | ExecutionAction
  | ExecutionOutputAction
  | ClearAction
  | ConnectedAction
  | CreateAction
  | JoinAction;

export function reducer(state: State = INITIAL_STATE, action: Action): State {
  switch (action.type) {
    case 'LANGUAGE_DID_CHANGE':
      return {
        ...state,
        language: action.language,
      };
    case 'FONT_SIZE_CHANGE':
      return {
        ...state,
        fontSize: action.fontSize,
      };
    case 'EXECUTION':
      return {
        ...state,
        output: state.output.set(action.id, []),
      };
    case 'EXECUTUON_OUTPUT':
      if (!state.output.has(action.id)) {
        return state;
      }
      return {
        ...state,
        output: state.output.update(action.id, data => [...data, action.data]),
      };
    case 'CLEAR_OUTPUT':
      return {
        ...state,
        output: OrderedMap(),
      };
    case 'CONNECTED':
      return {
        ...state,
        clientId: action.id,
      };
    case 'CREATE':
      return {
        ...state,
        clientType: 'host',
        codeId: action.codeId,
        codeName: action.codeName,
        userName: action.userName,
      };
    case 'JOIN':
      return {
        ...state,
        clientType: 'guest',
        codeName: action.codeId,
        userName: action.userName,
      };
    default:
      return state;
  }
}

export default reducer;
