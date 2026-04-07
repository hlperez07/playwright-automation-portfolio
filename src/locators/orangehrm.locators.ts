/**
 * OrangeHRM shared selector strings — two groups:
 *
 * OxdLocators — CSS class names from OrangeHRM's custom Vue component library.
 * A single edit here propagates everywhere if OrangeHRM upgrades its component classes.
 *
 * OrangeHrmCommon — UI text strings shared across multiple pages as locator arguments.
 */

export const OxdLocators = {
  /** Clickable trigger element of a custom oxd-select dropdown */
  selectText: '.oxd-select-text',
  /** Options panel rendered when an oxd-select dropdown opens */
  selectDropdown: '.oxd-select-dropdown',
  /** Generic form-row container — used to scope child locators by label text */
  formRow: '.oxd-form-row',
  /** Async loading indicator shown during form data fetches */
  formLoader: '.oxd-form-loader',
  /** Toggle switch rendered as a <span>, not a standard <input type="checkbox"> */
  switchInput: '.oxd-switch-input',
  /** Content-area span — scope "No Records Found" assertions away from toast duplicates */
  contentSpan: 'span.oxd-text',
} as const;

export const OrangeHrmCommon = {
  /** Placeholder on every OrangeHRM typeahead / autocomplete input */
  typeaheadPlaceholder: 'Type for hints...',
  /** Empty-state text in search result tables */
  noRecordsText: 'No Records Found',
  /** Success toast message shown after any form save */
  successToastText: 'Successfully Saved',
  /** Search button label shared across all list / filter pages */
  searchButton: 'Search',
  /** Save button label shared across all form pages */
  saveButton: 'Save',
  /** Add button label shared across all list pages */
  addButton: 'Add',
} as const;
