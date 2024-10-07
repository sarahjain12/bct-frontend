import { Component, OnInit, ViewChild } from '@angular/core';
import { NonNullableFormBuilder, FormGroup, Validators } from '@angular/forms'
import { AuthService } from '../shared/services/auth.service';
import { Option } from '../models/option.model';
import { OfferTypesConstant } from './constant/offer-types-constant';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SearchPanelService } from '../services/search.service';
import { AdvancedSearchComponent } from './advanced-search/advanced-search.component';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { BetsService } from '../services/bets.service';
import { TradingPartitionsConstant } from './constant/trading-partitions-constant';
import { SportsService } from '../services/sports.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit {
  size: NzButtonSize = 'large';
  searchForm: FormGroup;
  offerTypes: Option[];
  errorMessage: string;
  @ViewChild(AdvancedSearchComponent) advancedSearchComponent: any;
  tradingPartitions: Option[];
  sports: Option[];
  hasAdminPermissions:boolean;
  disableDownloadExcel:boolean;

  constructor(private fb: NonNullableFormBuilder,
    private sportsApi: SportsService,
    private modal: NzModalService,
    private searchPanelService: SearchPanelService,
    private betsService: BetsService,
    private authService: AuthService) {
    this.offerTypes = OfferTypesConstant;
    this.tradingPartitions = TradingPartitionsConstant
    this.sportsApi.getSports().subscribe((s) => {
      this.sports = s.sort((a, b) => {
        return a.viewValue > b.viewValue ? 1 : -1
      });
    });
    this.disableDownloadExcel = false;
  }

  ngOnInit(): void {
    this.authService.checkIfUserIsAdmin().then(isAdmin => {
      this.hasAdminPermissions = isAdmin;
    });
    this.initSearchForm();
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      offerId: this.fb.control<String>('', Validators.pattern("^-?[0-9]*(;[0-9]*){0,2}")),
      offerType: this.fb.control<Option>(this.offerTypes[0]),
      mode: this.fb.control<String>('1'),
      accountName: this.fb.control<String>('', Validators.pattern("((([a-zA-Z]){2}_)*([a-zA-Z0-9])[a-zA-Z0-9_.-]{4,})(;[ ]*((([a-zA-Z]){2}_)*([a-zA-Z0-9])[a-zA-Z0-9_.-]{4,}))*|(\[0-9]{1,10};[ ]*){0,2}[0-9]{1,10}[ ]*")),
      betnumber: this.fb.control<String>('', Validators.pattern("^[a-zA-Z0-9]{10}")),
      tradingPartition: this.fb.control<Option>(this.tradingPartitions[0]),
      sportId: this.fb.control<Option | null>({ value: null, disabled: true }),
      chargeId: this.fb.control<String>('', [Validators.min(1), Validators.max(2147483647)]),
      timestampFrom: this.fb.control<Date | null>(null),
      timestampTo: this.fb.control<Date | null>(null),
      _manipulateOlderBets: this.fb.control<Boolean>(false)
    });
  }

  get searchFormControl() { return this.searchForm.controls; }

  onSubmit(): void {
    if (this.advancedSearchComponent.isAdvancedSearchPanelCollapsed) {
      this.advancedSearchComponent.updateCollapseActive(false)
    }
    this.showErrorMessage();
    if (this.errorMessage == '') {
      this.searchPanelService.appliedSearchEvent.emit(this.searchForm);
    }
  }

  downloadExcel(): void {
    console.log('download form data : ', this.searchForm.getRawValue());
    this.betsService.downloadBets(this.searchForm.getRawValue());
  }

  resetForm() {
    this.initSearchForm();
    this.searchForm.addControl('advancedSearch', this.advancedSearchComponent.advancedSearchFormGroup);
    const advancedSearchFormControls = Object.keys(this.advancedSearchComponent.advancedSearchFormGroup.controls)
    advancedSearchFormControls
      .forEach(k => this.advancedSearchComponent.advancedSearchFormGroup.controls[k].reset())
    this.advancedSearchComponent.updateCollapseActive(false)
  }

  exclusiveEnable(formControlName: any) {
    const allFormControls = Object.keys(this.searchFormControl);
    const advancedSearchFormControls = Object.keys(this.advancedSearchComponent.advancedSearchFormGroup.controls);
    const fieldFormControl = this.searchForm.get(formControlName);
    if (!!fieldFormControl?.value) {
      allFormControls
        .filter(key => key != formControlName && key!='tradingPartition' && key != '_manipulateOlderBets')
        .forEach(k => {
          this.searchForm.controls[k].reset()
          this.searchForm.controls[k].disable()
        });
        advancedSearchFormControls
        .filter(key => key != 'betLabel' && key != 'repricingStatus' && key != 'fullOGP' &&  key != 'repricingPendingSinceMins')
        .forEach(k => {
          this.advancedSearchComponent.advancedSearchFormGroup.controls[k].reset()
          this.advancedSearchComponent.advancedSearchFormGroup.controls[k].disable()
        });

        advancedSearchFormControls
                .filter(key =>  key == 'repricingStatus' || key == 'fullOGP' || key == 'repricingPendingSinceMins')
                .forEach(k => {
                  this.advancedSearchComponent.advancedSearchFormGroup.controls[k].enable()
                });
    }
    else {
      allFormControls
        .filter(key => key != 'advancedSearch')
        .forEach(key => {
          this.searchForm.controls[key].enable()
        });
        advancedSearchFormControls
        .forEach(k => {
          this.advancedSearchComponent.advancedSearchFormGroup.controls[k].enable();
        });
    }
  }

  showErrorMessage() {
    const fieldsToSkip:string[]=["offerType", "mode", "accountName", "_manipulateOlderBets"];
    this.errorMessage = "";
    if (!this.isSearchFieldProvided()) {
      this.errorMessage = "Please provide at least one out of: EventID, GameID, ResultID, AccountName, ChargeID or Betnumber"
    } else if (this.searchForm.get('accountName')?.value != "" && this.isFormEmpty(
      fieldsToSkip, ["tradingPartition"])) {
      this.errorMessage = "You selected only an accountName or userId.\nPlease use the advanced search options and refine your search"
    } else if (this.searchForm.get('accountName')?.value != "" && this.isFormEmpty(
      fieldsToSkip, ["tradingPartition", "slipLanguage"])) {
      this.errorMessage = "You selected only an accountName (or userId) and slip language.\nPlease use the advanced search options and refine your search"
    } else if (this.searchForm.get('accountName')?.value != "" && this.isFormEmpty(
      fieldsToSkip, ["tradingPartition", "betLabel"])) {
      this.errorMessage = "You selected only an accountName and a bet label.\nPlease use the advanced search options and refine your search"
    } else if (this.searchForm.get('accountName')?.value != "" && this.isFormEmpty(
      fieldsToSkip, ["tradingPartition", "slipLanguage", "betLabel"])) {
      this.errorMessage = "You selected only an accountName, slip language and bet label.\nPlease use the advanced search options and refine your search"
    } else if (this.searchForm.get('offerId')?.value != "" && this.isSportSelected()) {
      this.errorMessage = "Please select a sport to search for V2/V3/V4/V5/V6 bets"
    } else if (this.searchForm.get('chargeId')?.value != "" && this.isTradingPartitionV1()) {
      this.errorMessage = "Please select Trading Partition V2/V3/V4/V5/V6"
    } else if (this.isTimestampToBeforeTimestampFrom()) {
      this.errorMessage = "TimestampTo should not be before TimestampFrom"
    }
    if (this.errorMessage != "") {
      this.modal.error({
        nzContent: this.errorMessage,
        nzClosable: false
      })
    }
  }

  isSearchFieldProvided(): boolean {
    const offerIdControl = this.searchForm.get('offerId');
    const accountNameControl = this.searchForm.get('accountName');
    const betnumberControl = this.searchForm.get('betnumber');
    const chargeIdControl = this.searchForm.get('chargeId');
    const sgpRepricingControl = this.advancedSearchComponent.advancedSearchFormGroup.get('repricingStatus');
    if ((offerIdControl?.valid && offerIdControl.value != '') ||
      (accountNameControl?.valid && accountNameControl.value != '') ||
      (betnumberControl?.valid && betnumberControl.value != '') ||
      (chargeIdControl?.valid && chargeIdControl.value != '')  ||
      (sgpRepricingControl?.valid && sgpRepricingControl.value != '')) {
      return true;
    } else {
      return false;
    }
  }

  isTimestampToBeforeTimestampFrom(): boolean {
    const timestampFrom = this.searchForm.get('timestampFrom')?.value;
    const timestampTo = this.searchForm.get('timestampTo')?.value;
    if (timestampFrom && timestampTo && timestampTo < timestampFrom) {
      return true;
    } else {
      return false;
    }
  }

  isFormEmpty(fieldsToSkip: string[], advancedFieldsToSkip: string[]): boolean {
    let isEmpty: boolean = true
    const searchFormControls = Object.keys(this.searchFormControl)
    const advancedSearchFormControls = Object.keys(this.advancedSearchComponent.advancedSearchFormGroup.controls)
    const filteredSearchFormControls = searchFormControls
      .filter(key => !fieldsToSkip.includes(key) && key != "advancedSearch")
    for (let k of filteredSearchFormControls) {
      if (this.searchForm.controls[k].value != null && this.searchForm.controls[k].value != '') {
        isEmpty = false;
        break;
      }
    }
    if (isEmpty) {
      const filteredAdvancedSearchFormControls = advancedSearchFormControls
        .filter(key => !advancedFieldsToSkip.includes(key))
      for (let k of filteredAdvancedSearchFormControls) {
        if (this.advancedSearchComponent.advancedSearchFormGroup.controls[k].value != null) {
          isEmpty = false;
          break;
        }
      }
    }
    return isEmpty;
  }

  onChangeTradingPartition() {
    if (this.searchForm.get("tradingPartition")?.value == this.tradingPartitions[0]) {
      this.searchForm.get("sportId")?.reset();
      this.searchForm.get("sportId")?.disable();
      this.advancedSearchComponent.advancedSearchFormGroup.get("betStatus")?.reset();
      this.advancedSearchComponent.advancedSearchFormGroup.get("betStatus")?.disable();
      this.advancedSearchComponent.advancedSearchFormGroup.get("cashoutStatus")?.enable();
    }
    else {
      if (this.advancedSearchComponent.advancedSearchFormGroup.get('cashoutStatus')?.value == null) {
        this.advancedSearchComponent.advancedSearchFormGroup.get("betStatus")?.enable();
      }
      this.searchForm.get("sportId")?.enable();
    }
  }

  isTradingPartitionV1(): boolean {
    return this.searchForm.get('tradingPartition')?.value == this.tradingPartitions[0];
  }

  isSportSelected(): boolean {
    const tradingPartition = this.searchForm.get('tradingPartition')?.value;
    const sportId = this.searchForm.get('sportId')?.value;
    if (tradingPartition != this.tradingPartitions[0] && sportId == null) {
      return true;
    } else {
      return false;
    }
  }

  onDisableExcelDownloadChange(flag:boolean) {
    this.disableDownloadExcel = flag;
  }

}
