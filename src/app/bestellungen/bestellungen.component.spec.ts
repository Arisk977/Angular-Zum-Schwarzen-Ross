import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestellungenComponent } from './bestellungen.component';

describe('BestellungenComponent', () => {
  let component: BestellungenComponent;
  let fixture: ComponentFixture<BestellungenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BestellungenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BestellungenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
