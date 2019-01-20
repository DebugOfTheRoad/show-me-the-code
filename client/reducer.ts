import { OrderedMap, Record, Map } from 'immutable';

import {
  LanguageDidChangeAction,
  FontSizeChangeAction,
  ExecutionAction,
  ExecutionOutputAction,
  ClearAction,
  ConnectedAction,
  CreateAction,
  JoinStartAction,
  JoinAcceptedAction,
  JoinRejectAction,
  JoinAckAction,
  DisconnectAction,
  ClientLeaveAction,
  UserNameChangeAction,
} from './actions';
import { Client } from './models';

type IState = {
  clientId: string | null;
  codeId: string | '';
  codeName: string | '';
  userName: string;
  hostId: string | null;
  hostName: string;
  clientType: 'host' | 'guest' | null;
  language: string;
  fontSize: number;
  clients: Map<string, Client>;
  output: OrderedMap<string, any[][]>;
};

export type State = Record<IState> & Readonly<IState>;

const StateRecord = Record<IState>({
  clientId: null,
  codeId: '',
  codeName: '',
  userName: '',
  hostId: null,
  clientType: null,
  language: 'javascript',
  fontSize: 12,
  clients: Map(),
  output: OrderedMap(),
  hostName: '',
});

type Action =
  | LanguageDidChangeAction
  | FontSizeChangeAction
  | ExecutionAction
  | ExecutionOutputAction
  | ClearAction
  | ConnectedAction
  | DisconnectAction
  | CreateAction
  | JoinStartAction
  | JoinAcceptedAction
  | JoinRejectAction
  | JoinAckAction
  | ClientLeaveAction
  | UserNameChangeAction;

export function reducer(state = StateRecord(), action: Action): State {
  switch (action.type) {
    case 'LANGUAGE_DID_CHANGE':
      return state.set('language', action.language);
    case 'FONT_SIZE_CHANGE':
      return state.set('fontSize', action.fontSize);
    case 'EXECUTION':
      return state.update('output', output => output.set(action.id, []));
    case 'EXECUTUON_OUTPUT':
      if (!state.output.has(action.id)) {
        return state;
      }
      return state.updateIn(['output', action.id], data => [...data, action.data]);
    case 'CLEAR_OUTPUT':
      return state.set('output', OrderedMap());
    case 'CONNECTED':
      return state.set('clientId', action.id);
    case 'DISCONNECT':
      return state.set('clientId', null);
    case 'CREATE':
      return state.merge({
        clientType: 'host',
        hostId: state.clientId,
        codeId: action.codeId,
        codeName: action.codeName,
        hostName: state.userName,
      });
    case 'JOIN_START':
      return state.merge({
        clientType: 'guest',
      });
    case 'JOIN_ACCEPT':
      return state.merge(action);
    case 'JOIN_REJECT':
      return state.merge({
        clientType: null,
        codeId: '',
      });
    case 'JOIN_ACK':
      return state.setIn(
        ['clients', action.id],
        new Client({
          id: action.id,
          name: action.name,
        }),
      );
    case 'CLIENT_LEAVE':
      return state.deleteIn(['clients', action.clientId]);
    case 'USER_NAME':
      return state.set('userName', action.userName);
    default:
      return state;
  }
}

export default reducer;
