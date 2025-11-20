import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header2 } from './header2';

describe('Header2', () => {
  let component: Header2;
  let fixture: ComponentFixture<Header2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Header2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
