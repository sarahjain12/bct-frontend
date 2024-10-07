import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StornoDataSharedService {

  constructor() { }

  private responseSource = new BehaviorSubject<any>(null);
  responseData$ = this.responseSource.asObservable();

  setResponse(response: any) {
    this.responseSource.next(response);
  }
}
