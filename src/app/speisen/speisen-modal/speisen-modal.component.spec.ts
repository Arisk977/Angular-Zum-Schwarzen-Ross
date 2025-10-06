import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeisenModalComponent } from './speisen-modal.component';

describe('SpeisenModalComponent', () => {
  let component: SpeisenModalComponent;
  let fixture: ComponentFixture<SpeisenModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeisenModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeisenModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
