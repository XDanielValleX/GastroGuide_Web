import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerMisCursos } from './ver-mis-cursos';

describe('VerMisCursos', () => {
  let component: VerMisCursos;
  let fixture: ComponentFixture<VerMisCursos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerMisCursos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerMisCursos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
