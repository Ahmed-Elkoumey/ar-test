import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'ar-ar-viewer',
  standalone: true,
  imports: [],
  templateUrl: './ar-viewr.component.html',
  styleUrl: './ar-viewr.component.scss'
})
export class ArViewerComponent implements AfterViewInit, OnChanges {
  @ViewChild('webcam') webcamRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('rendererCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() modelUrl: string = '';

  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private controls!: OrbitControls;
  private loader = new GLTFLoader();
  private model?: THREE.Group;

  async ngAfterViewInit(): Promise<void> {
    await this.initWebcam();
    this.initThreeJS();
    if (this.modelUrl) this.loadModel(this.modelUrl);
    this.animate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modelUrl'] && !changes['modelUrl'].firstChange) {
      this.loadModel(this.modelUrl);
    }
  }

  private async initWebcam(): Promise<void> {
    const constraints = {
      video: { facingMode: 'environment' },
      audio: false
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.webcamRef.nativeElement.srcObject = stream;
    } catch (err) {
      console.error('Failed to access webcam', err);
    }
  }

 private initThreeJS(): void {
  const canvas = this.canvasRef.nativeElement;

  this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  this.renderer.setSize(window.innerWidth, window.innerHeight);

  this.scene = new THREE.Scene();

  this.camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  this.camera.position.z = 3;  // زودت المسافة عن الموديل شوية

  // إضافة إضاءة محيطية خفيفة
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  this.scene.add(ambientLight);

  // إضاءة اتجاهية مع تقليل الشدة
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 1, 1).normalize();
  this.scene.add(directionalLight);

  this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  this.controls.enableDamping = true;
  this.controls.dampingFactor = 0.05;
}

private loadModel(url: string): void {
  if (this.model) {
    this.scene.remove(this.model);
  }
  this.loader.load(
    url,
    gltf => {
      this.model = gltf.scene;

      // تعيين حجم الموديل (مثلاً نص الحجم الحالي)
      this.model.scale.set(0.5, 0.5, 0.5);

      // مركز الموديل
      this.model.position.set(0, 0, 0);

      this.scene.add(this.model);
    },
    undefined,
    error => {
      console.error('Error loading model:', error);
    }
  );
}


  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  } 
}