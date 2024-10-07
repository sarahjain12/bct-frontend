import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms'
import { CancelService } from '../services/cancel.service';
import { SearchPanelService } from '../services/search.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef } from '@angular/core';
import { CustomColumn } from '../models/custom.column'
import { ActionsService } from '../services/actions.service';
import { BatchPanelService } from '../services/batch-panel.service';
import { ReportDialogComponent } from '../dialog/report-dialog/report-dialog.component';
import { StornoDataSharedService } from '../services/storno-data-shared.service';
import { ProgressDialogComponent } from '../dialog/progress-dialog/progress-dialog.component';
import { BatchBetsActionMap } from './constants/batch-bets-action-map';
import { WarnLabelsService } from '../services/warn-labels.service';
import { Injectable } from '@angular/core';
import { BwilinkedmarketsService } from '../services/bwilinkedmarkets.service';
import { map } from 'rxjs/operators';
import { Option } from "src/app/models/option.model";
import { ActionSelectConstant } from './constants/action-select-constant';
import { AuthService } from '../shared/services/auth.service';


@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.css']
})
export class ActionsComponent implements OnInit {
  actionForm: FormGroup
  searchForm: FormGroup;
  allBets: any[] = [];
  selectedBets: any[] = [];
  selectedBetsMap = new Map();
  betResponse: any;
  rowCount: any;
  checked = false;
  indeterminate = false;
  isVisible = false;
  mapOfCheckedRowsForCancel = new Map();
  mapOfCheckedRowsForEP = new Map();
  mapOfCheckedRowsForREP = new Map();
  cancelType: string;
  betStatus: string = "";
  isBatchBetsParticipant: boolean;
  batchBetsSelectedLabels: any;
  resultSetId: string;
  isBatchBetSearch: boolean;
  isNewSearch: boolean;
  batchBetsLabelsList: string[] = [];
  linkedMarkets: any;
  marketResponse: any;
  isActionTriggered: boolean;
  actionPopupTitle: string
  actionsOptions: Option[] = [];
  cancelReasonsOptions: Option[] = [];
  hasWritePermissions = false;
  hasReadPermissions = false;
  @Input() currentBets: any[] = [];
  INTERNAL_REASON_OTHER: number = 18;

  constructor(private cancelService: CancelService,
    private searchService: SearchPanelService,
    private actionsService: ActionsService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef,
    private bwilinkedmarketsservice: BwilinkedmarketsService,
    private batchService: BatchPanelService,
    private warnLabelsService: WarnLabelsService,
    private stornoDataSharedService: StornoDataSharedService,
    private _authService : AuthService) {
    this.actionsOptions = ActionSelectConstant;
    this.cancelService.getCancelReasons().subscribe((cancelReasons)=> {
      this.cancelReasonsOptions = cancelReasons;
  });
  }

  ngOnInit() {
    this.actionForm = new FormGroup({
      comments: new FormControl(''),
      actionsDrop: new FormControl(),
      reason: new FormControl(''),
      checked: new FormControl()
    })
    this.searchService.appliedSearchEvent.subscribe((searchForm: FormGroup) => {

      this.isBatchBetSearch = false;
      this.isNewSearch = true;
      this.isActionTriggered = false;
      this.searchForm = searchForm.getRawValue();
    })

    this.batchService.appliedBatchBetsSearchEvent.subscribe((betResponse: any) => {
      this.isBatchBetSearch = true
      this.resultSetId = betResponse.resultSetID;
    })
    this.batchService.checkedBatchBetsActionEvent.subscribe((result: any) => {
      this.betStatus = result.betStatus;
      this.isBatchBetsParticipant = result.isBatchBetsParticipant;
      this.batchBetsSelectedLabels = result.batchBetsSelectedLabels;
      this.batchBetsLabelsList = result.batchBetsLabelsList;
      console.log(this.betStatus + "\n" + this.isBatchBetsParticipant + "\n" + this.batchBetsSelectedLabels);
    });
    this.title = this.customColumn.filter(item => item.position === 'left' && item.required);
    this.footer = this.customColumn.filter(item => item.position === 'right' && item.required);
    this.fix = this.customColumn.filter(item => item.default && !item.required);
    this.notFix = this.customColumn.filter(item => !item.default && !item.required);
    this.actionsService.customColumnEvent.emit(this.customColumn);
    this._authService.ifUserHasWritePermissions().then(write => {
      this.hasWritePermissions = write;
    });
    this._authService.ifUserHasReadPermissions().then(read => {
      this.hasReadPermissions = read;
    });
  }

