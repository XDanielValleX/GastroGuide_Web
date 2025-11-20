import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ReelItem {
  id: number;
  title: string;
  author: string;
  src: string;
  thumbnail?: string;
  duration?: number;
  createdAt?: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  liked: boolean;
  commentList?: { text: string; createdAt: string }[];
}

@Injectable({ providedIn: 'root' })
export class ReelsService {
  private key = 'gg_reels_v1';
  private _reels$ = new BehaviorSubject<ReelItem[]>(this.loadInitial());

  get reels$() { return this._reels$.asObservable(); }

  private loadInitial(): ReelItem[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) return JSON.parse(raw) as ReelItem[];
    } catch {}
    // fallback demo data (matches previous hardcoded demos)
    const now = new Date().toISOString();
    return [
      { id:1, title:'Demo Reel 1', author:'GastroGuide', src:'/video1.mp4', thumbnail:'https://placehold.co/720x1280/FF6028/FFFFFF?text=Video+1', duration:undefined, createdAt:now, likes:0, comments:0, saves:0, shares:0, liked:false },
      { id:2, title:'Demo Reel 2', author:'GastroGuide', src:'/video2.mp4', thumbnail:'https://placehold.co/720x1280/FB8C71/FFFFFF?text=Video+2', duration:undefined, createdAt:now, likes:0, comments:0, saves:0, shares:0, liked:false },
      { id:3, title:'Introducción a la Plataforma', author:'GastroGuide', src:'/video3.mp4', thumbnail:'https://placehold.co/720x1280/FF6028/FFFFFF?text=Intro', duration:undefined, createdAt:now, likes:0, comments:0, saves:0, shares:0, liked:false },
      { id:4, title:'Tips de Estudio Rápidos', author:'ChefPro', src:'/video4.mp4', thumbnail:'https://placehold.co/720x1280/FB8C71/FFFFFF?text=Tips', duration:undefined, createdAt:now, likes:0, comments:0, saves:0, shares:0, liked:false },
      { id:5, title:'Cuchillos y Seguridad', author:'ProCocina', src:'/video5.mp4', thumbnail:'https://placehold.co/720x1280/EDEEE6/333?text=Cuchillos', duration:undefined, createdAt:now, likes:0, comments:0, saves:0, shares:0, liked:false }
    ];
  }

  private persist(list: ReelItem[]) {
    try { localStorage.setItem(this.key, JSON.stringify(list)); } catch {}
  }

  addReel(payload: Partial<ReelItem>) {
    const list = this._reels$.getValue().slice();
    const nextId = list.length ? Math.max(...list.map(r=>r.id)) + 1 : 1;
    const item: ReelItem = {
      id: nextId,
      title: payload.title || 'Nuevo Reel',
      author: payload.author || 'Autor',
      src: payload.src || '',
      thumbnail: payload.thumbnail,
      duration: payload.duration,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      liked: false,
      commentList: []
    };
    list.unshift(item);
    this._reels$.next(list);
    this.persist(list);
    return item;
  }

  updateFromStorage() {
    this._reels$.next(this.loadInitial());
  }
}
