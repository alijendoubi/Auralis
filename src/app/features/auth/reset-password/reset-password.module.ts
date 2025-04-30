import { NgModule } from '@angular/core';
import { ResetPasswordRoutingModule } from './reset-password-routing.module';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

@NgModule({
  imports: [
    ResetPasswordRoutingModule,
    ResetPasswordComponent
  ]
})
export class ResetPasswordModule { }
