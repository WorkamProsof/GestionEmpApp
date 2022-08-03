import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'inicio',
		loadChildren: () => import('./inicio/inicio.module').then(m => m.InicioPageModule)
	},
	{
		path: 'gastos',
		loadChildren: () => import('./gastos/gastos.module').then(m => m.GastosPageModule)
	},
	{
		path: 'gestion',
		loadChildren: () => import('./gestion/gestion.module').then(m => m.GestionPageModule)
	},
	{
		path: 'gestionarsolicitud',
		loadChildren: () => import('./gestionarsolicitud/gestionarsolicitud.module').then(m => m.GestionarsolicitudPageModule)
	},
	{
		path: 'detalle',
		loadChildren: () => import('./detalle/detalle.module').then(m => m.DetallePageModule)
	},
	{
		path: 'datosbasicos',
		loadChildren: () => import('./autogestion/datosbasicos/datosbasicos.module').then(m => m.DatosbasicosPageModule)
	},
	{
		path: 'solicitarvacaciones',
		loadChildren: () => import('./autogestion/solicitarvacaciones/solicitarvacaciones.module').then(m => m.SolicitarvacacionesPageModule)
	},
	{
		path: 'certificados',
		loadChildren: () => import('./autogestion/certificados/certificados.module').then(m => m.CertificadosPageModule)
	},
	{
		path: 'configuracion',
		loadChildren: () => import('./configuracion/configuracion.module').then(m => m.ConfiguracionPageModule)
	},
	{
		path: 'solicitarpermisos',
		loadChildren: () => import('./autogestion/solicitarpermisos/solicitarpermisos.module').then(m => m.SolicitarpermisosPageModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HomePageRoutingModule { }
