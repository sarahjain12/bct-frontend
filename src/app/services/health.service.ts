import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend, HttpHeaders } from '@angular/common/http';
import {AppConfigService} from '../app.config.service';


@Injectable({
  providedIn: 'root'
})
export class HealthService {

  private httpClient: HttpClient;

   constructor(private handler: HttpBackend) {
       this.httpClient = new HttpClient(handler);
  }

    health() {
      return this.httpClient.get(`${AppConfigService.settings.host}/health/c`,
         {
                headers: new HttpHeaders()
                  .set('Content-Type', 'application/xml')
                  .append('Access-Control-Allow-Methods', 'GET')
                  .append('Access-Control-Allow-Origin', `${AppConfigService.settings.host}`)
                  .append('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Request-Method"),
                responseType: 'text'
              }
      );
    }
}
