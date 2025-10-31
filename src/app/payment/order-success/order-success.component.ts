import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from 'app/shared/component/header/header.component';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit {
  orderNumber: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    this.orderNumber = nav?.extras.state?.['orderId'] || null;
  }

  goToMyOrders() {
  this.router.navigate(['/bestellungen']);
}

}
