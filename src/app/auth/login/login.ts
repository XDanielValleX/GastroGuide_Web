import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,                   // standalone, sin módulos
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  // Aquí luego puedes inyectar AuthService o Router para hacer el login real.
  // Por ejemplo:
  // constructor(private auth: AuthService, private router: Router) {}
  //
  // onSubmit(data: { email: string; password: string }) {
  //   this.auth.login(data).subscribe(() => this.router.navigate(['/home']));
  // }
}