  onAllChecked(checked: boolean): void {
    this.isNewSearch = false;
    this.isActionTriggered = false;
    this.currentBets
      .filter((bet) => this.canBeProcessed(bet))
      .forEach((validBet) => this.updateCancelMap(validBet.identifier.key.betId, checked, validBet));
    this.actionsService.selectAllEvent.emit(checked)
    this.refreshCancelCheckedStatus();
  }

  canBeProcessed(bet: any): boolean {
    return bet.updatableInfo.canBeProcessed
      && bet.identifier.canBeCanceled
      && !bet.lockedByEditBet
  }

  updateCancelMap(betId: number, checked: boolean, bet: any): void {
    if (this.isNewSearch) {
      this.mapOfCheckedRowsForCancel = new Map();
    }
    if (checked) {
      this.cancelType = "cancel";
      this.mapOfCheckedRowsForCancel.set(betId, bet);
    } else {
      this.mapOfCheckedRowsForCancel.delete(betId);
    }
  }

  clearCancelMap() : void {
    this.mapOfCheckedRowsForCancel.clear();
  }

  updateEPMap(betId: number, checked: boolean, bet: any): void {
    if (checked) {
      this.cancelType = "ep";
      this.mapOfCheckedRowsForEP.set(betId, bet);
    } else {
      this.mapOfCheckedRowsForEP.delete(betId);
    }
  }

  clearEPMap() : void {
    this.mapOfCheckedRowsForEP.clear();
  }

  clearREPMap() : void {
    this.mapOfCheckedRowsForREP.clear();
  }

  updateREPMap(betId: number, checked: boolean, bet: any): void {
    if (checked) {
      this.cancelType = "rep";
      this.mapOfCheckedRowsForREP.set(betId, bet);
    } else {
      this.mapOfCheckedRowsForREP.delete(betId);
    }
  }

  refreshCancelCheckedStatus(): void {
    this.checked = this.currentBets.every(bet => this.mapOfCheckedRowsForCancel.has(bet.identifier.key.betId));
    this.indeterminate = this.currentBets.some(bet => this.mapOfCheckedRowsForCancel.has(bet.identifier.key.betId)) && !this.checked;
  }

  showModal(): void {
    if (this.actionForm.value.actionsDrop != null) {
      let optionSelected: string = this.actionForm.value.actionsDrop.id;
      this.isVisible = true;
      this.actionPopupTitle = this.actionForm.value.actionsDrop.viewValue;
      this.actionForm.get('comments')?.reset();
      this.actionForm.get('reason')?.reset();
      if (this.isSettlementOptionSelected(optionSelected)) {
        this.actionForm.get('reason')?.disable();
      } else {
        this.actionForm.get('reason')?.enable();
      }
      this.selectedBetsMap = this.mapOfCheckedRowsForCancel.size != 0 ? this.mapOfCheckedRowsForCancel
        : this.mapOfCheckedRowsForEP.size != 0 ? this.mapOfCheckedRowsForEP
          : this.mapOfCheckedRowsForREP;
      if (this.selectedBetsMap.size > 0) {
        this.selectedBets = Array.from(this.selectedBetsMap.values());
        let isExtendedOffer = false;
        for (let key of this.selectedBetsMap.keys()) {
          if (key != null) {
            let bet = this.selectedBetsMap.get(key);
            if (bet.identifier.isExtended || bet.identifier.betLabel == 'bwin.it' || bet.identifier.betLabel == 'giocodigitale.it')
              isExtendedOffer = true;
          }
        }
        if (isExtendedOffer)
          this.fetchLinkedMarkets(this.selectedBets);
      }
      this.isActionTriggered = false;
    }
  }

