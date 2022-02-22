import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DatosbasicosPageRoutingModule } from './datosbasicos-routing.module';
import { DatosbasicosPage } from './datosbasicos.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ComponentesModule } from '../../../componentes/componentes.module';
import { PipesModule } from '../../../pipes/pipes.module';
// import { Camera } from '@ionic-native/camera/ngx';

// import { IonicSelectableModule } from 'ionic-selectable';
import { SelectAutogestionModule } from '../select-autogestion/select-autogestion.module';

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
		DatosbasicosPageRoutingModule,
		ComponentesModule,
		PipesModule,
    FormsModule,
		// IonicSelectableModule,
		SelectAutogestionModule
	],
	declarations: [DatosbasicosPage],
	// providers: [Camera]
})

export class DatosbasicosPageModule { }
