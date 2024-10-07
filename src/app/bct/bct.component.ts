import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-bct',
  templateUrl: './bct.component.html',
  styleUrls: ['./bct.component.scss']
})
export class BctComponent implements OnInit {

  public userAuthenticated = false;
  idleState = 'Not started.';
  timedOut = false;
  lastPing: Date;

  isTimeoutModalVisible : boolean = false;

  constructor(private _authService: AuthService,
              private idle: Idle,
              private keepalive: Keepalive,
              private modal: NzModalService) { }

  ngOnInit(): void {

  this._authService.isAuthenticated()
     .then(userAuthenticated => {
       this.userAuthenticated = userAuthenticated;
       if (userAuthenticated) {
         this.idle.watch();
         this.timedOut = false;
       } else {
         this.idle.stop();
       }
     });

  // sets an idle timeout of 10 minutes, for dev env.
  this.idle.setIdle(1800);
  // sets a timeout period of 10 minutes. after 10 seconds of inactivity, the user will be considered timed out.
  this.idle.setTimeout(600);
  // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
  this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

  this.idle.onIdleEnd.subscribe(() => {
    this.idleState = 'No longer idle.'
    this.reset();
  });

  this.idle.onTimeout.subscribe(() => {
    this.isTimeoutModalVisible = false;
    this.idleState = 'Timed out!';
    this.timedOut = true;
    this.logout();
  });

  this.idle.onIdleStart.subscribe(() => {
      this.idleState = 'You\'ve gone idle!'
      this.isTimeoutModalVisible = true;
  });

  this.idle.onTimeoutWarning.subscribe((countdown) => {
    this.idleState = 'Your session will be timed out in ' + countdown + ' seconds!'
  });
}

  reset() {
    this.idle.watch();
    this.timedOut = false;
  }

  hideChildModal(): void {
    this.isTimeoutModalVisible = false;
  }

  stay() {
    this.isTimeoutModalVisible = false;
    this.reset();
  }

  logout() {
    this.isTimeoutModalVisible = false;
    this.userAuthenticated = false;
    this._authService.logout();
  }

  showModal(): void {
    this.isTimeoutModalVisible = true;
  }

  handleCancel(): void {
    this.isTimeoutModalVisible = false;
  }
}
