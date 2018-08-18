import { combineEpics, Epic, ofType } from 'redux-observable';
import { from, Observable } from 'rxjs';
import { tap, ignoreElements, withLatestFrom, switchMap, mapTo, map } from 'rxjs/operators';
import * as monaco from 'monaco-editor';

import {
  ChangeLanguageAction,
  LanguageDidChangeAction,
  SaveAxtion,
  ExecutionAction,
  ExecutionOutputAction,
} from 'actions';
import { State } from 'reducer';
import { CodeDatabase } from 'services/storage';
import { Executor } from 'services/execution';
import { Dispatch } from 'redux';
import { ServerConnection } from 'services/connection';
// import { ws$ } from 'services/connection';

export type Dependencies = {
  textModel: monaco.editor.ITextModel;
  db: CodeDatabase;
  serverConnection: ServerConnection;
};

export type InputAction = ChangeLanguageAction | SaveAxtion | ExecutionAction;
export type OutputAction = InputAction | LanguageDidChangeAction;

export type EpicType = Epic<InputAction, any, State, Dependencies>;

const changeLanguageEpic: EpicType = (action$, state$, { textModel }) =>
  action$.pipe(
    ofType('LANGUAGE_CHANGE'),
    tap(({ language }: ChangeLanguageAction) => monaco.editor.setModelLanguage(textModel, language)),
    ignoreElements(),
  );

const languageDidChangeEpic: EpicType = (action$, state$, { textModel }) => {
  return new Observable<LanguageDidChangeAction>(observer => {
    const disposer = textModel.onDidChangeLanguage(e => {
      observer.next({
        type: 'LANGUAGE_DID_CHANGE',
        language: e.newLanguage,
      });
    });
    return disposer.dispose.bind(disposer);
  });
};

const saveEpic: EpicType = (action$, state$, { db, textModel }) =>
  action$.pipe(
    ofType('SAVE'),
    withLatestFrom(state$),
    switchMap(([_, state]) =>
      from(
        db.code.add({
          id: state.codeId,
          content: textModel.getValue(),
          language: state.language,
        }),
      ),
    ),
    mapTo({
      type: 'SAVE_SUCCESS',
    }),
  );

const executionEpic: EpicType = (action$, state$, { textModel }) =>
  action$.pipe(
    ofType('EXECUTION'),
    map(({ id }: ExecutionAction) => (dispatch: Dispatch<ExecutionOutputAction>) => {
      function onOutput(...args: any[]) {
        dispatch({
          type: 'EXECUTUON_OUTPUT',
          id,
          data: args,
        });
      }
      // exec(onOutput, id, textModel.getValue());
    }),
  );

// const connectionEpic: EpicType = (action$, state$) => ws$.pipe(ignoreElements());

export const epic = combineEpics<any, any, State, Dependencies>(
  changeLanguageEpic,
  languageDidChangeEpic,
  saveEpic,
  executionEpic,
  // connectionEpic,
);
