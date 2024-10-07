import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AuthService } from '../shared/services/auth.service';
import { Option } from '../models/option.model';
import {AppConfigService} from '../app.config.service';

@Injectable({
  providedIn: 'root'
})
export class LoginDomainsService {

  requiredData: Option[] = [];
  allLablesMap: Option[] = [];
  identityLabels: string[] = [];

  constructor (private http:HttpClient, private _authService:AuthService) {}

  getLabels(){
       return this.http.get(`${AppConfigService.settings.host}/labels`).pipe(
        map((v)=> {
        this.allLablesMap = Object.entries(v).map(([id, viewValue])=>({
          id,
          viewValue
        }));

        //this.identityLabels = (this._authService.getUserLablesFromIdentity());
        console.log(this.identityLabels);
        console.log("labelsss");
        if(!this.identityLabels?.length){
          return this.allLablesMap;
        }
            for (let i of this.identityLabels) {
              this.allLablesMap.filter((label) => {
              if(label.id == i){
                  this.requiredData.push(label);
              }
              });
            }
         return this.requiredData;
        })
      );
    }

// TODO :: Use this method instead of the above.
/*     getLabels(){
           return this.http.get(`${environment.HOST}/labels`).pipe(
            map((v)=> {
            this.allLablesMap = Object.entries(v).map(([id, viewValue])=>({
              id,
              viewValue
            }));
            this._authService.getUserLablesFromIdentity().then(identityLabels => {
            console.log("labelsss");
            console.log(identityLabels);
                if(!identityLabels?.length){
                  return this.allLablesMap;
                }
                else{
                for (let i of identityLabels) {
                  this.allLablesMap.filter((label) => {
                    if(label.id == i){
                        this.requiredData.push(label);
                    }
                  });
                  }
                return this.requiredData;
                }
              });
              return this.requiredData;
           }));
        } */
}
