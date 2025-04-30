import { NgModule } from '@angular/core';
import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './components/register/register.component';

@NgModule({
  imports: [
    RegisterRoutingModule,
    RegisterComponent
  ]
})
export class RegisterModule { }
