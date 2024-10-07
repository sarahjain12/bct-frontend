import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SearchComponent } from './search/search.component';
import { SigninRedirectCallbackComponent } from './signin-redirect-callback/signin-redirect-callback.component';
import { SignoutRedirectCallbackComponent } from './signout-redirect-callback/signout-redirect-callback.component';
import { AdvancedSearchComponent } from './search/advanced-search/advanced-search.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StepBackwardOutline, CaretLeftOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { IconDefinition } from '@ant-design/icons-angular';
import en from '@angular/common/locales/en';
registerLocaleData(en);
import { SearchResultComponent } from './search-result/search-result.component';
import { SearchPanelService } from './services/search.service';
import { GridBetsComponent } from './grid-bets/grid-bets.component';
import { BctComponent } from './bct/bct.component';
import { LoginComponent } from './login/login.component';
import { SignoutComponent } from './signout/signout.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './shared/services/auth-interceptor.service';
import { ActionsComponent } from './actions/actions.component';
import { ActionsService } from './services/actions.service';
import { BatchPanelService } from './services/batch-panel.service';
import { ReportDialogComponent } from './dialog/report-dialog/report-dialog.component';
import { StornoDataSharedService } from './services/storno-data-shared.service';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { ProgressDialogComponent } from './dialog/progress-dialog/progress-dialog.component';
import { BatchBetsComponent } from './batch-bets/batch-bets.component';
import { BwilinkedmarketsService } from './services/bwilinkedmarkets.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup
import { MomentModule } from 'ngx-moment'; // optional, provides moment-style pipes for date formatting
import {AppConfigService} from './app.config.service';
import {HealthComponent} from './health/health.component';
const icons: IconDefinition[] = [
  StepBackwardOutline,
  CaretLeftOutline,
  SettingOutline
];

export function appConfigInit(appConfigService: AppConfigService) {
  return () => {
    return appConfigService.load()
  };
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    AppRoutingModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzRadioModule,
    NzIconModule,
    NzCollapseModule,
    NzButtonModule,
    NzPageHeaderModule,
    NzDatePickerModule,
    NzCheckboxModule,
    NzModalModule,
    NzDividerModule,
    NzLayoutModule,
    NzTagModule,
    NzCardModule,
    NzLayoutModule,
    DragDropModule,
    NzGridModule,
    NzMessageModule,
    NzIconModule.forChild(icons),
    NzDropDownModule,
    NzAvatarModule,
    NzProgressModule,
    NgMultiSelectDropDownModule.forRoot(),
    NzSpinModule,
    NgIdleKeepaliveModule.forRoot(),
    MomentModule.forRoot({
          relativeTimeThresholdOptions: {
            'm': 59
          }
        })
  ],
  providers: [
  { provide: NZ_I18N, useValue: en_US },
  SearchPanelService,
  ActionsService,
  BatchPanelService,
  StornoDataSharedService,
  BwilinkedmarketsService,
  /* { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true } ,*/
 {
        provide: APP_INITIALIZER,
        useFactory: appConfigInit,
        multi: true,
        deps: [AppConfigService]
      }
],
  declarations: [AppComponent,
    SearchComponent,
    GridBetsComponent,
    AdvancedSearchComponent,
    SigninRedirectCallbackComponent,
    SignoutRedirectCallbackComponent,
    SearchResultComponent,
    LoginComponent,
    BctComponent,
    SignoutComponent,
    ActionsComponent,
    ReportDialogComponent,
    ProgressDialogComponent,
    BatchBetsComponent,
    HealthComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
