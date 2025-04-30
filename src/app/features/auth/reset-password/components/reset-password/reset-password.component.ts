import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading = false;
  resetComplete = false;
  actionCode: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.actionCode = params['oobCode'];
      
      if (!this.actionCode) {
        this.snackBar.open('Invalid password reset link. Please try again.', 'Close', {
          duration: 5000
        });
        this.router.navigate(['/auth/forgot-password']);
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.actionCode) {
      return;
    }

    this.loading = true;
    const { password } = this.resetPasswordForm.value;

    this.authService.confirmPasswordReset(this.actionCode, password)
      .then(() => {
        this.resetComplete = true;
        this.loading = false;
      })
      .catch((error: Error) => {
        this.snackBar.open(error.message, 'Close', {
          duration: 5000
        });
        this.loading = false;
      });
  }

  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