  isSettlementOptionSelected(optionSelected: string): boolean {
    return optionSelected == '12' || optionSelected == '14' ||
      optionSelected == '16' || optionSelected == '18';
  }

  handleCancel(): void {
    this.actionForm.get('actionsDrop')?.reset();
    this.isVisible = false;
  }

  resetActionForm() {
    this.mapOfCheckedRowsForCancel.clear();
    this.mapOfCheckedRowsForEP.clear();
    this.mapOfCheckedRowsForREP.clear();
    this.actionsService.actionPerformedEvent.emit(this.selectedBets);
    this.actionForm.reset();
    this.isVisible = false;
    this.isActionTriggered = false;
  }

  onSubmit(): void {
    let optionSelected: string = this.actionForm.value.actionsDrop.id;
    if (!this.isSettlementOptionSelected(optionSelected) &&
      (this.actionForm.value.reason == null || this.actionForm.value.reason == '')) {
      this.modal.error({ nzContent: "Please specify a valid external reason!", nzClosable: false })
      this.resetActionForm();
      return;
    }
    if (!this.isBatchBets() && this.selectedBetsMap.size == 0) {
      this.modal.error({ nzContent: "No bet selected!", nzClosable: false })
      this.resetActionForm();
      return;
    }
    if (this.isSettlementOptionSelected(optionSelected) &&
      (this.actionForm.value.comments == null || this.actionForm.value.comments == '')) {
      this.modal.error({ nzContent: "Please insert a comment!", nzClosable: false })
      this.resetActionForm();
      return;
    }
    this.isActionTriggered = true;
    if (this.selectedBetsMap.size > 0) {
      this.betStatus = "";
    }
    if (optionSelected == '0' || optionSelected == '1') {
      if (optionSelected == '0' && (this.betStatus == 'Open' || this.betStatus == 'Won' || this.betStatus == 'Lost')
        || (optionSelected == '1' && this.betStatus == 'Cancelled via Bet Correction')
        || (optionSelected == '0' && this.selectedBetsMap)
        || ((optionSelected == '0' || optionSelected == '1') && this.betStatus == "")) {
        this.onCancellation(this.selectedBetsMap, optionSelected);
      } else {
        this.modal.warning({
          nzContent: "Warning: Undo cancellation can only be performed on bets with status \"Cancelled via Bet Correction\". Please select another option to proceed.",
          nzClosable: false
        })
        this.resetActionForm();
        return;
      }
    } else {
      this.onSettlement(this.selectedBetsMap, optionSelected);
    }
  }

  onCancellation(selectedBetsMap: Map<string, any>, optionSelected: string): void {
    if (this.isBatchBets()) {
      let usBatchBetsLabels = this.warnLabelsService.getSelectedUSWarnLabels(this.batchBetsLabelsList);
      if (usBatchBetsLabels.length != 0) {
        this.warnLabelsService.showWarnLabelsDialog(usBatchBetsLabels)
          ?.then(() => this.batchBetsCancellation(optionSelected))
          .catch(() => {
                console.log('abort cancelation!');
                this.handleCancel();
              })
      } else {
        return this.batchBetsCancellation(optionSelected);
      }
    } else {
      let betLabelsList = Array.from(selectedBetsMap.values()).map(bet => bet.identifier.betLabel);
      let usBetsLabels = this.warnLabelsService.getSelectedUSWarnLabels(betLabelsList);
      if (usBetsLabels.length > 0) {
        this.warnLabelsService.showWarnLabelsDialog(usBetsLabels)
          ?.then(() => this.nonBatchBetsCancellation(selectedBetsMap, optionSelected))
          .catch(() => {
            console.log('abort cancelation!');
            this.handleCancel();
           })
      } else {
        return this.nonBatchBetsCancellation(selectedBetsMap, optionSelected);
      }
    }
  }

