import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl:'./app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit  {
   title = 'bct';

   constructor(private _authService: AuthService){
   }

   ngOnInit(): void {
   // TODO :: add tab close event.
     /* window.addEventListener('beforeunload', (event) => {
         event.returnValue = `You have unsaved changes, leave anyway?`;
       //this._authService.logout();
     }); */
   }
}
