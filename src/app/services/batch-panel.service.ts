import { Injectable, EventEmitter } from '@angular/core';
import { FormGroup } from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class BatchPanelService {
  appliedBatchBetsSearchEvent = new EventEmitter<any>();
  checkedBatchBetsActionEvent = new EventEmitter<any>();
  batchBetsStornoProgressEvent = new EventEmitter<any>();
  progressUpdateEvent = new EventEmitter<any>();

  constructor() { }
}
