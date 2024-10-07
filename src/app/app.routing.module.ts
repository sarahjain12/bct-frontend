import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { BctComponent } from './bct/bct.component';
import { LoginComponent } from './login/login.component';
import { SigninRedirectCallbackComponent} from './signin-redirect-callback/signin-redirect-callback.component'
import { SignoutRedirectCallbackComponent} from './signout-redirect-callback/signout-redirect-callback.component'
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { AuthGuardService } from './shared/guards/auth-guard.service';
import {HealthComponent} from './health/health.component';

export const routes: Routes = [
            {path:'bct',component:BctComponent /* , canActivate: [AuthGuardService] */},
            {path:'home', component: SearchComponent /* , canActivate: [AuthGuardService] */},
            {path:'signin-oidc', component: SigninRedirectCallbackComponent},
            {path:'signout-oidc', component: SignoutRedirectCallbackComponent },
            {path:'login', component: LoginComponent},
            {path: 'unauthorized', component: UnauthorizedComponent },
            {path: 'diagnostics/health', component: HealthComponent },
            {path:'', redirectTo: 'bct', pathMatch: 'full'},
            {path:'**', redirectTo: ''}
         ];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
