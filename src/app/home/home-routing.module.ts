/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'inicio',
		pathMatch: 'full'
	},
	{
		path: 'inicio',
		loadChildren: () => import('./inicio/inicio.module').then(m => m.InicioPageModule)
	},
	{
		path: 'datosbasicos',
		loadChildren: () => import('./autogestion/datosbasicos/datosbasicos.module').then(m => m.DatosbasicosPageModule)
	},
  {
    path: 'solicitarvacaciones',
    loadChildren: () => import('./autogestion/solicitarvacaciones/solicitarvacaciones.module').then( m => m.SolicitarvacacionesPageModule)
  },
  {
    path: 'solicitarpermisos',
    loadChildren: () => import('./autogestion/solicitarpermisos/solicitarpermisos.module').then( m => m.SolicitarpermisosPageModule)
  },
  {
    path: 'certificados',
    loadChildren: () => import('./autogestion/certificados/certificados.module').then( m => m.CertificadosPageModule)
  },
  {
    path: 'registroausentismo',
    loadChildren: () => import('./autogestion/registroausentismo/registroausentismo.module').then( m => m.registroausentismoPageModule)
  },
  {
    path: 'elementosproteccion',
    loadChildren: () => import('./autogestion/elementosproteccion/elementosproteccion.module').then( m => m.elementosproteccionPageModule)
  },
  {
    path: 'gastos',
    loadChildren: () => import('./gastos/gastos.module').then( m => m.GastosPageModule)
  },
  {
    path: 'perfilcargo',
    loadChildren: () => import('./autogestion/perfilCargo/perfil-cargo.module').then( m => m.PerfilCargoModule)
  },
  {
    path: 'ejecucionesevaluacion',
    loadChildren: () => import('./autogestion/ejecucionesEvaluacion/ejecuciones-evaluacion.module').then( m => m.EjecucionesEvaluacionModule)
  },
  {
    path: 'marcaciones',
    loadChildren: () => import('./autogestion/marcaciones/marcaciones.module').then( m => m.MarcacionesPageModule)
  },
  {
    path: 'marcaciones-reporte',
    loadChildren: () => import('./reportes/marcaciones-reporte/marcaciones-reporte.module').then( m => m.MarcacionesReportePageModule)
  }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HomePageRoutingModule { }
