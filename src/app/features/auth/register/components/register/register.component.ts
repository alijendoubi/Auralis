import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      specialties: [''],
      bio: [''],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const { displayName, email, password, specialties, bio } = this.registerForm.value;
    const specialtiesArray = specialties ? specialties.split(',').map((s: string) => s.trim()) : [];

    this.authService.register(email, password, {
      displayName,
      role: 'therapist',
      isApproved: false,
      settings: {
        specialties: specialtiesArray,
        bio
      }
    })
    .then(() => {
      this.snackBar.open('Registration successful! Please wait for admin approval.', 'Close', {
        duration: 5000
      });
      this.router.navigate(['/auth/pending-approval']);
    })
    .catch(error => {
      this.snackBar.open(error.message, 'Close', {
        duration: 5000
      });
      this.loading = false;
    });
  }
}
