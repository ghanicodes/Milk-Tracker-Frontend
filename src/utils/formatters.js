import { CURRENCY_SYMBOL } from './constants';

export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return `${CURRENCY_SYMBOL} 0`;
  return `${CURRENCY_SYMBOL} ${Number(amount).toLocaleString('en-IN')}`;
}

export function formatQuantity(qty) {
  if (!qty) return '0 L';
  return `${Number(qty).toFixed(1)} L`;
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getInputDate(date) {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}
