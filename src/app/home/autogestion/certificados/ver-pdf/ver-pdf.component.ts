import { Component, inject, OnInit, OnDestroy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ver-pdf',
  templateUrl: './ver-pdf.component.html',
  styleUrls: ['./ver-pdf.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    PdfViewerModule,
    FontAwesomeModule
  ]
})
export class VerPdfComponent implements OnInit, OnDestroy {

	@Input() url: string | Blob = '';
	valorZoom: number = 1;
	safeUrl: SafeResourceUrl | string = '';
	isBase64: boolean = false;
	totalPages: number = 0;
	currentPage: number = 1;
	private objectUrl: string | null = null;

	constructor(private modalController: ModalController, private sanitizer: DomSanitizer) { }

	ngOnInit() {
		this.processUrl();
	}

	ngOnDestroy() {
		if (this.objectUrl) {
			URL.revokeObjectURL(this.objectUrl);
		}
	}

	processUrl() {
		if (!this.url) {
			console.error('No se recibió URL');
			return;
		}

		try {
			if (this.url instanceof Blob) {
				this.isBase64 = true;
				this.objectUrl = URL.createObjectURL(this.url);
				this.safeUrl = this.objectUrl;
				return;
			}

			// Verificar si es una URL HTTP/HTTPS
			if (typeof this.url === 'string' && (this.url.startsWith('http://') || this.url.startsWith('https://'))) {
				this.isBase64 = false;
				this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
			} 
			// Aceptar Blob URLs creadas para PDFs locales
			else if (typeof this.url === 'string' && this.url.startsWith('blob:')) {
				this.isBase64 = true;
				this.safeUrl = this.url;
			}
			// Verificar si ya es un data URI base64
			else if (typeof this.url === 'string' && this.url.startsWith('data:application/pdf;base64,')) {
				this.isBase64 = true;
				// Convertir a Blob para evitar problemas con datos muy largos
				this.safeUrl = this.base64ToBlob(this.url);
			}
			// Si es solo el string base64 sin el prefijo
			else if (typeof this.url === 'string') {
				this.isBase64 = true;
				const dataUrl = `data:application/pdf;base64,${this.url}`;
				this.safeUrl = this.base64ToBlob(dataUrl);
			}
			else {
				console.error('URL inválida o formato no soportado:', this.url);
			}
		} catch (error) {
			console.error('Error al procesar URL:', error);
		}
	}

	/**
	 * Convierte un data URI base64 a Blob URL para mejor manejo
	 */
	private base64ToBlob(dataUrl: string): string {
		try {
			// Extraer la parte base64 del data URL
			const parts = dataUrl.split(',');
			if (parts.length < 2) {
				throw new Error('Data URL inválida');
			}

			const base64Str = parts[1];
			const byteCharacters = atob(base64Str);
			const byteArray = new Uint8Array(byteCharacters.length);

			for (let i = 0; i < byteCharacters.length; i++) {
				byteArray[i] = byteCharacters.charCodeAt(i);
			}

			const blob = new Blob([byteArray], { type: 'application/pdf' });
			this.objectUrl = URL.createObjectURL(blob);
			return this.objectUrl;
		} catch (error) {
			console.error('Error al convertir base64 a Blob:', error);
			// Si falla, retornar el data URL original
			return dataUrl;
		}
	}

	cerrarModal(datos?: any) {
		this.modalController.dismiss(datos);
	}

	/**
	 * Detecta cuando el PDF se carga y obtiene información
	 * para evitar mostrar páginas en blanco
	 */
	onDocumentLoad(event: any) {
		try {
			if (event && event.pagesCount) {
				this.totalPages = event.pagesCount;
				console.log(`PDF cargado con ${this.totalPages} páginas`);
			}
		} catch (error) {
			console.error('Error al obtener información del PDF:', error);
		}
	}

	/**
	 * Maneja errores al renderizar el PDF
	 */
	onPdfError(error: any) {
		console.error('Error al renderizar PDF:', error);
		// No cerrar automáticamente, dejar que el usuario cierre el modal
	}
}