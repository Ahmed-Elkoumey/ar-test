import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ArViewerComponent } from './ar-viewr/ar-viewr.component';

@Component({
  selector: 'ar-root',
  standalone: true,
  imports: [RouterOutlet,ArViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ARviewer';
}
