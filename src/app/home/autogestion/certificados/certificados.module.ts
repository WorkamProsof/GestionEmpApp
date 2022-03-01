import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CertificadosPageRoutingModule } from './certificados-routing.module';
import { CertificadosPage } from './certificados.page';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ComponentesModule } from '../../../componentes/componentes.module';
import { PipesModule } from '../../../pipes/pipes.module';

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
	declarations: [CertificadosPage]
})
export class CertificadosPageModule { }
