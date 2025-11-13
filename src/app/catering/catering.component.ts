import { Component, ElementRef, ViewChild } from '@angular/core';
import { ButtonComponent } from '../shared/component/button/button.component';

@Component({
  selector: 'app-catering',
  imports: [ButtonComponent],
  templateUrl: './catering.component.html',
  styleUrl: './catering.component.scss'
})
export class CateringComponent {
@ViewChild('backgroundVideo') video!: ElementRef<HTMLVideoElement>;

    ngAfterViewInit(): void {
    const vid = this.video.nativeElement;
    
    vid.muted = true; // sicherstellen, dass gemutet ist
    vid.play().catch(() => {
      console.log('Autoplay blockiert, warte auf Klick');
      const startVideo = () => {
        vid.play();
        document.removeEventListener('click', startVideo);
      };
      document.addEventListener('click', startVideo);
    });
  }
}
