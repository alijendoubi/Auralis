import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { AuthService, UserProfile } from '../../../../core/auth/auth.service';
import { Observable } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [SharedModule, MatChipsModule]
})
export class DashboardComponent implements OnInit {
  currentUser$: Observable<UserProfile | null>;
  today: Date = new Date();
  
  // Mock data for dashboard
  upcomingAppointments = [
    { id: '1', clientName: 'John Doe', date: new Date(this.today.getTime() + 3600000), status: 'confirmed' },
    { id: '2', clientName: 'Jane Smith', date: new Date(this.today.getTime() + 7200000), status: 'confirmed' },
    { id: '3', clientName: 'Bob Johnson', date: new Date(this.today.getTime() + 10800000), status: 'pending' }
  ];
  
  recentClients = [
    { id: '1', name: 'John Doe', lastAppointment: new Date(this.today.getTime() - 86400000), status: 'active' },
    { id: '2', name: 'Jane Smith', lastAppointment: new Date(this.today.getTime() - 172800000), status: 'active' },
    { id: '3', name: 'Bob Johnson', lastAppointment: new Date(this.today.getTime() - 259200000), status: 'inactive' }
  ];
  
  remindersSent = 12;
  activeClients = 24;
  totalAppointments = 156;
  
  // Chart data
  revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [4500, 5200, 4800, 5800, 6000, 6200],
        backgroundColor: 'rgba(63, 81, 181, 0.5)',
        borderColor: 'rgba(63, 81, 181, 1)',
        borderWidth: 1
      }
    ]
  };
  
  missedSessionsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Missed Sessions',
        data: [3, 2, 4, 1, 2, 1],
        backgroundColor: 'rgba(244, 67, 54, 0.5)',
        borderColor: 'rgba(244, 67, 54, 1)',
        borderWidth: 1
      }
    ]
  };
  
  satisfactionData = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    datasets: [
      {
        label: 'Client Satisfaction',
        data: [42, 23, 8, 2, 1],
        backgroundColor: [
          'rgba(76, 175, 80, 0.5)',
          'rgba(156, 204, 101, 0.5)',
          'rgba(255, 193, 7, 0.5)',
          'rgba(255, 152, 0, 0.5)',
          'rgba(244, 67, 54, 0.5)'
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(156, 204, 101, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(244, 67, 54, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
  }
}