  batchBetsCancellation(optionSelected: string): void {
    let betsArray: any[] = [];
    var cancelType = optionSelected == '0' ? 'CANCEL' : 'UNCANCEL';

    var otherInternalCancelReason = "Other reason : " + this.actionForm.value.comments;
    let batchBetsCancelRequest = {
      'bets': betsArray,
      'internalCancelReasonId': this.INTERNAL_REASON_OTHER,
      'otherInternalCancelReason': otherInternalCancelReason,
      'externalCancelReason': parseInt(this.actionForm.value.reason),
      'cancelType': cancelType,
      'resultSetID': this.resultSetId,
      'betStatusToCorrect': this.betStatus,
      'batchBets': true
    };

    let postParams: string = JSON.stringify(batchBetsCancelRequest) + "&" + JSON.stringify(this.searchForm);
    this.cancelOrSettleBatchBets(optionSelected, postParams);
  }

  nonBatchBetsCancellation(selectedBetsMap: Map<string, any>, optionSelected: string): void {
    let selectedBetsKey: string = "";
    let selectedGameId: string;
    let betsArray: any[] = [];
    let bets: any[] = [];
    let betKeysArray: any[] = [];

    for (let key of selectedBetsMap.keys()) {
      if (key != null) {
        const bet = selectedBetsMap.get(key);
        bets.push(bet);
        betsArray.push(bet.identifier);
        betKeysArray.push(bet.identifier.key);
        selectedGameId = bet.betTradingData.gameId;
        selectedBetsKey += "" + bet.identifier.key.systemSlipId + "_" + bet.identifier.key.slipId + "_" + bet.identifier.key.betId + "_" + bet.identifier.key.resultId;
        bet.identifier.key.slipId + "_" + bet.identifier.key.betId + "_" + bet.identifier.key.resultId;
      }
    }
    let cancelType: string =  optionSelected == '0' ? 'CANCEL' : 'UNCANCEL';
    if (this.cancelType == "ep") {
      cancelType = "EarlyPayout"
    } else if (this.cancelType == "rep") {
      cancelType = "EarlyPayoutReserved"
    }

    let betsCancelRequest: {} = {
      'bets': betsArray,
      'internalCancelReasonId': this.INTERNAL_REASON_OTHER,
      'otherInternalCancelReason': "Other reason : " + this.actionForm.value.comments,
      'externalCancelReason': parseInt(this.actionForm.value.reason),
      'settleBetsId': optionSelected,
      'cancelType': cancelType,
      'betStatusToCorrect': "",
      'batchBets': false
    };

   var isItalianBet = bets[0].identifier.betLabel == 'bwin.it' || bets[0].identifier.betLabel == 'giocodigitale.it';
    var italianData = {
      "linkedMarkets":this.marketResponse,
      "operationType": cancelType,
      "selectedBets":{ selections: betKeysArray },
      "isItalianBet":isItalianBet
    }
    let postParams: string = JSON.stringify(betsCancelRequest) + "&" + JSON.stringify(this.searchForm) + "&" + JSON.stringify(bets) + "&" + JSON.stringify(italianData);
    this.cancelOrSettleBets(selectedBetsMap, postParams);
  }

