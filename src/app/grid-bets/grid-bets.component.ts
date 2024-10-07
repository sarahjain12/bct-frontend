import { Component, OnInit, ViewChild } from '@angular/core';
import { BetsService } from '../services/bets.service';
import { AccountService } from '../services/account.service';
import { ActionsComponent } from '../actions/actions.component';
import { ActionsService } from '../services/actions.service';
import { CustomColumn } from '../models/custom.column';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from '../shared/services/auth.service';
import {AppConfigService} from "../app.config.service";

@Component({
  selector: 'app-grid-bets',
  templateUrl: './grid-bets.component.html',
  styleUrls: ['./grid-bets.component.css'],
})
export class GridBetsComponent implements OnInit {

  allBets: any[] = [];
  betResponse: any;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<number>();
  setOfEPCheckedId = new Set<number>();
  setOfREPCheckedId = new Set<number>();
  betsByEpState: any[] = []
  requiredData: Record<string, any>;
  accountBalance: string;
  rowCount: any;
  accountCategory: string;
  @ViewChild(ActionsComponent) actionsComponent: any;
  customColumn: CustomColumn[] = []
  hasReadPermissions: boolean = false;
  hasWritePermissions: boolean = false;
  batch_count: number;

  constructor(private betsService: BetsService,
    private accountService: AccountService,
    private actionsService: ActionsService,
    private modal: NzModalService,
    private _authService: AuthService) {
  }

  ngOnInit() {
    this.betsService.gridSearchResultsEvent.subscribe((betResponse: any) => {
      this.allBets = betResponse.bets;
      this.betResponse = betResponse;
      this.rowCount = betResponse.bets.length
    });
    this.actionsService.customColumnEvent.subscribe((customColumn: any) => {
      this.customColumn = customColumn;
    })
    this.actionsService.selectAllEvent.subscribe((isSelectAllChecked: any) => {
      if (isSelectAllChecked) {
        this.allBets.filter((bet) => this.canBeProcessed(bet))
          .forEach((validBet) => this.setOfCheckedId.add(validBet.identifier.key.betId));
      } else {
        this.allBets.filter((bet) => this.canBeProcessed(bet))
          .forEach((bet) => this.setOfCheckedId.delete(bet.identifier.key.betId));
      }
    });
    //reset cancel request
    this.actionsService.actionPerformedEvent.subscribe((bets: any[]) => {
      bets.forEach(bet => {
      this.setOfCheckedId.delete(bet.identifier.key.betId)
      this.setOfEPCheckedId.delete(bet.identifier.key.betId)
      this.setOfREPCheckedId.delete(bet.identifier.key.betId)
    });
      this.actionsComponent.refreshCancelCheckedStatus();
    })
    this._authService.ifUserHasWritePermissions().then(write => {
      this.hasWritePermissions = write;
    });
    this._authService.ifUserHasReadPermissions().then(read => {
      this.hasReadPermissions = read;
    });
    this.batch_count = AppConfigService.settings.batch_count;
  }

  canBeProcessed(bet: any): boolean {
    return bet.updatableInfo.canBeProcessed
      && bet.identifier.canBeCanceled
      && !bet.lockedByEditBet
  }

  selectToCancel(betId: number, bet: any, checked: boolean): void {
    if (bet.type == "SINGLE") {
      //Select ep checkbox
      this.updateEPCheckedSet(betId, checked);
    }
    if (checked) {
      //deselect all rep checkbox
      this.allBets
        .forEach((bet) => {
          this.updateREPCheckedSet(bet.identifier.key.betId, false)
          this.actionsComponent.updateREPMap(betId, false, bet)
        });
    }
    this.updateCancelCheckedSet(betId, checked);
    this.actionsComponent.updateCancelMap(betId, checked, bet);
    //select/deselect Cancel checkboxes with same system slip id
    this.makeCancelSelection(bet, checked);
    this.actionsComponent.isNewSearch = false;
    this.actionsComponent.isActionTriggered = false;
    this.actionsComponent.refreshCancelCheckedStatus();
  }

