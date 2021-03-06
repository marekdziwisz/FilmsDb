import { LoginData } from 'src/app/shared/login/models/login.models';

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loginForm = new FormGroup({
    login: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  @Output() formData: EventEmitter<LoginData> = new EventEmitter();
  @Input() error: string;
  @Input() isLoading = false;

  isFieldValid(field: string) {
    return (
      !this.loginForm.get(field).valid && this.loginForm.get(field).touched
    );
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.formData.emit(this.loginForm.value);
    } else {
      Object.keys(this.loginForm.controls).forEach(field => {
        this.loginForm.get(field).markAsTouched({ onlySelf: true });
      });
    }
  }
}
