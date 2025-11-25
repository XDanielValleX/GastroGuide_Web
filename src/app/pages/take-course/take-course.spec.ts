import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeCourse } from './take-course';

describe('TakeCourse', () => {
  let component: TakeCourse;
  let fixture: ComponentFixture<TakeCourse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TakeCourse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TakeCourse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
