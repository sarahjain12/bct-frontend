import { Component } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BatchPanelService } from '../services/batch-panel.service';
import { BetsService } from '../services/bets.service';
import {AppConfigService} from "../app.config.service";

@Component({
  selector: 'app-batch-bets',
  templateUrl: './batch-bets.component.html',
  styleUrls: ['./batch-bets.component.css']
})
export class BatchBetsComponent {

  betResponse: any;
  betsBreakdownMap: any[] = [];
  hasReadPermissions: boolean = false;
  hasWritePermissions: boolean = false;
  batch_count: number;

  constructor(private betsService: BetsService,
    private batchPanelService: BatchPanelService,
    private modal: NzModalService,
    private _authService: AuthService) {
  }

  ngOnInit() {
    this.betsService.batchSearchResultsEvent.subscribe((betResponse: any) => {
      this.betResponse = betResponse;
      if (this.betResponse.betsBreakdownMap != null)
        this.betsBreakdownMap = Object.entries(this.betResponse.betsBreakdownMap);
    });
    this._authService.ifUserHasWritePermissions().then(write => {
      this.hasWritePermissions = write;
    });
    this._authService.ifUserHasReadPermissions().then(read => {
      this.hasReadPermissions = read;
    });
    this.batch_count = AppConfigService.settings.batch_count;
  }

  selectBatchBetsToCancel(betStatusToCorrect: any, betsCount: any,
    offerSourceSystem: any, labels: any, checked: boolean): void {
    let batchBetsLabelsList: { betLabel: string }[] = [];
    let result: {
      betStatus: string,
      isBatchBetsParticipant: boolean,
      batchBetsSelectedLabels: any,
      batchBetsLabelsList: any
    } = {
      betStatus: "",
      isBatchBetsParticipant: false,
      batchBetsSelectedLabels: null,
      batchBetsLabelsList: batchBetsLabelsList
    };
    if (checked) {
      if (betsCount == 0) {
        this.modal.error({ nzContent: 'There are no bets for this selection. Please select something else', nzClosable: false })
        return;
      }
      result.betStatus = betStatusToCorrect;
      result.isBatchBetsParticipant = offerSourceSystem == "2" ? true : false
      var batchBetsLabel = labels?.split(" ");
      for (var i = 0; i < batchBetsLabel.length - 1; i++) {
        var obj = { "betLabel": batchBetsLabel[i] };
        batchBetsLabelsList.push(obj);
      }
      this.batchPanelService.checkedBatchBetsActionEvent.emit(result);
    }
  }
}
