import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Payment } from './payment';

describe('Payment', () => {
  let component: Payment;
  let fixture: ComponentFixture<Payment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Payment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Payment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
