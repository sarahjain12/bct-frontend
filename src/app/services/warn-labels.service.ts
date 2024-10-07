import { Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';

@Injectable({
  providedIn: 'root'
})
export class WarnLabelsService {

  constructor(private modal: NzModalService) { }


  getSelectedUSWarnLabels(betLabelsList: string[]) {
    return betLabelsList
      .filter(betLabel =>
        (String(betLabel).includes('betmgm')) || betLabel == 'nj.playmgm.com' || betLabel == 'borgataonline.com'
      )
  }

  showWarnLabelsDialog(usBetsLabels: string[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
        this.modal.confirm({
          nzTitle: 'Confirm Cancellation Dialog',
          nzContent: `You have selected one or more bets from the label(s):<br/><strong>${usBetsLabels}</strong><br/>Are you sure you want to proceed?`,
          nzOnOk: resolve,
          nzOnCancel: reject
        });
      })
  }

}