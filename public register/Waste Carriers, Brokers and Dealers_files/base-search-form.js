/**
 * Base module for form submission management
 *  setFieldsToCheck( arrage-of-strings )   - form elements, one of which sould be non-empty
 *  setCheckboxFieldsToCheck(array-of-strings) - optional array of groups of checkboxes where at least one must be checked.
 *                                               the value is the field's name
 *  onSubmitForm                     - default function run on form submit
 *  setOnSubmitForm( fn )            - set the function to run on form submit
 */

/* global define */

define([
  "lodash",
  "jquery",
  "jquery-ui",
  "bootstrap",
  "app/back-button"
],
  function (
    _,
    $
  ) {
    "use strict";

    var fieldsToCheck = ["#name-search", "#quick-search", "#permit-search", "#location-address", "#location-postcode"];
    var initFieldsToUncheck = ["#permitDocCheckbox", "#carDocsCheckbox"];
    var checkboxGroupsToCheck = [];
    var documentFilterCheckboxes = ["#permitDocCheckbox", "#carDocsCheckbox"];

    var init = function () {
      initEvents();
    };

    function uncheckCheckboxesByIds(checkboxIds) {
      $.each(checkboxIds, function (index, id) {
        $(id).prop('checked', false);
      });
    }

    var initEvents = function () {
      uncheckCheckboxesByIds(initFieldsToUncheck);

      $("input").on("keypress", onInputKeyPress);

      for (const fieldName of checkboxGroupsToCheck) {
        for (const box of $("." + fieldName + "-checkbox")) {
          $(box).on("click", () => {
            if ($(box).is(':checked')) {
              $("#" + fieldName + "-error").addClass("hidden");
              $("#" + fieldName + "-group").removeClass("govuk-form-group--error");
            }
          });
        };
      };
      $("form").on("submit", function (e) {
        onSubmitFormFn(e);
      });

    };

    var setEastingNorthing = function (e, n) {
      $("#easting").val(e);
      $("#northing").val(n);
    };

    var onInputKeyPress = function (e) {
      $("#empty-search").addClass("hidden");

      if (e.which === 13) {
        e.preventDefault();
        $(e.currentTarget).parents("form").submit();
      }
    };

    var checkSubmit = function (noSubmit) {
      if ($(".govuk-form-group--error").length > 0 || noSubmit) {
        $("button[type=submit]").attr("disabled", "disabled");
        return false;
      }
      else {
        $("button[type=submit]").removeAttr("disabled");
        return true;
      }
    };

    var atLeastOneBoxChecked = function (fieldName) {
      var ok = false;
      for (const box of $("." + fieldName + "-checkbox")) {
        if ($(box).is(':checked')) {
          ok = true;
        }
      };
      return ok;
    }

    var validateCheckboxGroups = function () {
      var isOK = true;
      for (const field of checkboxGroupsToCheck) {
        if (!atLeastOneBoxChecked(field)) {
          $("#" + field + "-error").removeClass("hidden");
          $("#" + field + "-group").addClass("govuk-form-group--error");
          isOK = false;
        }
      }
      return isOK;
    }

    var nonEmptySearch = function (e) {
      var isOK = validateCheckboxGroups();

      var atLeastOneValue = _.find(fieldsToCheck, function (f) {
        var v = $(f).val();
        return v && v !== "";
      });

      // Check if any document filter checkboxes are checked
      var documentCheckboxChecked = _.find(documentFilterCheckboxes, function (checkbox) {
        return $(checkbox).is(':checked');
      });

      if (!atLeastOneValue && !documentCheckboxChecked) {
        $("#empty-search").removeClass("hidden");
        isOK = false;
      }
      if (isOK) {
        isOK = checkSubmit();
      }
      else {
        e.preventDefault();
      }

      return isOK;
    };

    var defaultOnFormSubmit = function (e) {
      return nonEmptySearch(e);
    };

    var onSubmitFormFn = defaultOnFormSubmit;

    /* Initialise on document load */
    $(init);

    /* Exports from the module */
    return {
      setFieldsToCheck: function (fields) { fieldsToCheck = fields; },
      setCheckboxFieldsToCheck: function (checkboxGroups) { checkboxGroupsToCheck = checkboxGroups; },
      onSubmitForm: defaultOnFormSubmit,
      setOnSubmitForm: function (fn) { onSubmitFormFn = fn; },
      checkSubmit: checkSubmit
    };

  });
