import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilCargoPage } from './perfil-cargo.page';
import { PerfilCargoRoutingModule } from './perfil-cargo-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PerfilCargoRoutingModule,
    PerfilCargoPage
  ]
})
export class PerfilCargoModule { }
