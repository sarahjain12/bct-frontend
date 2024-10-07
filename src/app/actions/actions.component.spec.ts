import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionsComponent } from './actions.component';

describe('ActionsComponent', () => {
  let component: ActionsComponent;
  let fixture: ComponentFixture<ActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActionsComponent]
    });
    fixture = TestBed.createComponent(ActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/*export class ActionsComponent implements OnInit {

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
customColumn: CustomColumn[] = []
hasReadPermissions: boolean = false;
hasWritePermissions: boolean = false;

constructor(private betsService: BetsService,
  private actionsService: ActionsService,
  private _authService: AuthService) {
  if (_authService.ifUserHasWritePermissions() || _authService.checkIfUserIsAdmin()) {
    this.hasWritePermissions = true;
  }
  if (_authService.ifUserHasReadPermissions() || _authService.checkIfUserIsAdmin()) {
    this.hasReadPermissions = true;
  }
}

ngOnInit() {
  this.betsService.searchResultsEvent.subscribe((betResponse: any) => {
    this.allBets = betResponse.bets;
    this.betResponse = betResponse;
    this.rowCount = betResponse.bets.length
    console.log("## "+this.allBets);
  })
  this.actionsService.customColumnEvent.subscribe((customColumn: any) => {
    this.customColumn = customColumn;
  })
  this.actionsService.selectAllEvent.subscribe((isSelectAllChecked: any) => {
    if (isSelectAllChecked) {
      this.allBets
        .forEach((bet) => this.setOfCheckedId.add(bet.identifier.key.betId));
    } else {
      this.allBets
        .forEach((bet) => this.setOfCheckedId.delete(bet.identifier.key.betId));
    }
  })
}

}*/