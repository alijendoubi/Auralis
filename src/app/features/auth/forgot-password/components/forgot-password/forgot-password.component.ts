import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  loading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    const { email } = this.forgotPasswordForm.value;

    this.authService.sendPasswordResetEmail(email)
      .then(() => {
        this.emailSent = true;
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
