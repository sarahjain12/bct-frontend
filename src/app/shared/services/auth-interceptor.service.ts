import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, lastValueFrom  } from 'rxjs';
import { AuthService } from './auth.service';
import { Constants } from '../constants';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppConfigService} from '../../app.config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService /* implements HttpInterceptor */ {

  auth_token : string;

  constructor(private _authService: AuthService,  private _router: Router) { }

   /* intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // add auth header with jwt if user is logged in and request is to the api url
    return from(this.interceptHttpReq(request, next))
    .pipe(
          catchError((err : HttpErrorResponse) => {
            if(err && (err.status === 401 || err.status === 403)){
              this._router.navigate(['/unauthorized']);
            }
            throw 'error in a request ' + err.status;
          })
        );
  } */

   async interceptHttpReq(request: HttpRequest<any>, next: HttpHandler)
  {
    await this._authService.getAccessToken().then(token => {
            this.auth_token = token;
          });
          const isApiUrl = request.url.startsWith(AppConfigService.settings.host);
          if (isApiUrl) {
              request = request.clone({
                  setHeaders: {
                      Authorization: `Bearer ${this.auth_token}`
                  }
              });
          }
          return lastValueFrom(next.handle(request));
  }
}
