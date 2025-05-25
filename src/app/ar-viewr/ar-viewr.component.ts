// File: src/app/ar-viewer/ar-viewer.component.ts

import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'ar-ar-viewr',
  standalone: true,
  imports: [],
  templateUrl: './ar-viewr.component.html',
  styleUrl: './ar-viewr.component.scss'
})
export class ArViewerComponent implements OnChanges, OnInit, OnDestroy {
  @Input() modelUrl!: string;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Object3D;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private isDragging = false;
  private isRotating = false;
  private dragOffset = new THREE.Vector3();
  private dragPlane = new THREE.Plane();
  private prevX = 0;
  private prevY = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modelUrl'] && !changes['modelUrl'].firstChange) {
      this.loadModel(this.modelUrl);
    }
  }

  ngOnInit(): void {
    this.initThree();
    this.loadModel(this.modelUrl);
    this.animate();
  }

  private initThree(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 2;

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const container = document.getElementById('ar-container');
    container?.appendChild(this.renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    this.scene.add(light);

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        video.style.position = 'absolute';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.zIndex = '-1';
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        document.getElementById('ar-container')?.prepend(video);
      })
      .catch(err => console.error('Camera error:', err));
  }

  private initInteraction(): void {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('wheel', this.onMouseWheel);
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (!this.model) return;
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.model, true);
    if (intersects.length > 0) {
      this.isDragging = true;
      this.dragPlane.setFromNormalAndCoplanarPoint(
        this.camera.getWorldDirection(new THREE.Vector3()),
        intersects[0].point
      );
      this.dragOffset.copy(intersects[0].point).sub(this.model.position);
    } else {
      this.isRotating = true;
      this.prevX = event.clientX;
      this.prevY = event.clientY;
    }
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (this.isDragging && this.model) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersect = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.dragPlane, intersect);
      this.model.position.copy(intersect.sub(this.dragOffset));
    } else if (this.isRotating && this.model) {
      const deltaX = event.clientX - this.prevX;
      const deltaY = event.clientY - this.prevY;
      this.model.rotation.y += deltaX * 0.005;
      this.model.rotation.x += deltaY * 0.005;
      this.prevX = event.clientX;
      this.prevY = event.clientY;
    }
  };

  private onPointerUp = (): void => {
    this.isDragging = false;
    this.isRotating = false;
  };

  private onMouseWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const zoomAmount = event.deltaY * 0.01;
    this.camera.position.z += zoomAmount;
    this.camera.position.z = THREE.MathUtils.clamp(this.camera.position.z, 0.5, 10);
  };

  private loadModel(url: string): void {
    const loader = new GLTFLoader();
    loader.load(url, gltf => {
      this.model = gltf.scene;
      this.scene.add(this.model);
      this.initInteraction();
    }, undefined, error => {
      console.error('Model load error:', error);
    });
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  ngOnDestroy(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
