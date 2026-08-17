/**
 * Module for postcode search completion - pulls in base-search-form
 * Auto initializes
 */

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

  /* Constants */
  var LOCAL_TYPE_FIELD = "LOCAL_TYPE";
  var GEOMETRY_X_FIELD = "GEOMETRY_X";
  var GEOMETRY_Y_FIELD = "GEOMETRY_Y";
  var NAME1_FIELD = "NAME1";

  var MIN_POSTCODE_SEARCH_LENGTH = 3;

  var POSTCODE_GROUPS = /^([A-Z]{1,2}[0-9]{1,2}[A-Z]?)([0-9]{1}[A-Z]{2})$/;

  var osNames = "https://api.os.uk/search/names/v1/find";
  var osNamesKey = "Hen1vZOZQlw1b4jQIFG1hX9KhCe9q4XD";

  var cache = {
    /* Map from postcode to easting/northing */
    postCodeLocations: {},

    /* Map from input term to postcode completions */
    postCodeCompletions: {}
  };

  var init = function() {
    initEvents();
  };

  var initEvents = function() {
    base.setOnSubmitForm( onSubmitForm );

    _.defer( function() {
      $("#location-postcode").autocomplete( {
        minLength: 0,
        autoFocus: false,
        source: onAutocompletePostcode,
        change: onPostcodeChange,
        select: onPostcodeChange
      } );
    } );
  };

  var onSubmitForm = function( e ) {
    if ( checkNonCompletedPostcodeLookup( e )) {
      return base.onSubmitForm( e );
    } else {
      return false;
    }
  };

  var onAutocompletePostcode = function( acRequest, acResponse ) {
    hideInvalidPostcode();

    var term = _.escape( acRequest.term );
    if (term.length >= MIN_POSTCODE_SEARCH_LENGTH) {
      var termNorm = respacePostcode( normalizePostcode( term ) );
      var hits = cachedLookahead( termNorm );

      if (hits) {
        acResponse( hits );
      }
      else {
        doPostcodeAjaxLookup( termNorm, acResponse );
      }
    }
  };

  var cachedLookahead = function( key ) {
    return cache.postCodeCompletions[key];
  };

  var doPostcodeAjaxLookup = function( term, onCompletion ) {
    $.ajax( osNames, {
      data: {
        key: osNamesKey,
        query: term
      }
    })
    .done( function( results ) {
      onAutocompletePostcodeResults( results, term, onCompletion );
    } )
    .fail( function( x, status, msg ) {
      console.log( "Postcode lookup failed: " + msg + ", status = " + status );
    } );
  };

  /**
   * After getting a response to the ajax call to the postcode lookup service.
   * We display the autocomplete dialogue only if the user has not subsequently
   * changed the input we were autocompleting on.
   */
  var onAutocompletePostcodeResults = function( results, term, onCompletion ) {
    if (term == currentPostcodeValue()) {
      displayAutocompletePostcodeResults( results, term, onCompletion );
    }
  };

  var displayAutocompletePostcodeResults = function( results, term, onCompletion ) {
    var hits = _.map( results.results, "GAZETTEER_ENTRY" );

    hits = _.map( hits, function( hit ) {
      if (hit[LOCAL_TYPE_FIELD] === "Postcode" && hit[NAME1_FIELD].indexOf( term ) === 0) {
        var postCode = hit[NAME1_FIELD];
        var postCodeNorm = normalizePostcode( postCode );
        var easting = hit[GEOMETRY_X_FIELD];
        var northing = hit[GEOMETRY_Y_FIELD];

        cache.postCodeLocations[postCodeNorm] = {
          easting: easting.toFixed(),
          northing: northing.toFixed()
        };

        return postCode;
      }
      else {
        return null;
      }
    } );

    hits = _.compact( hits ).sort();
    cache.postCodeCompletions[term] = hits;
    onCompletion( hits );
  };


  var normalizePostcode = function( postCode ) {
    return _.trim( postCode.replace( / +/g, " " ).toLocaleUpperCase() );
  };

  var onPostcodeChange = function( event, selected ) {
    var postCode = (selected && selected.item) ? selected.item.label : currentPostcodeValue();
    // validatePostcode( postCode );
  };

  var validatePostcode = function( postCode ) {
    var postCodeNorm = normalizePostcode( postCode );
    var cached = cache.postCodeLocations[postCodeNorm];
    var e = "";
    var n = "";
    var valid = true;

    if (cached) {
      e = cached.easting.toString();
      n = cached.northing.toString();
    }
    else {
      showInvalidPostcode();
      valid = false;
    }

    setEastingNorthing( e, n );
    return valid;
  };

  var currentPostcodeValue = function() {
    var rawPostcode = normalizePostcode( $("#location-postcode").val() );
    rawPostcode = respacePostcode( rawPostcode );
    return rawPostcode;
  };

  var respacePostcode = function( rawPostcode ) {
    if (!rawPostcode.match( /\s/ )) {
      var groups = rawPostcode.match( POSTCODE_GROUPS );
      if (groups) {
        return (groups[1] + " " + groups[2]);
      }
    }
    return rawPostcode;
};

  var setNormalizedPostcode = function() {
    return $("#location-postcode").val( currentPostcodeValue() );
  };

  var setEastingNorthing = function( e, n ) {
    $("#easting").val( e );
    $("#northing").val( n );
  };

  /* Return false to prevent submit event */
  var checkNonCompletedPostcodeLookup = function( e ) {
    var postcodeOK = true;
    var postcode = currentPostcodeValue();

    if (_.isString( postcode ) && postcode !== "") {
      if (_.has( cache.postCodeCompletions, postcode )) {
        if (validatePostcode( postcode )) {
            // Already validated so just accept it
            setNormalizedPostcode();
            return true;
        }
      }
      // Either not compelete at or invalid, invalid result might be error so retry
      hideInvalidPostcode();
      doPostcodeAjaxLookup( postcode, function() {
          if (validatePostcode( postcode )) {
            setNormalizedPostcode();
            submitForm();
          }
      } );

      // prevent the submit for now
      e.preventDefault();
      postcodeOK = false;
    }

    return postcodeOK;
  };

  var submitForm = function() {
    $("form").submit();
  };

  var showInvalidPostcode = function() {
    $("#location-postcode").parents( ".govuk-form-group" ).addClass( "govuk-form-group--error" );
    $("#location-postcode").addClass("govuk-input--error")
    $("#location-postcode-error").removeClass( "hidden" );
    base.checkSubmit();
  };

  var hideInvalidPostcode = function() {
    $("#location-postcode").parents( ".govuk-form-group" ).removeClass( "govuk-form-group--error" );
    $("#location-postcode").removeClass("govuk-input--error")
    $("#location-postcode-error").addClass( "hidden" );
    base.checkSubmit();
  };

  /* Initialise on document load */
  $(init);

  return {};
} );
