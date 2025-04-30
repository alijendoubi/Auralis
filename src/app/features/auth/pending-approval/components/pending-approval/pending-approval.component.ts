import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  selector: 'app-pending-approval',
  templateUrl: './pending-approval.component.html',
  styleUrls: ['./pending-approval.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class PendingApprovalComponent implements OnInit {
  email: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.email = user.email;
      }
    });
  }

  logout(): void {
    this.authService.signOut().then(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
