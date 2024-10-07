import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchBetsComponent } from './batch-bets.component';

describe('BatchBetsComponent', () => {
  let component: BatchBetsComponent;
  let fixture: ComponentFixture<BatchBetsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BatchBetsComponent]
    });
    fixture = TestBed.createComponent(BatchBetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
