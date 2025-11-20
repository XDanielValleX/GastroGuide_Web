import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedCourse } from './selected-course';

describe('SelectedCourse', () => {
  let component: SelectedCourse;
  let fixture: ComponentFixture<SelectedCourse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedCourse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedCourse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
