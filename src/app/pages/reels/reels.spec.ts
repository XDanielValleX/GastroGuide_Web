import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reels } from './reels';

describe('Reels', () => {
  let component: Reels;
  let fixture: ComponentFixture<Reels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
