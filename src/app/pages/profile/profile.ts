import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profilecomponent {
    fotoPerfil: string = 'assets/images/orion.png'; // Imagen inicial

  // Método para abrir el input oculto
  abrirSelector() {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    input.click();
  }

  // Método para actualizar la imagen al seleccionar archivo
  cambiarImagen(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoPerfil = e.target.result; // se actualiza en tiempo real
      };
      reader.readAsDataURL(file);
    }
  }

}
