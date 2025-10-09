import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZutatenModalComponent } from './zutaten-modal.component';

describe('ZutatenModalComponent', () => {
  let component: ZutatenModalComponent;
  let fixture: ComponentFixture<ZutatenModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZutatenModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZutatenModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
