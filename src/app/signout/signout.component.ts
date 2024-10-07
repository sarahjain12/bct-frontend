import {Component} from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-signout',
  templateUrl: './signout.component.html',
  styleUrls: ['./signout.component.css']
})
export class SignoutComponent{

  userName: string;

  constructor(private _authService: AuthService) {
     this._authService.getUsername().then(userName => {
        this.userName = userName;
     });
  }

  public logout = () => {
     this._authService.logout();
   }
}
