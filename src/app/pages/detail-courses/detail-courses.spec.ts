import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCourses } from './detail-courses';

describe('DetailCourses', () => {
  let component: DetailCourses;
  let fixture: ComponentFixture<DetailCourses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailCourses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailCourses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
