/**
 * Centralized exports for all components
 * Organized by feature/page for faster development
 */

// Layout components
export { default as Header } from './header';
export { default as Sidebar } from './sidebar';

// Page components
export * from './pages/inventory-page';
export * from './pages/settings-page';

// Dialog components
export * from './dialogs/create-complaint-dialog';
export * from './dialogs/bulk-action-dialog';

// Form components
export * from './forms/complaint-form';
export * from './forms/asset-form';

// Utility components
export * from './ui/loading-skeleton';
export * from './ui/empty-state';
