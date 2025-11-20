import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReelStatsService } from '../../shared/reel-stats.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class Statistics implements OnDestroy {
  totals = { views: 0, likes: 0, comments: 0 };
  top: { id:number; views:number; likes:number; comments:number }[] = [];
  private sub?: Subscription;
  private sub2?: Subscription;

  constructor(private stats: ReelStatsService) {
    this.sub = this.stats.totals$.subscribe(t => this.totals = t);
    this.sub2 = this.stats.perReel$.subscribe(list => {
      this.top = list.slice(0,5);
    });
  }

  // Escala anchura para barras grandes (cards)
  calcWidth(value: number): string {
    const max = Math.max(this.totals.views, this.totals.likes, this.totals.comments, 1);
    const pct = (value / max) * 100;
    return Math.max(pct, 6) + '%';
  }

  // Escala anchura para barras pequeñas (fila top reels)
  miniWidth(value: number): string {
    const max = Math.max(...this.top.map(r => r.views + r.likes + r.comments), 1);
    const pct = (value / max) * 100;
    return Math.max(pct, 5) + '%';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.sub2?.unsubscribe();
  }
}
