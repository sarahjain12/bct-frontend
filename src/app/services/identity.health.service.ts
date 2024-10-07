import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IdentityHealthService {

  private httpClient: HttpClient;

   constructor(private handler: HttpBackend) {
       this.httpClient = new HttpClient(handler);
  }

    health(url:string) {
      return this.httpClient.get(url,
         {
                headers: new HttpHeaders()
                  .set('Content-Type', 'application/xml')
                  .append('Access-Control-Allow-Methods', 'GET')
                  .append('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Access-Control-Request-Method"),
                responseType: 'text'
              }
      );
    }
}
