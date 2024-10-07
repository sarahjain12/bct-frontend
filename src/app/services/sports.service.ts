import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {AppConfigService} from '../app.config.service';

@Injectable({
  providedIn: 'root'
})
export class SportsService {

  constructor (private http:HttpClient) {}

  getSports(){
    return this.http.get(`${AppConfigService.settings.host}/sports`).pipe(
      map((v)=>
      Object.entries(v).map(([id, viewValue])=>({
        id,
        viewValue
      })))
    );
    }
}
