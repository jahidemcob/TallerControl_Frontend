import { Routes } from '@angular/router';

import { TransactionList } from './pages/transaction-list/transaction-list';

export const FINANCE_ROUTES: Routes = [
  { path: '', component: TransactionList },
];  