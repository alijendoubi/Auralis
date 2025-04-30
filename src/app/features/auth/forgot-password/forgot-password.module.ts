import { NgModule } from '@angular/core';
import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

@NgModule({
  imports: [
    ForgotPasswordRoutingModule,
    ForgotPasswordComponent
  ]
})
export class ForgotPasswordModule { }
