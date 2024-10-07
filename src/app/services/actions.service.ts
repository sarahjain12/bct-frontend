import { EventEmitter, Injectable, Output} from "@angular/core";
import { CustomColumn} from '../models/custom.column'

@Injectable({
    providedIn: 'root'
  })
  
export class ActionsService {
    customColumnEvent = new EventEmitter<CustomColumn[]>();
    selectAllEvent = new EventEmitter<boolean>();
    actionPerformedEvent = new EventEmitter<number[]>();
}