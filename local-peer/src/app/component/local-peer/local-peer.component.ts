import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WebrtcService } from '../../services/webrtc.service';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-local-peer',
  templateUrl: './local-peer.component.html',
  styleUrls: ['./local-peer.component.css']
})
export class LocalPeerComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  private subscriptions: Subscription[] = [];
  public isMediaReady = false;

  constructor(
    private webrtcService: WebrtcService,
    private websocketService: WebsocketService
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      await this.webrtcService.startLocalMedia();
      const stream = this.webrtcService.getLocalStream();
      if (stream && this.localVideo) {
        this.localVideo.nativeElement.srcObject = stream;
        this.isMediaReady = true;
      }
      this.setupWebRTCEventListeners();
    } catch (error) {
      console.error('Media initialization failed:', error);
    }
  }

  private setupWebRTCEventListeners(): void {
    this.subscriptions.push(
      this.webrtcService.remoteStream$.subscribe((stream: MediaStream | null) => {
        if (stream && this.remoteVideo) {
          this.remoteVideo.nativeElement.srcObject = stream;
          this.remoteVideo.nativeElement.play().catch((e: any) =>
            console.log('Video play error:', e));
        }
      }),

      this.websocketService.onMessage('answer').subscribe((answer: RTCSessionDescriptionInit) => {
        this.webrtcService.handleAnswer(answer);
      }),

      this.websocketService.onMessage('ice-candidate').subscribe((candidate: RTCIceCandidateInit) => {
        this.webrtcService.handleIceCandidate(candidate);
      })
    );
  }

  async startCall(): Promise<void> {
    if (!this.isMediaReady) {
      console.warn('Media not initialized yet');
      return;
    }

    try {
      await this.webrtcService.startCall();
    } catch (error) {
      console.error('Call failed:', error);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
    this.webrtcService.cleanup();
  }
}