  epToCancel(betId: number, bet: any, checked: boolean): void {
    this.betsByEpState = this.allBets
      .filter(b => b.identifier.epStatusText == bet.identifier.epStatusText);
    if (checked) {
      //deselect all cancel checkbox
      this.setOfCheckedId.clear();
      this.actionsComponent.clearCancelMap();
      this.actionsComponent.isNewSearch = false;
      this.actionsComponent.isActionTriggered = false;
      this.actionsComponent.refreshCancelCheckedStatus();
    }
    this.updateEPCheckedSet(betId, checked);
    this.actionsComponent.updateEPMap(betId, checked, bet);
    //select/deselect EP checkboxes with same system slip id
    this.makeEPSelection(bet, checked);
    this.toggleComboSelection(bet, checked);
  }

  repToCancel(betId: number, bet: any, checked: boolean): void {
    this.betsByEpState = this.allBets
      .filter(b => b.identifier.epStatusText == bet.identifier.epStatusText);
    if (checked) {
      //deselect all cancel checkbox
      this.setOfCheckedId.clear();
      this.actionsComponent.clearCancelMap();
      this.actionsComponent.isNewSearch = false;
      this.actionsComponent.isActionTriggered = false;
      this.actionsComponent.refreshCancelCheckedStatus();
    }
    this.updateREPCheckedSet(betId, checked);
    this.actionsComponent.updateREPMap(betId, checked, bet);
    //select/deselect REP checkboxes with same system slip id
    this.makeREPSelection(bet, checked);
    this.toggleComboSelection(bet, checked);
  }

  toggleComboSelection(betSelected: any, checked: boolean): void {
    this.betsByEpState.forEach((currentBetSelection) => {
      if (this.areInTheSameSimpleCombo(currentBetSelection, betSelected)) {
        this.updateEPCheckedSet(currentBetSelection.identifier.key.betId, checked)
        this.actionsComponent.updateEPMap(currentBetSelection.identifier.key.betId, checked, currentBetSelection);
      }
    })
  }

  areInTheSameSimpleCombo(betA: any, betB: any): boolean {
    return betA.identifier.key.systemSlipId == null && betB.identifier.key.systemSlipId == null &&
      betA.identifier.key.slipId == betB.identifier.key.slipId &&
      ((betA.identifier.key.resultId != null && betB.identifier.key.resultId != null && betA.identifier.key.resultId != betB.identifier.key.resultId) ||
        (betA.identifier.key.betId != null && betB.identifier.key.betId != null && betA.identifier.key.betId != betB.identifier.key.betId))
  }

  makeCancelSelection(betSelected: any, checked: boolean): void {
    if (betSelected.identifier.key.systemSlipId) {
      for (let tmpBet of this.allBets) {
        if (betSelected != tmpBet) {
          if (tmpBet.identifier.canBeCanceled && tmpBet.identifier.key.systemSlipId
            && tmpBet.identifier.key.systemSlipId == betSelected.identifier.key.systemSlipId
            && ((tmpBet.identifier.key.resultId && betSelected.identifier.key.resultId === tmpBet.identifier.key.resultId)
              || (tmpBet.identifier.key.betId && betSelected.identifier.key.betId === tmpBet.identifier.key.betId))) {
            this.updateCancelCheckedSet(tmpBet.identifier.key.betId, checked);
            this.actionsComponent.updateCancelMap(tmpBet.identifier.key.betId, checked, tmpBet);
          }
        }
      }
    }
  }

