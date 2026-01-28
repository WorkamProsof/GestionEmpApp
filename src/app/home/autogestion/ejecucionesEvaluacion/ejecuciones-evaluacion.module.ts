import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EjecucionesEvaluacionPage } from './ejecuciones-evaluacion.page';
import { DetalleEjecucionPage } from './detalle-ejecucion.page';
import { EjecucionesEvaluacionRoutingModule } from './ejecuciones-evaluacion-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EjecucionesEvaluacionRoutingModule,
    EjecucionesEvaluacionPage,
    DetalleEjecucionPage
  ]
})
export class EjecucionesEvaluacionModule { }
