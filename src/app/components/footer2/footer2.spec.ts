import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Footer2 } from './footer2';

describe('Footer2', () => {
  let component: Footer2;
  let fixture: ComponentFixture<Footer2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Footer2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
