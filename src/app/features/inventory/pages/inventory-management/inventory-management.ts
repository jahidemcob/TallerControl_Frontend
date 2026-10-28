import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { AuthService } from '../../../../core/services/auth';
import { InventoryFacade } from '../../services/inventory.facade';
import {
  InventoryCategory,
  InventoryCategoryRequest,
  InventoryEntryRequest,
  InventoryAdjustmentRequest,
  InventoryExitRequest,
  InventoryItem,
  InventoryItemRequest,
  InventoryItemType,
  InventoryMovement,
  InventoryMovementType,
} from '../../models/inventory.model';

type InventorySection = 'items' | 'categories' | 'movements';
type MovementOperation = 'entry' | 'adjustment' | 'exit';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './inventory-management.html',
  styleUrl: './inventory-management.css',
})
export class InventoryManagementComponent implements OnInit {
  private readonly facade = inject(InventoryFacade);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  isAdmin = false;
  section: InventorySection = 'items';

  categories: InventoryCategory[] = [];
  items: InventoryItem[] = [];
  activeItems: InventoryItem[] = [];
  movements: InventoryMovement[] = [];

  loadingCategories = false;
  loadingItems = false;
  loadingMovements = false;
  savingCategory = false;
  savingItem = false;
  savingOperation = false;

  errorMessage = '';
  successMessage = '';

  categoryFormVisible = false;
  editingCategoryId: number | null = null;
  categoryForm: InventoryCategoryRequest = this.emptyCategoryForm();

  itemFormVisible = false;
  editingItemId: number | null = null;
  itemForm: InventoryItemRequest = this.emptyItemForm();

  itemFilters = {
    search: '',
    categoryId: 0,
    itemType: '' as InventoryItemType | '',
    onlyLowStock: false,
    includeInactive: false,
  };

  movementFilters = {
    inventoryItemId: 0,
    movementType: '' as InventoryMovementType | '',
    from: '',
    to: '',
  };

  activeOperation: MovementOperation | null = null;

  operationForm = this.emptyOperationForm();

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'administrador';

