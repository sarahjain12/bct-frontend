import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AppConfigService} from '../app.config.service';


@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) { }

  accountCategory(userId:string) {
   return this.http.get<Record<string,string>>(
          `${AppConfigService.settings.host}/account/category?userId=`+userId);
  }

  accountBalance(userId:string): Observable<Record<string,any[]>> {
        return this.http.get<Record<string,any[]>>(
          `${AppConfigService.settings.host}/account/balance?userId=`+userId
        );
      }
  }
