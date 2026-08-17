/** Configure waste carriers search form */

/* global define */

define( [
  "lodash",
  "jquery",
  "app/base-search-form",
  "app/la-search",
  "app/postcode-search",
  "jquery-ui",
  "bootstrap"
],
function(
  _,
  $,
  base,
  laSearch
) {
  "use strict";

  base.setFieldsToCheck( ["#name-search", "#number-search", "#location-address", "#location-postcode"] );

  /* Do we need to defer this? */
  base.setCheckboxFieldsToCheck( ["regime"] );

  return {};

} );

