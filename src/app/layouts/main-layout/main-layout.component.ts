import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { AuthService, UserProfile } from '../../core/auth/auth.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  currentUser$: Observable<UserProfile | null>;
  isAdmin$: Observable<boolean>;
  today: Date = new Date();

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
    this.isAdmin$ = this.authService.isAdmin();
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.signOut();
  }
}
