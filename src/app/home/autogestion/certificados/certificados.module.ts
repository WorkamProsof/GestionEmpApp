import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CertificadosPageRoutingModule } from './certificados-routing.module';
import { CertificadosPage } from './certificados.page';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ComponentesModule } from '../../../componentes/componentes.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FiltrosCertificadosComponent } from './filtros-certificados/filtros-certificados/filtros-certificados.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { VerPdfComponent } from './ver-pdf/ver-pdf.component';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		CertificadosPageRoutingModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
		ComponentesModule,
		FontAwesomeModule,
		PipesModule,
		PdfViewerModule
	],
	providers: [InAppBrowser, File, FileOpener],
	declarations: [CertificadosPage, FiltrosCertificadosComponent, VerPdfComponent]
})
export class CertificadosPageModule { }
