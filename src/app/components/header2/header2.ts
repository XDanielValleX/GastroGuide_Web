import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header2',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header2.html',
  styleUrls: ['./header2.css']
})
export class Header2 {
  @Input() user: { name?: string; username?: string; email?: string; image?: string } | null = null;
  @Input() showCreate = false;
  @Input() profileRoute: string | any[] = '/profile';
  @Output() search = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();

  query = '';
  readonly defaultAvatar = 'assets/profile.svg';

  onSearch() {
    this.search.emit(this.query);
  }

  onLogoutClick() {
    this.logout.emit();
  }

  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = this.defaultAvatar;
    }
  }
}
