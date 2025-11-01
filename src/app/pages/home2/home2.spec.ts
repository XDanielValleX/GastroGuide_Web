import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Home2 } from './home2';

describe('Home2', () => {
  let component: Home2;
  let fixture: ComponentFixture<Home2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
