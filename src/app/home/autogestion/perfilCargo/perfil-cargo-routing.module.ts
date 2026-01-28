import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerfilCargoPage } from './perfil-cargo.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilCargoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PerfilCargoRoutingModule { }
