'use strict';

// The catalog and saved ID list are separate arrays with different purposes.
const products = [
  { id: 'rolls', name: 'Cinnamon Rolls' },
  { id: 'cakes', name: 'Custom Cakes' },
  { id: 'bread', name: 'Fresh Bread' }
];
const storageKey = 'northStarBakeryFavorites';
let favorites = [];
let storageAvailable = true;

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(saved)) return [];
    return [...new Set(saved.filter(id => products.some(product => product.id === id)))];
  } catch (error) {
    storageAvailable = false;
    return [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
    storageAvailable = true;
  } catch (error) {
    storageAvailable = false;
  }
}

function renderFavorites() {
  const list = document.getElementById('favorites-list');
  if (!list) return;
  list.replaceChildren();
  products.filter(product => favorites.includes(product.id)).forEach(product => {
    const item = document.createElement('li');
    item.textContent = product.name;
    list.appendChild(item);
  });
  document.getElementById('favorites-empty').hidden = favorites.length > 0;
  document.querySelectorAll('[data-favorite]').forEach(button => {
    const product = products.find(item => item.id === button.dataset.favorite);
    const saved = favorites.includes(product.id);
    button.setAttribute('aria-pressed', String(saved));
    button.textContent = saved ? 'Remove Favorite' : 'Save Favorite';
    button.setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${product.name} ${saved ? 'from' : 'as'} a favorite`);
  });
}

function toggleFavorite(id) {
  if (!products.some(product => product.id === id)) return;
  favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
  saveFavorites();
  renderFavorites();
  document.getElementById('favorites-status').textContent = storageAvailable
    ? `${favorites.length} favorite${favorites.length === 1 ? '' : 's'} saved. Your choices will be remembered after a refresh.`
    : 'Your choices work on this page, but browser storage is unavailable.';
}

function setupFavorites() {
  if (!document.getElementById('product-list')) return;
  favorites = loadFavorites();
  renderFavorites();
  if (favorites.length) {
    document.getElementById('favorites-status').textContent = `${favorites.length} saved favorite${favorites.length === 1 ? '' : 's'} restored from your last visit.`;
  } else if (!storageAvailable) {
    document.getElementById('favorites-status').textContent = 'Browser storage is unavailable. Favorites will work until you leave this page.';
  }
  document.querySelectorAll('[data-favorite]').forEach(button => {
    button.addEventListener('click', () => toggleFavorite(button.dataset.favorite));
  });
}

function showFieldError(id, message) {
  const field = document.getElementById(id);
  document.getElementById(`${id}-error`).textContent = message;
  field.setAttribute('aria-invalid', String(Boolean(message)));
}

function validateForm() {
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dateField = document.getElementById('pickup-date');
  const errors = {
    'full-name': document.getElementById('full-name').value.trim().length < 2 ? 'Enter a name with at least 2 characters.' : '',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById('email').value.trim()) ? '' : 'Enter a valid email address, such as name@example.com.',
    'pickup-date': dateField.validity.badInput || (dateField.value && dateField.value < localDate) ? 'Choose today or a future pickup date.' : '',
    message: document.getElementById('message').value.trim().length < 10 ? 'Describe your request using at least 10 characters.' : ''
  };
  Object.entries(errors).forEach(([id, message]) => showFieldError(id, message));
  return Object.keys(errors).filter(id => errors[id]);
}

function handleRequest(event) {
  event.preventDefault();
  const invalidFields = validateForm();
  const result = document.getElementById('form-result');
  if (invalidFields.length) {
    result.textContent = 'Please correct the highlighted fields. Your entries have been kept.';
    document.getElementById(invalidFields[0]).focus();
    return;
  }
  result.textContent = `Thank you, ${document.getElementById('full-name').value.trim()}. Your request passed validation. This is a demonstration; no request has been sent to the bakery.`;
}

function setupForm() {
  const form = document.getElementById('order-form');
  if (!form) return;
  form.noValidate = true; // JavaScript supplies all field-specific feedback.
  form.addEventListener('submit', handleRequest);
  form.addEventListener('input', () => {
    document.getElementById('form-result').textContent = '';
    if (form.querySelector('[aria-invalid="true"]')) validateForm();
  });
}

setupFavorites();
setupForm();
