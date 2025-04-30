import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, UserProfile } from '../../../../core/auth/auth.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  user: UserProfile | null = null;
  specialties: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required]],
      email: [{ value: '', disabled: true }],
      specialties: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        
        // Get specialties and bio from user settings if available
        const settings = user.settings || {};
        this.specialties = settings.specialties || [];
        const bio = settings.bio || '';
        
        this.profileForm.patchValue({
          displayName: user.displayName || '',
          email: user.email || '',
          specialties: this.specialties.join(', '),
          bio: bio
        });
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.user) {
      return;
    }

    this.loading = true;
    const { displayName, specialties, bio } = this.profileForm.value;
    const specialtiesArray = specialties ? specialties.split(',').map((s: string) => s.trim()) : [];

    // Update user profile with settings
    this.authService.updateUserProfile(this.user.uid, {
      displayName,
      settings: {
        ...this.user.settings,
        specialties: specialtiesArray,
        bio
      }
    })
    .then(() => {
      this.snackBar.open('Profile updated successfully', 'Close', {
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
