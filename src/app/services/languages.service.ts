import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {AppConfigService} from '../app.config.service';


@Injectable({
  providedIn: 'root'
})
export class LanguagesService {

  constructor (private http:HttpClient) {}

  getLanguages(){
    return this.http.get(`${AppConfigService.settings.host}/languages`).pipe(
      map((v)=>
      Object.entries(v).map(([id, viewValue])=>({
        id,
        viewValue
      })))
    );
    }
}
