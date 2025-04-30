import { NgModule } from '@angular/core';
import { PendingApprovalRoutingModule } from './pending-approval-routing.module';
import { PendingApprovalComponent } from './components/pending-approval/pending-approval.component';

@NgModule({
  imports: [
    PendingApprovalRoutingModule,
    PendingApprovalComponent
  ]
})
export class PendingApprovalModule { }