  onSettlement(selectedBetsMap: Map<string, any>, optionSelected: string): void {
    if (this.isBatchBets()) {
      let usBatchBetsLabels = this.warnLabelsService.getSelectedUSWarnLabels(this.batchBetsLabelsList);
      if (usBatchBetsLabels.length > 0) {
        this.warnLabelsService.showWarnLabelsDialog(usBatchBetsLabels)
          ?.then(() => this.batchBetsSettlement(optionSelected))
          .catch(() => {
            console.log('abort settlement!');
           this.handleCancel();
          })
      } else {
        return this.batchBetsSettlement(optionSelected);
      }
    } else {
      let betLabelsList = Array.from(selectedBetsMap.values()).map(bet => bet.identifier.betLabel);
      let usBetsLabels = this.warnLabelsService.getSelectedUSWarnLabels(betLabelsList);
      if (usBetsLabels.length > 0) {
        this.warnLabelsService.showWarnLabelsDialog(usBetsLabels)
          ?.then(() => this.nonBatchBetsSettlement(selectedBetsMap, optionSelected, true))
          .catch(() => {
            console.log('abort settlement!');
            this.handleCancel();
            })
      } else {
        return this.nonBatchBetsSettlement(selectedBetsMap, optionSelected, false);
      }
    }
  }

  isBatchBets() {
    return this.betStatus != '';
  }

  batchBetsSettlement(optionSelected: string) {
    let betsArray: any[] = [];
    if (optionSelected == "12" && this.isBatchBetsParticipant) {
      this.modal.warning({
        nzContent: 'Warning:\n Participant bets cannot be Settled as Won \n' +
          'Please exclude them in order to proceed with the selected action', nzClosable: false
      });
      this.resetActionForm()
      return;
    }

    var otherInternalCancelReason = "settle bet : " + this.actionForm.value.comments;
    let batchBetsSettlementRequest = {
      'bets': betsArray,
      'otherInternalCancelReason': otherInternalCancelReason,
      'externalCancelReason': "",
      'cancelType': "SettleBets",
      'settleBetsId': optionSelected,
      'resultSetID': this.resultSetId,
      'betStatusToCorrect': this.betStatus,
      'batchBets': true
    };

    let postParams: string = JSON.stringify(batchBetsSettlementRequest) + "&" + JSON.stringify(this.searchForm);
    this.cancelOrSettleBatchBets(optionSelected, postParams);
  }

  nonBatchBetsSettlement(selectedBetsMap: Map<string, any>, optionSelected: string, usLabels: boolean) {
    if (!usLabels) {
      this.modal.warning({ nzContent: "Settlement can only be performed on US Labels  \n Please perform bets cancellation for other labels or exclude bets from other labels to proceed with settlement", nzClosable: false })
      this.resetActionForm()
      return;
    }
    var settlementReason = "settle bet : " + this.actionForm.value.comments;

    let selectedBetsKey: string = "";
    let selectedGameId: string = "";
    let betsArray: any[] = [];
    let bets: any[] = [];
    let betKeysArray: any[] = [];

    for (let key of selectedBetsMap.keys()) {
      if (key != null) {
        const bet = selectedBetsMap.get(key);
        if (bet != null && optionSelected == '12' && bet.betTradingData.isParticipantBet) {
          this.modal.error({ nzContent: "Warning:\n Participant bets cannot be Settled as Won \n Please exclude them in order to proceed with the selected action", nzClosable: false })
          this.resetActionForm()
          return;
        }
        if (bet !== null && bet.identifier.key.betId == null) {
          this.modal.error({ nzContent: "Warning:\nTV1 bets cannot be Settled as Won/Lost.\n Please exclude them to proceed with the selected action or opt to Cancellation instead.", nzClosable: false })
          this.resetActionForm()
          return;
        }
      }
    }
    for (let key of selectedBetsMap.keys()) {
      if (key != null) {
        const bet = selectedBetsMap.get(key);
        bets.push(bet);
        betsArray.push(bet.identifier);
        betKeysArray.push(bet.identifier.key);
        selectedGameId = bet.betTradingData.gameId;
        selectedBetsKey += "" + bet.identifier.key.systemSlipId + "_" + bet.identifier.key.slipId + "_" + bet.identifier.key.betId + "_" + bet.identifier.key.resultId;
        bet.identifier.key.slipId + "_" + bet.identifier.key.betId + "_" + bet.identifier.key.resultId;
      }
    }
    var isItalianBet = bets[0].identifier.betLabel == 'bwin.it' || bets[0].identifier.betLabel == 'giocodigitale.it';

    let settleBetsRequest: {} = {
      'bets': betsArray,
      'externalCancelReason': parseInt(this.actionForm.value.reason),
      'otherInternalCancelReason': settlementReason,
      'cancelType': 'SettleBets',
      'settleBetsId': optionSelected,
      'betStatusToCorrect': "",
      'batchBets': false
    };
    var italianData = {
      "linkedMarkets":this.marketResponse,
      "operationType": 'SettleBets',
      "selectedBets":{ selections: betKeysArray },
      "isItalianBet":isItalianBet
    }
    let postParams: string = JSON.stringify(settleBetsRequest) + "&" + JSON.stringify(this.searchForm) + "&" + JSON.stringify(bets) + "&" + JSON.stringify(italianData);
    this.cancelOrSettleBets(selectedBetsMap, postParams);

  }

