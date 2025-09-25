import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../shared/component/header/header.component';

@Component({
  selector: 'app-landing-page',
  imports: [HeaderComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements AfterViewInit {
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
