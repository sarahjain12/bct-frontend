import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `<div></div>`
})
export class LoginComponent implements OnInit {

  public userAuthenticated = false;

   constructor(private _authService: AuthService){
     this._authService.loginChanged
     .subscribe(userAuthenticated => {
       this.userAuthenticated = userAuthenticated;
     })
   }

   ngOnInit(): void {
     this.login();
   }

   public login = () => {
     this._authService.login();
   }
}
