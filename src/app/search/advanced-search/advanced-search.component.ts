import { Component, Input, OnInit } from '@angular/core';
import { Query } from '../../models/query';
import { QueryData } from '../../models/query-data';
import { Option } from '../../models/option.model';
import { LanguagesService } from '../../services/languages.service';
import { LoginDomainsService } from '../../services/login-domains.service';
import { ControlContainer, NonNullableFormBuilder, FormGroup, Validators } from '@angular/forms'
import { BetStatusConstant } from '../constant/bet-status-constant';
import { CashoutStatusConstant } from '../constant/cashout-status-constant';
import { RepricingStatusConstant } from '../constant/repricing-status-constant';
import { BetTypeConstant } from '../constant/bet-type-constant';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.css']
})

export class AdvancedSearchComponent implements OnInit {
  queries: Query[] = [];
  queryLength: number;
  isAdvancedSearchPanelCollapsed: boolean;
  betStatus: Option[];
  betType: Option[];
  cashoutStatus: Option[];
  repricingStatus: Option[];
  repricingPendingSinceMins : String;
  fullOGP : boolean;
  slipLanguages: Option[];
  betLabels: Option[];
  searchFormGroup: FormGroup;
  advancedSearchFormGroup: FormGroup;
  dropdownSettings: IDropdownSettings = {};

  constructor(private fb: NonNullableFormBuilder,
    private lablesApi: LoginDomainsService,
    private languagesApi: LanguagesService,
    public controlContainer: ControlContainer) {
    this.betStatus = BetStatusConstant;
    this.cashoutStatus = CashoutStatusConstant;
    this.repricingStatus = RepricingStatusConstant;
    this.betType = BetTypeConstant;

    this.lablesApi.getLabels().subscribe((labels) => {
      this.betLabels = labels;
      this.advancedSearchFormGroup.patchValue({
        betLabel: this.betLabels
      });
    });
      this.languagesApi.getLanguages().subscribe((languages)=> {
        this.slipLanguages = languages;
    });
  }


  ngOnInit(): void {
    this.searchFormGroup = this.controlContainer.control as FormGroup;
    this.initAdvancedSearchForm();
    this.searchFormGroup.addControl('advancedSearch', this.advancedSearchFormGroup);
    this.isAdvancedSearchPanelCollapsed = false;
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'viewValue',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  initAdvancedSearchForm() {
    this.advancedSearchFormGroup = this.fb.group({
      betStatus: this.fb.control<Option | null>({ value: null, disabled: true }),
      cashoutStatus: this.fb.control<Option | null>(null),
      repricingStatus: this.fb.control<Option | null>(null),
      repricingPendingSinceMins: this.fb.control<String>("", [Validators.min(1), Validators.max(2147483647)]),
      fullOGP: this.fb.control<Boolean>(false),
      slipLanguage: this.fb.control<Option | null>(null),
      betLabel: this.fb.control<Option[] | null>(null),
      betType: this.fb.control<Option | null>(null),
      oddsFrom: this.fb.control<String | null>(null, Validators.pattern("[0-9]{0,2}(,[0-9]{1,2}){0,1}")),
      oddsTo: this.fb.control<String | null>(null, Validators.pattern("[0-9]{0,2}(,[0-9]{1,2}){0,1}")),
    })
  }
  get advancedSearchFormControl() { return this.advancedSearchFormGroup.controls; }

  toggleAdvancedSearchPanel() {
    this.isAdvancedSearchPanelCollapsed = !this.isAdvancedSearchPanelCollapsed;
    this.updateCollapseActive(this.isAdvancedSearchPanelCollapsed)
  }

  updateCollapseActive(panelCollapseStatus: boolean) {
    this.isAdvancedSearchPanelCollapsed = panelCollapseStatus;
    // this.queries = [];
    const advancedSearchFormValue = this.advancedSearchFormGroup?.value;
    this.queries = [];
    if (advancedSearchFormValue.sportId != null) {
      this.queries.push(this.createQuery("Sport", advancedSearchFormValue.sportId, "sportId"));
    }
    if (advancedSearchFormValue.betStatus != null && advancedSearchFormValue.betStatus.length > 0) {
      this.queries.push(this.createQueryFromMultiple("Bet Status", advancedSearchFormValue.betStatus, "betStatus"));
    }
    if (advancedSearchFormValue.cashoutStatus != null) {
      this.queries.push(this.createQuery("Cashout Status", advancedSearchFormValue.cashoutStatus, "cashoutStatus"));
    }
    if (advancedSearchFormValue.repricingStatus != null) {
      this.queries.push(this.createQuery("Repricing Status", advancedSearchFormValue.repricingStatus, "repricingStatus"));
    }
    if (advancedSearchFormValue.slipLanguage != null) {
      this.queries.push(this.createQuery("Slip Languages", advancedSearchFormValue.slipLanguage, "slipLanguage"));
    }
    if (advancedSearchFormValue.betType != null) {
      this.queries.push(this.createQuery("Bet Type", advancedSearchFormValue.betType, "betType"));
    }
    if (advancedSearchFormValue.betLabel != null && advancedSearchFormValue.betLabel.length > 0) {
      this.queries.push(this.createQueryFromMultiple("Bet Labels", advancedSearchFormValue.betLabel, "betLabel"));
    }
    if (advancedSearchFormValue.oddsFrom != null) {
      this.queries.push(new Query("Odds From", [new QueryData(advancedSearchFormValue.oddsFrom, "oddsFrom")]));
    }
    if (advancedSearchFormValue.oddsTo != null) {
      this.queries.push(new Query("Odds To", [new QueryData(advancedSearchFormValue.oddsTo, "oddsTo")]));
    }
    this.queryLength = this.queries.length;
  }

  private createQuery(name: string, value: Option, type: string) {
    const queryDataArray: QueryData[] = [];
    const queryData = new QueryData(value.viewValue.toString(), type);
    queryDataArray.push(queryData);
    return new Query(name, queryDataArray);
  }

  private createQueryFromMultiple(name: string, values: Option[], type: string) {
    const queryDataArray: QueryData[] = [];
    let viewvalueArr: string[] = [];
    values.map(value => viewvalueArr.push(value.viewValue.toString()));
    const queryData = new QueryData(viewvalueArr.join(", "), type);
    queryDataArray.push(queryData);
    return new Query(name, queryDataArray);
  }

  createTagName(queryData: QueryData) {
    return queryData.value;
  }

  onRemoveAll() {
    this.queries.splice(0, this.queryLength);
    this.queryLength = this.queries.length;
    this.advancedSearchFormGroup.reset();
  }

  onRemoveOne(queryParameterIndex: number, queryDataIndex: number) {
    const formControl = this.queries[queryParameterIndex].data[queryDataIndex].type
    this.queries.splice(queryParameterIndex, 1)
    this.queryLength = this.queries.length;
    this.advancedSearchFormGroup.get(formControl)?.reset();
  }

  onChangeBetStatus() {
    if (this.advancedSearchFormGroup.get("betStatus")?.value != null) {
      this.advancedSearchFormGroup.get("cashoutStatus")?.disable();
    }
    else {
      this.advancedSearchFormGroup.get("cashoutStatus")?.enable();
    }
  }

  onChangeCashoutStatus() {
    if (this.advancedSearchFormGroup.get("cashoutStatus")?.value != null) {
      this.advancedSearchFormGroup.get("betStatus")?.reset();
      this.advancedSearchFormGroup.get("betStatus")?.disable();
    }
    else if (this.searchFormGroup.get('tradingPartition')?.value.id != 1) {
      this.advancedSearchFormGroup.get("betStatus")?.enable();
    }
  }
}
