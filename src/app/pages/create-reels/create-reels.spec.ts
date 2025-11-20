import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReels } from './create-reels';

describe('CreateReels', () => {
  let component: CreateReels;
  let fixture: ComponentFixture<CreateReels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateReels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateReels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
