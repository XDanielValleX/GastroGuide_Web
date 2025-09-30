import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordFG } from './password-fg';

describe('PasswordFG', () => {
  let component: PasswordFG;
  let fixture: ComponentFixture<PasswordFG>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordFG]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordFG);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
