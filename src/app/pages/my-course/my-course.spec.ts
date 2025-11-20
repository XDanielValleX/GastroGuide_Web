import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCourse } from './my-course';

describe('MyCourse', () => {
  let component: MyCourse;
  let fixture: ComponentFixture<MyCourse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCourse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCourse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
