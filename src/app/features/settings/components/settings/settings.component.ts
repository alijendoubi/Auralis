import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, UserProfile } from '../../../../core/auth/auth.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  user: UserProfile | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [true],
      theme: ['light'],
      language: ['en']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        
        // Get settings from user if available
        const settings = user.settings || {};
        
        this.settingsForm.patchValue({
          emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
          smsNotifications: settings.smsNotifications !== undefined ? settings.smsNotifications : true,
          theme: settings.theme || 'light',
          language: settings.language || 'en'
        });
      }
    });
  }

  onSubmit(): void {
    if (!this.user) {
      return;
    }

    this.loading = true;
    const formValues = this.settingsForm.value;

    // Update user settings
    this.authService.updateUserProfile(this.user.uid, {
      settings: {
        ...this.user.settings,
        emailNotifications: formValues.emailNotifications,
        smsNotifications: formValues.smsNotifications,
        theme: formValues.theme,
        language: formValues.language
      }
    })
    .then(() => {
      this.snackBar.open('Settings updated successfully', 'Close', {
        duration: 3000
      });
      this.loading = false;
    })
    .catch((error: Error) => {
      this.snackBar.open(error.message, 'Close', {
        duration: 5000
      });
      this.loading = false;
    });
  }
}
