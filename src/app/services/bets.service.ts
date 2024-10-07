import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient,HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import {AppConfigService} from '../app.config.service';

@Injectable({
  providedIn: 'root'
})
export class BetsService {

  gridSearchResultsEvent = new EventEmitter<any>();
  batchSearchResultsEvent = new EventEmitter<any>();

  constructor(private http: HttpClient) { }

  bets(formData: FormGroup) {
    return this.http.post(`${AppConfigService.settings.host}/api/bets`, formData);
  }

  batchBets(formData: any) {
    return this.http.post(`${AppConfigService.settings.host}/api/batch-bets`, formData);
  }

  downloadBets(formData:any){
     return this.http.post(`${AppConfigService.settings.host}/export/spreadsheet`, formData , {
              observe: 'response',
              responseType: 'blob' as 'json'
            }).subscribe(res => {
                         this.downloadFile(res);
                      });
  }

  downloadFile(res: any) {
      const contentType = 'application/vnd.ms-excel';
      const blob = new Blob([res.body], { type: contentType });
      let url = window.URL.createObjectURL(blob);

      var contentDisposition = res.headers.get('content-disposition');
      var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
  }
}
