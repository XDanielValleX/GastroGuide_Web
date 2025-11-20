import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CreatorProfileData {
  name: string;
  username: string;
  bio: string;
  categories: string[];
  avatarUrl: string | null;
  followers: number;
  courses: number;
  earnings: number; // mensual estimado
}

@Component({
  selector: 'app-profile-c',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-c.html',
  styleUrl: './profile-c.css'
})
export class ProfileC {
  data: CreatorProfileData = {
    name: 'Nombre del Creador',
    username: 'usuario.creador',
    bio: 'Breve biografía del creador. Comparte tu experiencia, especialidad y lo que ofreces a tu audiencia.',
    categories: ['Cocina saludable', 'Postres', 'Marketing gastronómico'],
    avatarUrl: null,
    followers: 1280,
    courses: 6,
    earnings: 2450
  };

  editingAvatar = false;
  editingInfo = false;

  tempName = this.data.name;
  tempUsername = this.data.username;
  tempBio = this.data.bio;
  tempCategories = [...this.data.categories];
  newCategory = '';

  toggleAvatarEdit() {
    this.editingAvatar = !this.editingAvatar;
  }

  toggleInfoEdit() {
    if (!this.editingInfo) {
      this.tempName = this.data.name;
      this.tempUsername = this.data.username;
      this.tempBio = this.data.bio;
      this.tempCategories = [...this.data.categories];
    }
    this.editingInfo = !this.editingInfo;
  }

  addCategory() {
    const c = this.newCategory.trim();
    if (c && !this.tempCategories.includes(c)) {
      this.tempCategories.push(c);
    }
    this.newCategory = '';
  }

  removeCategory(cat: string) {
    this.tempCategories = this.tempCategories.filter(c => c !== cat);
  }

  saveInfo() {
    this.data.name = this.tempName.trim() || this.data.name;
    this.data.username = this.tempUsername.trim() || this.data.username;
    this.data.bio = this.tempBio.trim();
    this.data.categories = [...this.tempCategories];
    this.editingInfo = false;
  }

  cancelInfo() {
    this.editingInfo = false;
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.data.avatarUrl = reader.result as string;
        this.editingAvatar = false;
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar() {
    this.data.avatarUrl = null;
    this.editingAvatar = false;
  }
}
