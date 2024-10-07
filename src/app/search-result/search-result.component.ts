import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms'
import { SearchPanelService } from '../services/search.service';
import { BetsService } from '../services/bets.service';
import { BatchPanelService } from '../services/batch-panel.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import {AppConfigService} from "../app.config.service";

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

  showSearchResultsCount: boolean = false;
  searchForm: FormGroup;
  betResponse: any;
  resultCount: number;
  tradingPartition: any;
  offerId: any;
  offerType: any;
  showLoader : boolean;
  batch_count: number;
  @Output() disableDownloadExcelChanged = new EventEmitter<boolean>();

  constructor(private searchService: SearchPanelService,
    private betsService: BetsService,
    private batchService: BatchPanelService,
    private modal: NzModalService) {
  }

  ngOnInit(): void {
    this.searchService.appliedSearchEvent.subscribe((form: FormGroup) => {
      this.showSearchResultsCount = true
      this.searchForm = form.getRawValue();
      this.offerId = form.get('offerId')?.value;
      this.offerType = form.get('offerType')?.value.id;
      this.tradingPartition = form.get('tradingPartition')?.value.id;
      this.batch_count = AppConfigService.settings.batch_count;
      this.bets();
    });
    this.batchService.batchBetsStornoProgressEvent.subscribe(()=>this.batchBets());
  }

  bets(): void {
    this.showLoader = true;
    this.betsService
      .bets(this.searchForm)
      .subscribe({
        next: (response: any) => {
        this.betResponse = response;
        this.showLoader = false;
        if (this.betResponse.numberOfResults != null) {
          this.resultCount = this.betResponse.numberOfResults;
        } else {
          this.resultCount = 0;
        }
        if(this.resultCount <= this.batch_count) {
          this.ondisableDownloadExcelChange(false);
        } else {
          this.ondisableDownloadExcelChange(true);
        }
        this.betsService.gridSearchResultsEvent.emit(this.betResponse)
        this.betsService.batchSearchResultsEvent.emit(this.betResponse)
        if(this.betResponse.useBatchMode)
        this.batchService.appliedBatchBetsSearchEvent.emit(this.betResponse);
      },
      error: (error: any) => {
        this.showLoader = false;
        this.modal.error({nzContent: "Error:"+ JSON.stringify(error), nzClosable: false });
        return;
      }
    });
  }

  batchBets(): void {
    this.betsService
      .batchBets(this.searchForm)
      .subscribe({
        next : (response: any) => {
        this.betResponse = response;
        this.betsService.batchSearchResultsEvent.emit(this.betResponse)
        this.batchService.appliedBatchBetsSearchEvent.emit(this.betResponse);
      },
      error: (error: any) => {
        this.modal.error({nzContent: "Error:"+ JSON.stringify(error), nzClosable: false });
        return;
      }
    });
  }

  onCilckBatchViewLink(): void {
    this.batchBets();
  }

  ondisableDownloadExcelChange(flag:boolean) {
    this.disableDownloadExcelChanged.emit(flag);
  }
}
