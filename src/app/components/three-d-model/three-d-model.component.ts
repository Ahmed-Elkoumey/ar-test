import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';

@Component({
  selector: 'ar-three-d-model',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './three-d-model.component.html',
  styleUrl: './three-d-model.component.scss'
})
export class ThreeDModelComponent {
 @Input() modelSrc!: string;
}
