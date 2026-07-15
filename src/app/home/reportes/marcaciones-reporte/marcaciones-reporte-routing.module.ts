import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarcacionesReportePage } from './marcaciones-reporte.page';

const routes: Routes = [
  {
    path: '',
    component: MarcacionesReportePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarcacionesReportePageRoutingModule {}
