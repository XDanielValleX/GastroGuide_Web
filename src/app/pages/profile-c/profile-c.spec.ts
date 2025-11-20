import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileC } from './profile-c';

describe('ProfileC', () => {
  let component: ProfileC;
  let fixture: ComponentFixture<ProfileC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
