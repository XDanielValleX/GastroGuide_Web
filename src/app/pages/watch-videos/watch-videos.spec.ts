import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchVideos } from './watch-videos';

describe('WatchVideos', () => {
  let component: WatchVideos;
  let fixture: ComponentFixture<WatchVideos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchVideos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatchVideos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
