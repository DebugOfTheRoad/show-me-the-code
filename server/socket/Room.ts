/// <reference types="socket.io" />
/// <reference types="monaco-editor" />

/// <reference path="../../model/socket.d.ts" />
/// <reference path="../../model/IDisposable.d.ts" />

import * as createDebug from 'debug';
import * as models from '../models';
import Manager from './Manager';

const debug = createDebug('ROOM');

export default class Room implements IDisposable {
  clients: Map<Symbol, SocketIO.Socket> = new Map()
  id: string
  code: string = ''
  selections: Array<monaco.ISelection> = [{
    selectionStartLineNumber: 1,
    selectionStartColumn: 1,
    positionLineNumber: 1,
    positionColumn: 1
  }];
  _language: string = 'javascript'
  manager: Manager
  version = 1

  get language() {
    return this._language;
  }

  set language(value) {
    this._language = value.trim();
  }

  constructor(id: string, manager: Manager, code: string, language: string) {
    this.id = id;
    this.manager = manager;
    this.code = code;
    this.language = language;
  }

  async save() {
    await models.Room.update({
      code: this.code,
      lang: this.language,
      last_time: Date.now()
    }, {
      where: {
        id: this.id
      }
    });
  }

  join(userName: string, socket: SocketIO.Socket) {
    debug(`${userName} join room ${this.id}`);
    const sym = Symbol(userName);
    this.clients.set(sym, socket);
    socket.join(this.id);
    debug(`${Array.from(this.clients.keys()).map(it => it.toString())}`)
    socket.emit('room.success', {
      clients: Array.from(this.clients.keys()),
      code: this.code,
      language: this.language
    });

    socket.on('code.change', (codeChange: ISocketCodeChange) => {
      if (this.code !== codeChange.value) {
        this.code = codeChange.value;
        this.selections = codeChange.selections;
        codeChange.ident = this.version;
        this.version += 1;
        socket.broadcast.to(this.id).emit('code.change', codeChange);
      }
    });

    socket.on('selection.change', (selections: monaco.ISelection[]) => {
      this.selections = selections;
      socket.broadcast.to(this.id).emit('selection.change', selections);
    });

    socket.on('save', () => {
      this.save();
    });

    socket.on('disconnect', () => {
      this.clients.delete(sym);
      if (this.clients.size === 0) {
        this.dispose();
      }
    });
  }

  dispose() {
    this.save();
    this.manager.rooms.delete(this.id);
    this.manager = null;
    this.clients = null;
  }
}
