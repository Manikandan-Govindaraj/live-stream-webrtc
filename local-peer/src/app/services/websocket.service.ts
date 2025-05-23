import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;

  constructor() {
   //this.socket = io('http://localhost:3000');
   this.socket = io("https://rtcsocket.webpubsub.azure.com", {
      path: "/clients/socketio/hubs/Hub",
    });
  }

  sendMessage(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  onMessage(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => observer.next(data));
    });
  }
}