import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentQueries } from './payment-queries';

describe('PaymentQueries', () => {
  let component: PaymentQueries;
  let fixture: ComponentFixture<PaymentQueries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentQueries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentQueries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
