import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface ReelMetricBucket {
  id: number;
  views: number;
  likes: number;
  comments: number;
}

interface ReelTotals {
  views: number;
  likes: number;
  comments: number;
}

@Injectable({ providedIn: 'root' })
export class ReelStatsService {
  private readonly STORAGE_KEY = 'reel_stats_v1';

  private totals: ReelTotals = { views: 0, likes: 0, comments: 0 };
  private perReel: Record<number, ReelMetricBucket> = {};

  private totalsSubject = new BehaviorSubject<ReelTotals>(this.totals);
  private perReelSubject = new BehaviorSubject<ReelMetricBucket[]>([]);

  totals$ = this.totalsSubject.asObservable();
  perReel$ = this.perReelSubject.asObservable();

  constructor() {
    this.load();
  }

  registerView(id: number) { this.bump(id, 'views'); }
  registerLike(id: number) { this.bump(id, 'likes'); }
  registerComment(id: number) { this.bump(id, 'comments'); }

  private bump(id: number, field: keyof ReelTotals) {
    if (!this.perReel[id]) {
      this.perReel[id] = { id, views: 0, likes: 0, comments: 0 };
    }
    this.perReel[id][field]++;
    this.totals[field]++;
    this.emit();
    this.persist();
  }

  private emit() {
    this.totalsSubject.next({ ...this.totals });
    const arr = Object.values(this.perReel).sort((a, b) => b.views - a.views);
    this.perReelSubject.next(arr);
  }

  getTop(n: number): ReelMetricBucket[] {
    return Object.values(this.perReel)
      .sort((a, b) => b.views + b.likes + b.comments - (a.views + a.likes + a.comments))
      .slice(0, n);
  }

  private persist() {
    try {
      const payload = { totals: this.totals, perReel: this.perReel };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }

  private load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.totals) this.totals = data.totals;
      if (data.perReel) this.perReel = data.perReel;
      this.emit();
    } catch {}
  }
}
