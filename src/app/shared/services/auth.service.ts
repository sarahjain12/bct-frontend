import { Injectable } from '@angular/core';
import { UserManager, User, UserManagerSettings } from 'oidc-client';
import { Constants } from '../constants';
import { Subject } from 'rxjs';
import {AppConfigService} from '../../app.config.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userManager: UserManager;
  private _user: User|null=null;
  private _loginChangedSubject = new Subject<boolean>();
  private clientSecretAsPerEnv : string = "";
  private environment : string = "";

  public loginChanged = this._loginChangedSubject.asObservable();

  private clientSecret() : string{
      switch(this.environment){
        case "dev" :
          return Constants.devClientSecret;
        case "test" :
          return Constants.testClientSecret;
        case "prod" :
          return Constants.prodClientSecret;
        default :
          return "";
      }
  }

  private getAuthority() : string{
    switch(this.environment){
      case "dev" :
       return  Constants.devIdpAuthority+"/identity";
      case "test" :
        return Constants.testIdpAuthority+"/identity";
      case "prod" :
        return Constants.prodIdpAuthority+"/identity";
      default :
        return "";
    }
  }

  private getClientRoot() : string{
    switch(this.environment){
      case "dev" :
       return  Constants.devClientRoot;
      case "test" :
        return Constants.testClientRoot;
      case "prod" :
        return Constants.prodClientRoot;
      default :
        return "";
    }
  }


  protected get idpSettings() : UserManagerSettings {
      var clientRoot = this.getClientRoot();
      return {
        authority: this.getAuthority(),
        client_id: Constants.clientId,
        redirect_uri: `${clientRoot}/signin-oidc`,
        scope: "openid profile bct",
        response_type: "code",
        client_secret: this.clientSecret(),
        post_logout_redirect_uri: `${clientRoot}/signout-oidc`
      }
  }

  constructor(private appConfigService : AppConfigService) {
    this.environment = AppConfigService.settings.env;
    this._userManager = new UserManager(this.idpSettings);
  }

  public login = () => {
    return this._userManager.signinRedirect();
  }

  public isAuthenticated = (): Promise<boolean> => {
    return this._userManager.getUser()
    .then(user => {
      if(user!==null){
        if(this._user !== user){
          this._loginChangedSubject.next(this.checkUser(user));
        }
        this._user = user;
        return this.checkUser(user);
      }
      else{
        return Promise.resolve(false);
      }
    })
  }

  private checkUser = (user : User): boolean => {
    return !!user && !user.expired;
  }

  public finishLogin = (): Promise<User> => {
    return this._userManager.signinRedirectCallback()
    .then(user => {
      this._user = user;
      this._loginChangedSubject.next(this.checkUser(user));
      return user;
    })
  }

  public logout = () => {
    this._userManager.signoutRedirect();
  }

  public finishLogout = () => {
    this._user = null;
    return this._userManager.signoutRedirectCallback();
  }

  public getUsername= (): Promise<string> => {
    return this._userManager.getUser()
      .then(user => {
         return !!user && !user.expired && user.profile.name != undefined ? user.profile.name.replace("ICEPOR\\", "") :  Promise.resolve("");
    })
  }

  public getAccessToken = (): Promise<string> => {
    return this._userManager.getUser()
      .then(user => {
         return !!user && !user.expired ? user.access_token : Promise.resolve("");
    })
  }

  public getRoles = (): Promise<Array<string>> => {
    return this._userManager.getUser()
      .then(user => {
         return !!user && !user.expired ? user.profile.role : Promise.resolve("");
    })
  }

  public checkIfUserIsAdmin = (): Promise<boolean> => {
   var isAdmin = false;
   return this._userManager.getUser().then(user => {
       if(!!user && !user.expired){
         for (let i in user.profile.role) {
           if(user.profile.role[i]==='bct.admin'){
             isAdmin = true;
           }
         }
       }
       return isAdmin;
     })
  }

  public checkIfUserHasLoginPermissions(): Promise<boolean> {
      var hasLoginAccess = false;
      return this.getRoles().then(function(roleList) {
        roleList.forEach(function(role){
            if(role==='bct.access'){
              hasLoginAccess = true;
            }
          });
         return hasLoginAccess;
      });
    }

  public ifUserHasReadPermissions = (): Promise<boolean> => {
    var hasReadAccess = false;
    return this.getRoles().then(function(roleList) {
      roleList.forEach(function(role){
          if(role==='bct.read'){
            hasReadAccess = true;
          }
        });
       return hasReadAccess;
    });
  }

    public ifUserHasWritePermissions = (): Promise<boolean> => {
    var hasWriteAccess = false;
    return this.getRoles().then(function(roleList) {
      roleList.forEach(function(role){
          if(role==='bct.write'){
            hasWriteAccess = true;
          }
        });
       return hasWriteAccess;
    });
    }


  public getUserLablesFromIdentity = (): string[] => {
    if(!!this._user && !this._user.expired && (this._user.profile["bct.logindomains"])){
        return (this._user.profile["bct.logindomains"]).split(",");
    }
    else{
        return ([] as string[]);
    }
    // TODO :: Make use of Promise as return type
    /* var domains:string[] = [];
    return this._userManager.getUser()
      .then(user => {
         return !!user && !user.expired && user.profile["bct.logindomains"] != undefined ? user.profile["bct.logindomains"].split(",") :  Promise.resolve("");
    }); */
  }
}
