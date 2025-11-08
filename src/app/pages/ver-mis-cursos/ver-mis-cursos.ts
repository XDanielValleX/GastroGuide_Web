import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ver-mis-cursos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-mis-cursos.html',
  styleUrl: './ver-mis-cursos.css'
})
export class VerMisCursosComponent implements OnDestroy {
  cursos: any[] = [];
  sub = new Subscription();

  constructor(private cs: CourseService) {
    this.sub.add(this.cs.purchases$.subscribe(v => this.cursos = v));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
