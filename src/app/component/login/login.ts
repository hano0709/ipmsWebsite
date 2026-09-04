import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';

  constructor(private userService: UserService) {}

  togglePassword(){
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    passwordInput.type = this.showPassword? 'text' : 'password';
  }

  onLogin() {
    this.userService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login Success:', response);
      },
      error: (err) => {
        this.errorMessage = err;
        console.error('Login Failed: ', err);
      }
    });
  }
}