    this.loadCategories();
    this.loadItems();
    this.loadActiveItems();
    this.loadMovements();
  }

  get activeCategories(): InventoryCategory[] {
    return this.categories.filter((category) => category.isActive);
  }

  get activeItemsCount(): number {
    return this.activeItems.length;
  }

  get lowStockCount(): number {
    return this.activeItems.filter((item) => item.isLowStock).length;
  }

  get totalStockValue(): number {
    return this.activeItems.reduce(
      (total, item) => total + item.availableQuantity * item.purchaseCost,
      0,
    );
  }

  setSection(section: InventorySection): void {
    if (section === 'categories' && !this.isAdmin) return;

    this.section = section;
    this.errorMessage = '';
    this.successMessage = '';

    if (section === 'movements') {
      this.loadMovements();
    }
  }

  refreshAll(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.loadCategories();
    this.loadItems();
    this.loadActiveItems();
    this.loadMovements();
  }

  loadCategories(): void {
    this.loadingCategories = true;

    this.facade.getCategories(this.isAdmin).subscribe({
      next: (data) => {
        this.categories = data;
        this.loadingCategories = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.facade.getErrorMessage(
          err,
          'No fue posible cargar las categorías.',
        );
        this.loadingCategories = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadItems(): void {
    this.loadingItems = true;

    this.facade
      .getItems({
        categoryId: this.itemFilters.categoryId || undefined,
        itemType: this.itemFilters.itemType || undefined,
        includeInactive: this.isAdmin && this.itemFilters.includeInactive,
        onlyLowStock: this.itemFilters.onlyLowStock,
        search: this.itemFilters.search,
      })
      .subscribe({
        next: (data) => {
          this.items = data;
          this.loadingItems = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMessage = this.facade.getErrorMessage(
            err,
            'No fue posible cargar los artículos.',
          );
          this.loadingItems = false;
          this.cdr.markForCheck();
        },
      });
  }

  private loadActiveItems(): void {
    this.facade.getItems().subscribe({
      next: (data) => {
        this.activeItems = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.facade.getErrorMessage(
          err,
          'No fue posible cargar los artículos activos.',
        );
        this.cdr.markForCheck();
      },
    });
  }

  loadMovements(): void {
    this.loadingMovements = true;

    this.facade
      .getMovements({
        inventoryItemId: this.movementFilters.inventoryItemId || undefined,
        movementType: this.movementFilters.movementType || undefined,
        from: this.movementFilters.from ? `${this.movementFilters.from}T00:00:00` : undefined,
        to: this.movementFilters.to ? `${this.movementFilters.to}T23:59:59` : undefined,
      })
      .subscribe({
        next: (data) => {
          this.movements = data;
          this.loadingMovements = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMessage = this.facade.getErrorMessage(
            err,
            'No fue posible cargar el historial de movimientos.',
          );
          this.loadingMovements = false;
          this.cdr.markForCheck();
        },
      });
  }

  searchItems(): void {
    this.loadItems();
  }

  clearItemFilters(): void {
    this.itemFilters = {
      search: '',
      categoryId: 0,
      itemType: '',
      onlyLowStock: false,
      includeInactive: false,
    };

    this.loadItems();
  }

  openCategoryForm(category?: InventoryCategory): void {
    if (!this.isAdmin) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.editingCategoryId = category?.id ?? null;

    this.categoryForm = category
      ? {
          name: category.name,
          description: category.description ?? '',
        }
      : this.emptyCategoryForm();

    this.categoryFormVisible = true;
  }

  cancelCategoryForm(): void {
    this.categoryFormVisible = false;
    this.editingCategoryId = null;
    this.categoryForm = this.emptyCategoryForm();
  }

  saveCategory(form: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const dto: InventoryCategoryRequest = {
      name: this.categoryForm.name.trim(),
      description: this.categoryForm.description.trim(),
    };

    if (!dto.name) {
      this.errorMessage = 'El nombre de la categoría es obligatorio.';
      return;
    }

    const editingId = this.editingCategoryId;
    this.savingCategory = true;

    const request =
      editingId === null
        ? this.facade.createCategory(dto)
        : this.facade.updateCategory(editingId, dto);

    request.subscribe({
      next: () => {
        this.successMessage =
          editingId === null
            ? 'INVENTORY.MESSAGES.CATEGORY_CREATED'
            : 'INVENTORY.MESSAGES.CATEGORY_UPDATED';

        this.savingCategory = false;
        this.cancelCategoryForm();
        this.loadCategories();
        this.loadItems();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.facade.getErrorMessage(err);
        this.savingCategory = false;
        this.cdr.markForCheck();
      },
    });
  }

  toggleCategory(category: InventoryCategory): void {
    this.errorMessage = '';
    this.successMessage = '';

    const request = category.isActive
      ? this.facade.deactivateCategory(category.id)
      : this.facade.activateCategory(category.id);

    request.subscribe({
      next: () => {
        this.successMessage = category.isActive
          ? 'INVENTORY.MESSAGES.CATEGORY_DEACTIVATED'
          : 'INVENTORY.MESSAGES.CATEGORY_ACTIVATED';

        this.loadCategories();
        this.loadItems();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.facade.getErrorMessage(err);
        this.cdr.markForCheck();
      },
    });
  }

  openItemForm(item?: InventoryItem): void {
    if (!this.isAdmin) return;

    if (this.activeCategories.length === 0) {
      this.section = 'categories';
      this.errorMessage = 'Primero debes crear o activar una categoría.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.editingItemId = item?.id ?? null;

    this.itemForm = item
      ? {
          categoryId: item.categoryId,
          code: item.code,
          name: item.name,
          itemType: item.itemType,
          brand: item.brand ?? '',
          description: item.description ?? '',
          minimumStock: item.minimumStock,
          purchaseCost: item.purchaseCost,
          salePrice: item.salePrice,
        }
      : this.emptyItemForm();

    if (!this.itemForm.categoryId) {
      this.itemForm.categoryId = this.activeCategories[0].id;
    }

    this.itemFormVisible = true;
  }

  cancelItemForm(): void {
    this.itemFormVisible = false;
    this.editingItemId = null;
    this.itemForm = this.emptyItemForm();
  }

  saveItem(form: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const dto: InventoryItemRequest = {
      categoryId: Number(this.itemForm.categoryId),
      code: this.itemForm.code.trim(),
      name: this.itemForm.name.trim(),
      itemType: this.itemForm.itemType,
      brand: this.itemForm.brand.trim(),
      description: this.itemForm.description.trim(),
      minimumStock: Number(this.itemForm.minimumStock),
      purchaseCost: Number(this.itemForm.purchaseCost),
      salePrice: Number(this.itemForm.salePrice),
    };

    if (!dto.categoryId || !dto.code || !dto.name) {
      this.errorMessage = 'Completa los campos obligatorios del artículo.';
      return;
    }

    if (
      [dto.minimumStock, dto.purchaseCost, dto.salePrice].some(
        (value) => !Number.isFinite(value) || value < 0,
      )
    ) {
      this.errorMessage = 'Las cantidades y los precios no pueden ser negativos.';
      return;
    }

    const editingId = this.editingItemId;
    this.savingItem = true;

    const request =
      editingId === null ? this.facade.createItem(dto) : this.facade.updateItem(editingId, dto);

    request.subscribe({
      next: () => {
        this.successMessage =
          editingId === null
            ? 'INVENTORY.MESSAGES.ITEM_CREATED'
            : 'INVENTORY.MESSAGES.ITEM_UPDATED';

        this.savingItem = false;
        this.cancelItemForm();
        this.loadItems();
        this.loadActiveItems();
        this.loadCategories();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.facade.getErrorMessage(err);
        this.savingItem = false;
        this.cdr.markForCheck();
      },
    });
  }

  toggleItem(item: InventoryItem): void {
    this.errorMessage = '';
    this.successMessage = '';

    const request = item.isActive
      ? this.facade.deactivateItem(item.id)
      : this.facade.activateItem(item.id);

    request.subscribe({
      next: () => {
        this.successMessage = item.isActive
          ? 'INVENTORY.MESSAGES.ITEM_DEACTIVATED'
          : 'INVENTORY.MESSAGES.ITEM_ACTIVATED';

        this.loadItems();
        this.loadActiveItems();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.facade.getErrorMessage(err);
        this.cdr.markForCheck();
      },
    });
  }

  openOperation(operation: MovementOperation): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.section = 'movements';
    this.activeOperation = operation;
    this.operationForm = this.emptyOperationForm();

    this.operationForm.inventoryItemId = this.activeItems[0]?.id ?? 0;
    this.operationForm.unitCost = this.activeItems[0]?.purchaseCost ?? 0;
  }

  cancelOperation(): void {
    this.activeOperation = null;
    this.operationForm = this.emptyOperationForm();
  }

  onOperationItemChange(): void {
    const item = this.activeItems.find(
      (candidate) => candidate.id === Number(this.operationForm.inventoryItemId),
    );

    if (item) this.operationForm.unitCost = item.purchaseCost;
  }

  saveOperation(form: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.activeOperation) return;

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const itemId = Number(this.operationForm.inventoryItemId);
    const quantity = Number(this.operationForm.quantity);
    const reason = this.operationForm.reason.trim();

    if (!itemId || !Number.isFinite(quantity) || quantity <= 0 || !reason) {
      this.errorMessage = 'Selecciona un artículo, una cantidad válida y escribe el motivo.';
      return;
    }

    this.savingOperation = true;

    let request: Observable<InventoryMovement>;
    let successKey: string;

    if (this.activeOperation === 'entry') {
      const unitCost = Number(this.operationForm.unitCost);

      if (!Number.isFinite(unitCost) || unitCost < 0) {
        this.savingOperation = false;
        this.errorMessage = 'El costo de compra no puede ser negativo.';
        return;
      }

      const dto: InventoryEntryRequest = {
        inventoryItemId: itemId,
        quantity,
        unitCost,
        reason,
      };

      request = this.facade.registerEntry(dto);
      successKey = 'INVENTORY.MESSAGES.ENTRY_CREATED';
    } else if (this.activeOperation === 'adjustment') {
      const dto: InventoryAdjustmentRequest = {
        inventoryItemId: itemId,
        quantity,
        increaseStock: this.operationForm.increaseStock,
        reason,
      };

      request = this.facade.registerAdjustment(dto);
      successKey = this.operationForm.increaseStock
        ? 'INVENTORY.MESSAGES.ADJUSTMENT_INCREASED'
        : 'INVENTORY.MESSAGES.ADJUSTMENT_DECREASED';
    } else {
      const dto: InventoryExitRequest = {
        inventoryItemId: itemId,
        quantity,
        reason,
      };

      request = this.facade.registerExit(dto);
      successKey = 'INVENTORY.MESSAGES.EXIT_CREATED';
    }

    request.subscribe({
      next: () => {
        this.savingOperation = false;
        this.successMessage = successKey;

        this.cancelOperation();
        this.loadItems();
        this.loadActiveItems();
        this.loadMovements();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.facade.getErrorMessage(err);
        this.savingOperation = false;
        this.cdr.markForCheck();
      },
    });
  }

  clearMovementFilters(): void {
    this.movementFilters = {
      inventoryItemId: 0,
      movementType: '',
      from: '',
      to: '',
    };

    this.loadMovements();
  }

  trackById(_index: number, item: { id: number }): number {
    return item.id;
  }

  private emptyCategoryForm(): InventoryCategoryRequest {
    return { name: '', description: '' };
  }

  private emptyItemForm(): InventoryItemRequest {
    return {
      categoryId: 0,
      code: '',
      name: '',
      itemType: 'Repuesto',
      brand: '',
      description: '',
      minimumStock: 0,
      purchaseCost: 0,
      salePrice: 0,
    };
  }

  private emptyOperationForm(): {
    inventoryItemId: number;
    quantity: number | null;
    unitCost: number | null;
    increaseStock: boolean;
    reason: string;
  } {
    return {
      inventoryItemId: 0,
      quantity: null,
      unitCost: 0,
      increaseStock: true,
      reason: '',
    };
  }
}
