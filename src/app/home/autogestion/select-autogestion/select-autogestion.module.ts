import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectAutogestionComponent } from './select-autogestion/select-autogestion.component';
import { IonicSelectableModule } from 'ionic-selectable';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';


@NgModule({
  declarations: [
	  SelectAutogestionComponent
  ],
  imports: [
    CommonModule,
    IonicSelectableModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule
  ],
  exports:[SelectAutogestionComponent]
})
export class SelectAutogestionModule { }
