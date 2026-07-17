import { Injectable } from '@angular/core';
import {
  Camera,
  CameraPermissionState,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

export interface CoordenadasMarcacion {
  latitud: number;
  longitud: number;
  precision: number;
}

@Injectable({
  providedIn: 'root'
})
export class MarcacionesDispositivoService {
  validarInternet(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  private isPermissionGranted(permission: CameraPermissionState): boolean {
    return permission === 'granted' || permission === 'limited';
  }

  async capturarFotoObligatoria(): Promise<string> {
    // Mirar si es necesario habilitar cuando se compile la app
    const cameraPermission = await Camera.requestPermissions({ permissions: ['camera'] });

    if (!this.isPermissionGranted(cameraPermission.camera)) {
      throw new Error('Debe conceder permiso de cámara para registrar la marcación.');
    }

    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      saveToGallery: false,
      correctOrientation: true,
      allowEditing: false
    });

    if (!photo?.dataUrl) {
      throw new Error('No fue posible capturar la fotografía de validación.');
    }

    return photo.dataUrl;
  }

  async capturarUbicacionObligatoria(): Promise<CoordenadasMarcacion> {
    const permission = await Geolocation.requestPermissions();
    const isGranted = permission.location === 'granted' || permission.coarseLocation === 'granted';

    if (!isGranted) {
      throw new Error('Debe conceder permiso de ubicación para registrar la marcación.');
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });

    if (!position?.coords) {
      throw new Error('No fue posible obtener la ubicación GPS del dispositivo.');
    }

    return {
      latitud: position.coords.latitude,
      longitud: position.coords.longitude,
      precision: position.coords.accuracy || 0
    };
  }
}
