import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-screenshot-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './screenshot-slider.component.html',
  styleUrls: ['./screenshot-slider.component.scss']
})
export class ScreenshotSliderComponent {
  @Input() screenshots: { image: string }[] = [];

  currentIndex = 0;

  next(): void {
    if (!this.screenshots.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.screenshots.length;
  }

  prev(): void {
    if (!this.screenshots.length) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.screenshots.length) % this.screenshots.length;
  }

  get currentImage(): string | undefined {
    return this.screenshots[this.currentIndex]?.image;
  }
}
