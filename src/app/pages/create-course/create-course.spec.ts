import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCourse } from './create-course';

describe('CreateCourse', () => {
  let component: CreateCourse;
  let fixture: ComponentFixture<CreateCourse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCourse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCourse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
