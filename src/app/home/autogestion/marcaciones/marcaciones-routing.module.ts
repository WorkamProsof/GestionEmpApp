import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarcacionesPage } from './marcaciones.page';

const routes: Routes = [
  {
    path: '',
    component: MarcacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarcacionesPageRoutingModule {}
