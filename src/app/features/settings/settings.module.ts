import { NgModule } from '@angular/core';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './components/settings/settings.component';

@NgModule({
  imports: [
    SettingsRoutingModule,
    SettingsComponent
  ]
})
export class SettingsModule { }