  makeEPSelection(betSelected: any, checked: boolean): void {
    if (betSelected.identifier.key.systemSlipId) {
      for (let tmpBet of this.betsByEpState) {
        if (betSelected.identifier.key.betId != tmpBet.identifier.key.betId) {
          if (tmpBet.identifier.epGroupId && tmpBet.identifier.epStatusId != "3" &&
            tmpBet.identifier.epGroupId === betSelected.identifier.epGroupId) {
            if (checked && betSelected.identifier.epStatusId == "2" &&
              !(betSelected.identifier.epCancelStatusId && tmpBet.identifier.epCancelStatusId)) {
               // var element:HTMLInputElement=document.getElementById('EP_checkbox_'+betSelected.identifier.key.betId) as HTMLInputElement;
                this.modal.error({
                nzContent: "There is already a betcorrection on one of the bets.",
                nzClosable: false,
              })
              //deselect all EP checkboxes
              this.setOfEPCheckedId.clear();
              this.actionsComponent.clearEPMap();
              return;
            } else {
              this.updateEPCheckedSet(tmpBet.identifier.key.betId, checked);
              this.actionsComponent.updateEPMap(tmpBet.identifier.key.betId, checked, tmpBet)
            }
          }
        }
      }
    }
  }

  makeREPSelection(betSelected: any, checked: boolean): void {
    if (betSelected.identifier.key.systemSlipId) {
      for (let tmpBet of this.betsByEpState) {
        if (betSelected.identifier.key.betId != tmpBet.identifier.key.betId) {
          if (tmpBet.identifier.epGroupId && tmpBet.identifier.epStatusId != "3" &&
            tmpBet.identifier.epGroupId === betSelected.identifier.epGroupId) {
            if (checked && betSelected.identifier.epStatusId == "2" &&
              !(betSelected.identifier.epCancelStatusId && tmpBet.identifier.epCancelStatusId)) {
               // var element:HTMLInputElement=document.getElementById('EP_checkbox_'+betSelected.identifier.key.betId) as HTMLInputElement;
                this.modal.error({
                nzContent: "There is already a betcorrection on one of the bets.",
                nzClosable: false,
              })
              //deselect all EP checkboxes
              this.setOfREPCheckedId.clear();
              this.actionsComponent.clearREPMap();
              return;
            } else {
              this.updateREPCheckedSet(tmpBet.identifier.key.betId, checked);
              this.actionsComponent.updateREPMap(tmpBet.identifier.key.betId, checked, tmpBet)
            }
          }
        }
      }
    }
  }

  updateCancelCheckedSet(betId: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(betId);
    } else {
      this.setOfCheckedId.delete(betId);
    }
  }

  updateEPCheckedSet(betId: number, checked: boolean): void {
    if (checked) {
      this.setOfEPCheckedId.add(betId);
    } else {
      this.setOfEPCheckedId.delete(betId);
    }
  }

  updateREPCheckedSet(betId: number, checked: boolean): void {
    if (checked) {
      this.setOfREPCheckedId.add(betId);
    } else {
      this.setOfREPCheckedId.delete(betId);
    }
  }

  getAccountBalance(userId: string): void {
    this.accountService.accountBalance(userId)
      .subscribe((response: Record<string, any>) => {
        this.requiredData = response;
        var casheableValue = this.requiredData.casheableMoney;
        var bonusValue = this.requiredData.bonusMoney;
        var owedValue = this.requiredData.owedMoney;
        this.accountBalance = "<font>cashable:" + casheableValue + "</font>";
        this.accountBalance += "<font color=\"red\">owed:" + owedValue + "</font>";
        this.accountBalance += "<font color=\"green\">bonus:" + bonusValue + "</font>";
        for (var i = 0; i < (this.rowCount); i++) {
          if (this.allBets[i].userId == userId) {
            const element: HTMLElement = document.getElementById('balance_span_' + i + '_' + userId) as HTMLElement;
            element.innerHTML = this.accountBalance;
          }
        }
      });
  }

  getAccountName(userId: string): void {
    this.accountService.accountCategory(userId)
      .subscribe((response: Record<string, string>) => {
        this.accountCategory = response.category;
        for (var i = 0; i < (this.rowCount); i++) {
          if (this.allBets[i].userId == userId) {
            const element: HTMLElement = document.getElementById('name_span_' + i + '_' + userId) as HTMLElement;
            element.innerHTML = this.accountCategory;
          }
        }
      });
  }
}
