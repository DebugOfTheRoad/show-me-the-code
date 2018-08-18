import { OrderedMap } from 'immutable';

import {
  LanguageDidChangeAction,
  FontSizeChangeAction,
  ExecutionAction,
  ExecutionOutputAction,
  ClearAction,
  ConnectedAction,
} from './actions';

export type State = {
  clientId: string;
  codeId: string;
  language: string;
  fontSize: number;
  output: OrderedMap<string, any[][]>;
};

const INITIAL_STATE: State = {
  clientId: '',
  codeId: '',
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
  | ConnectedAction;

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
    default:
      return state;
  }
}

export default reducer;
