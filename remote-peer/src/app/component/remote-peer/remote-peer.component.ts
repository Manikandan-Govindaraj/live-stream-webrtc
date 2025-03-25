import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WebrtcService } from '../../services/webrtc.service';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-remote-peer',
  templateUrl: './remote-peer.component.html',
  styleUrls: ['./remote-peer.component.css']
})
export class RemotePeerComponent implements OnInit, OnDestroy {
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  private subscriptions: Subscription[] = [];
  public showPlayButton = false;

  constructor(
    private webrtcService: WebrtcService,
    private websocketService: WebsocketService
  ) { }

  ngOnInit(): void {
    this.setupWebRTCEventListeners();
  }

  private setupWebRTCEventListeners(): void {
    this.subscriptions.push(
      this.webrtcService.remoteStream$.subscribe(stream => {
        if (stream && this.remoteVideo) {
          console.log('Received remote stream with tracks:', stream.getTracks().length);
          this.remoteVideo.nativeElement.srcObject = stream;
          this.attemptVideoPlayback();
        }
      }),

      this.websocketService.onMessage('offer').subscribe(offer => {
        console.log('Received offer');
        this.webrtcService.handleOffer(offer);
      }),

      this.websocketService.onMessage('ice-candidate').subscribe(candidate => {
        console.log('Received ICE candidate');
        this.webrtcService.handleIceCandidate(candidate);
      })
    );
  }

  attemptVideoPlayback(): void {
    const video = this.remoteVideo.nativeElement;
    // video.muted = true; Start muted to comply with autoplay policies

    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('Video playback started successfully');
        this.showPlayButton = false;
      })
        .catch(error => {
          console.warn('Automatic playback failed, showing play button:', error);
          this.showPlayButton = true;
        });
    }
  }

  onPlayButtonClick(): void {
    const video = this.remoteVideo.nativeElement;
    video.play()
      .then(() => {
        console.log('Video playback started after user interaction');
        this.showPlayButton = false;
      })
      .catch(error => {
        console.error('Failed to start playback:', error);
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.webrtcService.cleanup();
  }
}