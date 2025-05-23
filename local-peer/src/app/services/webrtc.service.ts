import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  public remoteStream$ = new BehaviorSubject<MediaStream | null>(null);
  private remoteStream: MediaStream;
  private trackSenders: RTCRtpSender[] = [];

  constructor(private websocketService: WebsocketService) {
    this.remoteStream = new MediaStream();
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "turn:172.28.233.108:3478",
          username: "manikandan",
          credential: "1234"
         }, 
        // Add TURN servers here if needed for production
      ],
      iceTransportPolicy: "all", // Try "relay" if only TURN should be used
    });

    this.setupConnectionListeners();
  }

  private setupConnectionListeners(): void {
    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
          // Remove existing tracks of same type
          this.remoteStream.getTracks()
            .filter((t: MediaStreamTrack) => t.kind === track.kind)
            .forEach((t: MediaStreamTrack) => this.remoteStream.removeTrack(t));

          this.remoteStream.addTrack(track);
        });
        this.remoteStream$.next(this.remoteStream);
      }
    };

    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        this.websocketService.sendMessage('ice-candidate', event.candidate);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState);
    };
  }

  async startLocalMedia(): Promise<void> {
    try {
      // Clean up existing stream if present
      if (this.localStream) {
        this.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        this.trackSenders = [];
      }

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async startCall(): Promise<void> {
    if (!this.localStream) {
      await this.startLocalMedia();
    }

    // Only add tracks if they haven't been added before
    if (this.trackSenders.length === 0) {
      this.localStream!.getTracks().forEach((track: MediaStreamTrack) => {
        const sender = this.peerConnection.addTrack(track, this.localStream!);
        this.trackSenders.push(sender);
      });
    }

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.websocketService.sendMessage('offer', offer);
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.websocketService.sendMessage('answer', answer);
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  cleanup(): void {
    this.peerConnection.close();
    this.localStream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    this.remoteStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    this.remoteStream$.next(null);
    this.trackSenders = [];
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }
}