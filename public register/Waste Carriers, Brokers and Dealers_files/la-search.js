/**
 * Module for local authority search completion - pulls in base-search-form
 * Auto initializes
 */

/* global define */

define( [
  "lodash",
  "jquery",
  "app/base-search-form"
],
function(
  _,
  $,
  base
) {
  "use strict";

  var init = function() {
    initEvents();
  };

  var initEvents = function() {
    $("#la-search").on( "change", checkNonCompletedLaLookup);

    loadLocalAuthorities();
  };

  var loadLocalAuthorities = function() {
    // Use the DropdownEndpoint that exposes DropdownManager via HTTP
    // This endpoint returns cached dropdown values from the RDF store
    var endpoint = '/public-register/local-authority.json';

    $.ajax({
      url: endpoint,
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        local_authorities = [];
        if (data && data.items && Array.isArray(data.items)) {
          // Extract the prefLabel from each item object
          $.each(data.items, function(index, item) {
            if (item.prefLabel) {
              local_authorities.push(item.prefLabel);
            } else if (typeof item === 'string') {
              // Fallback if item is a string instead of object
              local_authorities.push(item);
            }
          });
        }
        initAutocomplete();
      },
      error: function(xhr, status, error) {
        console.error('Failed to load local authorities:', error);
        initAutocomplete();
      }
    });
  };

  var initAutocomplete = function() {
    _.defer( function() {
        $("#la-search").autocomplete( {
            minLength: 0,
            autoFocus: true,
            source: local_authorities,
        } );
    } );
  };

  var checkNonCompletedLaLookup = function( e ) {
    if( laOk()) {
      hideError();
      base.checkSubmit();
    } else {
      showError();
      base.checkSubmit();
      e.preventDefault();
    }
  };

  var laOk = function() {
    var ok = true;
    var currentLa = $("#la-search").val();
    if (_.isString( currentLa ) && currentLa !== "") {
      if (local_authorities.includes(currentLa)) {
        return true;
      }
      ok = false;
    }
    return ok;
  }

  var showError = function () {
    $("#la-search").parents( ".govuk-form-group" ).addClass( "govuk-form-group--error" );
    $("#la-search").addClass("govuk-input--error");
    $("#la-search-error").removeClass( "hidden" );
  }
  var hideError = function () {
    $("#la-search").parents( ".govuk-form-group" ).removeClass( "govuk-form-group--error" );
    $("#la-search").removeClass("govuk-input--error");
    $("#la-search-error").addClass( "hidden" );
  }

  var local_authorities = [];

  /* Initialise on document load */
  $(init);

  /* Module returns */
  return {
    localAuthorities: local_authorities
  }

} );
