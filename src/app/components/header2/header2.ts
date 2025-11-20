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
  @Input() user: { name: string; image: string } | null = null;
  @Output() search = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();

  query = '';

  onSearch() {
    this.search.emit(this.query);
  }

  onLogoutClick() {
    this.logout.emit();
  }
}
