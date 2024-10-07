import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin-redirect-callback',
  template: `<div></div>`
})
export class SigninRedirectCallbackComponent implements OnInit {

  constructor(private _authService: AuthService, private _router: Router) { }

  ngOnInit(): void {
  try{
      this._authService.finishLogin()
      .then(_ => {
        this._router.navigate(['/bct'], { replaceUrl: true });
      })
    }
    catch(e){
        console.log("error")
        console.log((e as Error).message);
        this._router.navigate(['/unauthorized'], { replaceUrl: true });
    }
  }
}
