import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ArViewerComponent } from './ar-viewr/ar-viewr.component';
import { ThreeDModelComponent } from './components/three-d-model/three-d-model.component';

@Component({
  selector: 'ar-root',
  standalone: true,
  imports: [RouterOutlet,ArViewerComponent,ThreeDModelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ARviewer';
}
