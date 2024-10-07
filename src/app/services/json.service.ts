import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Observable } from 'rxjs';
import {IAppConfig} from '../models/app-config.model';

@Injectable({
  providedIn: 'root'
})
export class JsonService {


  private httpClient: HttpClient;

  constructor(private handler: HttpBackend) {
       this.httpClient = new HttpClient(handler);
  }


  getConfigFile() : Observable<IAppConfig> {
    return this.httpClient.get<IAppConfig>('assets/configs/app.config.json');
}

}
