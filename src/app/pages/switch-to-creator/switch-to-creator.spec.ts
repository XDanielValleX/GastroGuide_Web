import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchToCreator } from './switch-to-creator';

describe('SwitchToCreator', () => {
  let component: SwitchToCreator;
  let fixture: ComponentFixture<SwitchToCreator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwitchToCreator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwitchToCreator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
