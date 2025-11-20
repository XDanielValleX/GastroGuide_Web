import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyCourse } from './buy-course';

describe('BuyCourse', () => {
  let component: BuyCourse;
  let fixture: ComponentFixture<BuyCourse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyCourse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyCourse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
