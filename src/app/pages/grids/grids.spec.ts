import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Grids } from './grids';

describe('Grids', () => {
  let component: Grids;
  let fixture: ComponentFixture<Grids>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Grids]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Grids);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
