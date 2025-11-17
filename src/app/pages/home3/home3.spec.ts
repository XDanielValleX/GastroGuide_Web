import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Home3 } from './home3';

describe('Home3', () => {
  let component: Home3;
  let fixture: ComponentFixture<Home3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home3]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home3);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