  cancelOrSettleBets(selectedBetsMaps: Map<string, any>, postParams: string): void {
    this.cancelService
      .cancel(postParams)
      .subscribe({
        next: (response: any) => {
          this.loadCancelation(selectedBetsMaps, postParams.split('&')[0], response);
          this.resetActionForm()
        },
        error: (error: any) => {
          this.modal.error({ nzContent: "Can not trigger bet correction operation! " + JSON.stringify(error), nzClosable: false })
          this.mapOfCheckedRowsForCancel.clear();
          this.resetActionForm();
          return;
        }
      });
  }

  loadCancelation(selectedBetsMap: Map<string, any>, postParams: any, response: any) {
    if (response.errorDescription) {
      this.modal.error({ nzContent: response.errorDescription, nzClosable: false })
      return;
    }
    let bets2load: any[] = [];
    bets2load = JSON.parse(postParams).bets;

    for (var i = 0; i < bets2load.length; i++) {
      var bet = bets2load[i];
      const betKey = `${bet.key.systemSlipId}_${bet.key.slipId}_${bet.key.betId}_${bet.key.resultId}`;
      let betUpdates = response.bets[betKey];
      selectedBetsMap.get(bet.key.betId).updatableInfo.chargeId = betUpdates.chargeId;
      selectedBetsMap.get(bet.key.betId).updatableInfo.cancelStatusLabel = betUpdates.cancelStatusLabel;
      selectedBetsMap.get(bet.key.betId).updatableInfo.epCancelStatusLabel = betUpdates.epCancelStatusLabel;
      selectedBetsMap.get(bet.key.betId).updatableInfo.epCancelTimestamp = betUpdates.epCancelTimestamp;
      selectedBetsMap.get(bet.key.betId).updatableInfo.epCancelledBy = betUpdates.epCancelledBy;
      selectedBetsMap.get(bet.key.betId).updatableInfo.lastUpdateCancellationTimestamp = betUpdates.lastUpdateCancellationTimestamp;
      selectedBetsMap.get(bet.key.betId).updatableInfo.lastUpdateStatusBetBy = betUpdates.lastUpdateStatusBetBy;
      selectedBetsMap.get(bet.key.betId).updatableInfo.epCanBeProcessed = betUpdates.epCanBeProcessed;
      selectedBetsMap.get(bet.key.betId).updatableInfo.epReserved = betUpdates.epReserved;
      selectedBetsMap.get(bet.key.betId).updatableInfo.canBeProcessed = betUpdates.canBeProcessed;
    }
  }

