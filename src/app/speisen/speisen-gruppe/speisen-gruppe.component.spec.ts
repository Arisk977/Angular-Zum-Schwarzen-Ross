import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeisenGruppeComponent } from './speisen-gruppe.component';

describe('SpeisenGruppeComponent', () => {
  let component: SpeisenGruppeComponent;
  let fixture: ComponentFixture<SpeisenGruppeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeisenGruppeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeisenGruppeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
