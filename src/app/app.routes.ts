import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { JsonDiffComponent } from './features/json-diff/json-diff.component';
import { JsonSchemaComponent } from './features/json-schema/json-schema.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'JSON / Form Helper',
  },
  {
    path: 'diff',
    component: JsonDiffComponent,
    title: 'JSON Diff - JSON / Form Helper',
  },
  {
    path: 'schema',
    component: JsonSchemaComponent,
    title: 'JSON Schema Validation - JSON / Form Helper',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
