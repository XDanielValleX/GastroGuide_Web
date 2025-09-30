import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordCHG } from './password-chg';

describe('PasswordCHG', () => {
  let component: PasswordCHG;
  let fixture: ComponentFixture<PasswordCHG>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordCHG]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordCHG);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
