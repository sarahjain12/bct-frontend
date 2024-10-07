import { AuthService } from './../services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private _authService: AuthService, private _router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
    const roles = this._authService.getRoles();
    if(await this._authService.checkIfUserHasLoginPermissions()) {
      return true;
    }
    else {
      return this.redirectToUnauthorized();
    }
  }

  private checkIsUserAuthenticated() {
  return this._authService.isAuthenticated()
   .then(userAuthenticated => {
      return userAuthenticated ? true : this.redirectToUnauthorized();
   });
  }

/*
  private checkForAdministrator() {
    return this._authService.checkIfUserIsAdmin() ? true : this.redirectToUnauthorized();
  }
 */

  private redirectToUnauthorized() {
    this._router.navigate(['/unauthorized']);
    return false;
  }
}
