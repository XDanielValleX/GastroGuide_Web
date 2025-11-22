
import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-grids',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './grids.html',
  styleUrl: './grids.css'
})
export class Grids {}
