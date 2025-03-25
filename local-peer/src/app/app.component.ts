import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { LocalPeerComponent } from "./component/local-peer/local-peer.component";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  imports: [LocalPeerComponent]
})
export class AppComponent {
}
