import { Component, Input, OnDestroy } from '@angular/core';
import { StornoDataSharedService } from '../../services/storno-data-shared.service';
import { Subscription } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BatchPanelService } from '../../services/batch-panel.service';

@Component({
  selector: 'app-report-dialog',
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.css']
})
export class ReportDialogComponent implements OnDestroy{
  @Input() response: any;
  isVisible: any;
  private subscription: Subscription;

  constructor(private stornoDataSharedService: StornoDataSharedService,
    private modal: NzModalService,
    private batchPanelService : BatchPanelService) { }

  ngOnInit() {
    this.subscription = this.stornoDataSharedService.responseData$.subscribe((response) => {
      this.response = response;
      this.isVisible = true;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  handleOk() {
    const reportDialog = this.modal.create({
      nzTitle: 'Close Summary',
      nzContent: 'Please take note of the Batch Charge ID<br/><br/>' +
      'before closing the Cancellation Summary <br/><br/>' +
      '<b>Charge ID : </b>' + this.response.chargeId + '<br/><br/>' +
      'Are you sure you want to proceed? <br/><br/>',
      nzClosable: false,
      nzFooter: [
        {
          label: 'Cancel',
          type: 'default',
          onClick: () => {
            reportDialog.destroy();
          },
        },
        {
          label: 'Exit',
          type: 'primary',
          onClick: () => {
            this.modal.closeAll();
            this.batchPanelService.batchBetsStornoProgressEvent.emit();
          },
        },
      ],
    });

  }


}
