import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EjecucionesEvaluacionPage } from './ejecuciones-evaluacion.page';
import { DetalleEjecucionPage } from './detalle-ejecucion.page';
import { DetalleAgrupado } from './detalle-agrupado.page';

const routes: Routes = [
  {
    path: '',
    component: EjecucionesEvaluacionPage
  },
  {
    path: 'detalle/:id',
    component: DetalleEjecucionPage
  },
  {
    path: 'detalle-agrupado/:evaluacionId',
    component: DetalleAgrupado
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EjecucionesEvaluacionRoutingModule { }
