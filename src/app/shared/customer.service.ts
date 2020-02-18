import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Customer } from './customer';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import * as process from 'process';

let WSHOST = process.env.WSHOST || "ws://localhost:4000/";
let TESTEMAIL = process.env.TESTEMAIL || "Billy.Bob@imegcorp.com";

class Action {
  ParameterName?: string;
  Action?: string;
  ParentElementUniqueId?: string;
  Value?: string;
  GUID?: string;
  BUILTIN?: string;
  DocumentHashCode?: string;
  RevitWsSessionId?: string;
  Token?: string;
};

@Injectable({
  providedIn: 'root' 
})
export class CustomerService {
  
  _webSocket: WebSocketSubject<any>;

  constructor() {
    this._webSocket = webSocket({ url: WSHOST });
    if (this._webSocket) {
      this._webSocket.subscribe(
        msg => console.log('message received: ' + msg), // Called whenever there is a message from the server.
        err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
        () => console.log('complete') // Called when connection is closed (for whatever reason).
      );
      console.log("Connected using Web Socket");
    }
  }

  // Http Headers
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  // Error Handling
  errorHandl(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

  // WebSockets methods from here

  _SetEmailAddress() {
    var action:Action={};
    action.Action = "setEmailWebClient";
    //TODO once authentication is work need to send users email address
    action.Value = TESTEMAIL;
    //action.ParentElementUniqueId;
    this._webSocket.next(action);
  }

  // Get JSON data using websocket
  _SyncWithWsRevitElementData() {
    var action:Action={};
    action.Action = "getJsonAll";
    //action.ParentElementUniqueId;
    this._webSocket.next(action);
    return this._webSocket.asObservable();
  }

  // Update Parameter by GUId or BUILTIN using WebSocket
  _UpdateRevitParameter(uniqueId, value, GUID,BUILTIN,DocumentHashCode,RevitWsSessionId): Observable<any> {
    var action:Action = new Action();
    action.Action = "setParameter";
    action.GUID = GUID;
    action.ParentElementUniqueId = uniqueId;
    action.Value = value;
    action.BUILTIN = BUILTIN;
    action.DocumentHashCode = DocumentHashCode;
    action.RevitWsSessionId = RevitWsSessionId;
    this._webSocket.next(action);
    return this._webSocket.asObservable();
  }

  _sendToken(token){
    var action:Action = new Action();
    action.Action = "token";
    action.Token = token;
    this._webSocket.next(action);
    return this._webSocket.asObservable(); 
  }

}