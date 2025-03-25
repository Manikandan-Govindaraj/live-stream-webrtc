import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RemotePeerComponent } from "./component/remote-peer/remote-peer.component";
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  imports: [RemotePeerComponent]
})
export class AppComponent {
}