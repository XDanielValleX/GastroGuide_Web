import { CommonModule } from '@angular/common';
import { Component, isStandalone } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {

}
