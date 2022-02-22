import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionarsolicitudPage } from './gestionarsolicitud.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarsolicitudPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionarsolicitudPageRoutingModule {}
