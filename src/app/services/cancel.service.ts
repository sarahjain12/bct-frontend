import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {AppConfigService} from '../app.config.service';

@Injectable({
  providedIn: 'root'
})
export class CancelService {

  constructor(private http: HttpClient) { }

  cancel(formData: any) {
    return this.http.post(`${AppConfigService.settings.host}/api/cancel-bets`, formData);
  }

  stornoChargeStatus(stornoChargeId: number) {
    return this.http.post<any>(`${AppConfigService.settings.host}/api/charge-progress-status/${stornoChargeId}`, {});
  }

  getCancelReasons() {
    return this.http.get(`${AppConfigService.settings.host}/cancel-reasons`).pipe(
        map((v) =>
            Object.entries(v).map(([id, viewValue]) => ({
                id,
                viewValue
            })))
    );
}

}
