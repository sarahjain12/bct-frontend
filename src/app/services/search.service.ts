import { EventEmitter, Injectable, Output } from "@angular/core";
import { FormGroup, NgForm } from "@angular/forms";

@Injectable()
export class SearchPanelService {
  appliedSearchEvent = new EventEmitter<FormGroup>();
}
