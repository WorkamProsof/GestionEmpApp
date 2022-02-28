import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CertificadosPageRoutingModule } from './certificados-routing.module';
import { CertificadosPage } from './certificados.page';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ComponentesModule } from '../../../componentes/componentes.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileTransfer   } from '@awesome-cordova-plugins/file-transfer/ngx';
// import { Camera } from '@ionic-native/camera/ngx';

// import { IonicSelectableModule } from 'ionic-selectable';
import { SelectAutogestionModule } from '../select-autogestion/select-autogestion.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		CertificadosPageRoutingModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
		ComponentesModule,
		PipesModule
	],
	providers: [File,FileOpener,FileTransfer],
	declarations: [CertificadosPage]
})
export class CertificadosPageModule { }
