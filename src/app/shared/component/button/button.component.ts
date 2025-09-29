import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() text: string = 'Jetzt anrufen';
  @Input() backgroundColor: string = 'rgb(180, 0, 0)';
  @Input() textColor: string = 'white';
  @Input() border: string = '1px solid black';
  @Input() shadowColor: string = 'white';


  @Output() clicked = new EventEmitter<void>();

  onClick() {
    this.clicked.emit();
  }
}
