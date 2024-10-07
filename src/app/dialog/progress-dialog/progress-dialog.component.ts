import { Component } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { BatchPanelService } from '../../services/batch-panel.service';

@Component({
  selector: 'app-progress-dialog',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.css']
})
export class ProgressDialogComponent {
  percent = 0;
  themeColor: string = '#bf00ff';
  isSuccess: boolean;
  progressValue: number;
  private progressIntervalSubscription: Subscription;

  constructor(private batchService: BatchPanelService) { }

  ngOnInit() {
    this.batchService.progressUpdateEvent.subscribe(() => {
      this.percent = 100;
      this.progressIntervalSubscription.unsubscribe();
    });

    const progressInterval = interval(150);

    this.progressIntervalSubscription = progressInterval.subscribe(() => {
      if (this.percent < 90) {
        this.percent++;
      }
    });
  }
}