  cancelOrSettleBatchBets(optionSelected: string, postParams: string): void {
    const action = BatchBetsActionMap.get(optionSelected);
    const progressDialog = this.modal.create({
      nzTitle: 'Batch Cancellation Progress',
      nzContent: ProgressDialogComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzFooter: null,
    });
    this.cancelService
      .cancel(postParams)
      .subscribe({
        next: (response: any) => {
          let stornoChargeId = response.chargeId;
          let errorDescription = response.errorDescription;
          if (stornoChargeId > 0) {
            this.checkStornoChargeStatus(stornoChargeId, progressDialog, action);
          } else {
            progressDialog.destroy();
            this.modal.error({ nzContent: "Warning: " + errorDescription, nzClosable: false })
            return;
          }
          this.resetActionForm()
        },
        error: (error: any) => {
          progressDialog.destroy();
          this.modal.error({ nzContent: "Error: Can not trigger batch bets correction operation! " + JSON.stringify(error), nzClosable: false })
          this.resetActionForm()
          return;
        }
      });
  }

  checkStornoChargeStatus(stornoChargeId: number, progressDialog: any, action: any) {
    this.cancelService
      .stornoChargeStatus(stornoChargeId)
      .subscribe({
        next: (response: any) => {
          if (response == null) {
            this.modal.error({ nzContent: 'Error:  Can not trigger storno charge progress operation!' + stornoChargeId, nzClosable: false })
            return;
          } else {
            this.showStornoProgressResult(response, stornoChargeId, progressDialog, action);
          }
        },
        error: (error: any) => {
          progressDialog.destroy();
          this.modal.error({ nzContent: "Error: Can not trigger batch bets correction operation! " + JSON.stringify(error), nzClosable: false })
          return;
        }
      });
  }

  showStornoProgressResult(result: any, chargeId: number, progressDialog: any, action: any) {
    var chargeStatus = result.chargeStatus;
    if (chargeStatus == 2) {
      this.batchService.progressUpdateEvent.emit();
      progressDialog.destroy();
      let response = {
        result: result,
        chargeId: chargeId,
        originalState: this.betStatus,
        action: action
      };
      this.stornoDataSharedService.setResponse(response);
      const reportDialog = this.modal.create({
        nzContent: ReportDialogComponent,
      });
    } else if (chargeStatus == 1 || chargeStatus == 0) {
      this.checkStornoChargeStatus(chargeId, progressDialog, action);
    } else {
      this.modal.closeAll();
    }
  }

  customColumn: CustomColumn[] = [
    { name: 'checkbox', value: 'checkbox', default: true, required: true, position: 'left', width: 50, fixWidth: true},
    { name: 'AccountName', value: 'AccountName', default: true, required: true, position: 'left', width: 150 },
    { name: 'Betslip - Type', value: 'BetNumber', default: true, required: true, position: 'left', width: 120  },
    { name: 'Bet Place UTC', value: 'TimeStampSlipUTC',  default: true, required: true, position: 'left', width: 150  },
    { name: 'Correction Status', value: 'CancellationStatus',  default: true, required: true, position: 'left', width: 150  },
    { name: 'Correction Time', value: 'CancellationTimestamp',  default: true, required: true, position: 'left', width: 150 },
    { name: 'Event', value: 'Event/Fixture',  default: true, required: true, position: 'left', width: 280  },
    { name: 'Market', value: 'Game/Market',  default: true, required: true, position: 'left', width: 120 },
    { name: 'Selection - Trading Payout UTC', value:'Result/Participant', default: true, required: true, position: 'left', width: 100  },
    { name: 'Stake EUR', value: 'Stake',  default: true, required: true, position: 'left', width: 80 },
    { name: 'StakeLC', value: 'StakeLC', default: true, required: true, position: 'left', width: 80 },
    { name: 'Odds', value: 'TOdds', default: true, required: true, position: 'left', width: 80 },
    { name: 'SGP Group - Status / ID / Decimal Odds / US odds	', value: 'SGPGroup',  default: true, required: true, position: 'left', width: 150},
    { name: 'Timestamp Payout', value: 'TimestampPayout', default: true, required: true, position: 'left', width: 100 },
    { name: 'UK Odds', value: 'ROdds-dec', default: false, position: 'right', width: 120},
    { name: 'US Odds', value: 'ROdds-frac', default: false, position: 'right', width: 120},
    { name: 'Label', value: 'Label', default: false, position: 'right', width: 120},
    { name: 'Sport/Region', value: 'Sport/Region', default: false, position: 'right', width: 120 }

    /* Might require at a later point of time by product.. Will delete them after first release. */

    /* { name: 'UserId', value: 'UserId', default: true, required: true, position: 'left', width: 120, fixWidth: true },
    { name: 'SlipLanguage', value: 'SlipLanguage', default: true, required: true, position: 'left', width: 120, fixWidth: true },
    { name: 'TimeStampSlip', value: 'TimeStampSlip', default: true, required: true, position: 'left', width: 130, fixWidth: true },
    { name: 'Bettype', value: 'Bettype', default: false, width: 120, fixWidth: true },
    { name: 'ROdds-frac', value: 'ROdds-frac', default: false, width: 120, fixWidth: true },
    { name: 'SlipId', value: 'SlipId', default: false, width: 120, fixWidth: true },
    { name: 'SystemSlipID', value: 'SystemSlipID', default: false, width: 120, fixWidth: true },
    { name: 'League/Meeting', value: 'League/Meeting', default: true, required: true, position: 'right', width: 200, fixWidth: true }, */
  ];

  isDragNDropModalVisible: boolean = false;
  title: CustomColumn[] = [];
  footer: CustomColumn[] = [];
  fix: CustomColumn[] = [];
  notFix: CustomColumn[] = [];

  drop(event: CdkDragDrop<CustomColumn[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.fix = this.fix.map(item => {
      item.default = true;
      return item;
    });
    this.notFix = this.notFix.map(item => {
      item.default = false;
      return item;
    });
    this.cdr.markForCheck();
  }

  deleteCustom(value: CustomColumn, index: number): void {
    value.default = false;
    this.notFix = [...this.notFix, value];
    this.fix.splice(index, 1);
    this.cdr.markForCheck();
  }

  addCustom(value: CustomColumn, index: number): void {
    value.default = true;
    this.fix = [...this.fix, value];
    this.notFix.splice(index, 1);
    this.cdr.markForCheck();
  }

  showDragNDropModal(): void {
    this.isDragNDropModalVisible = true;
  }

  handleCustomColumnOk(): void {
    this.customColumn = [...this.title, ...this.fix, ...this.notFix, ...this.footer];
    this.actionsService.customColumnEvent.emit(this.customColumn);
    this.isDragNDropModalVisible = false;
    this.cdr.markForCheck();
  }

  handleCustomColumnCancel(): void {
    this.isDragNDropModalVisible = false;
  }

  formatDate(dateStr: string) {
    var dateParts = dateStr.split('T');
    var dateOnly = dateParts[0].replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$2/$1/$3");
    var timeOnly = dateParts[1].split('.')[0];

    return new Date(dateOnly + ' ' + timeOnly);
  }

  getEarliestTimestamp(bets: any[]) {
    var result = this.formatDate(bets[0].identifier.italianTimestampUtc).getTime();
    var resultStr = bets[0].identifier.italianTimestampUtc;
    for (var i = 1; i < bets.length; i++) {
      var currDate = this.formatDate(bets[i].identifier.italianTimestampUtc).getTime();
      if (result > currDate) {
        result = currDate;
        resultStr = bets[i].identifier.italianTimestampUtc;
      }
    }

    return resultStr.replace('T', ' ');
  }

  fetchLinkedMarkets(bets: any) {
    this.bwilinkedmarketsservice
      .fetchMarkets(bets)
      .pipe(
        map((marketResponse) => {
          this.marketResponse = marketResponse;
          this.linkedMarkets = marketResponse.markets;
        }))
      .subscribe({});
  }

}
