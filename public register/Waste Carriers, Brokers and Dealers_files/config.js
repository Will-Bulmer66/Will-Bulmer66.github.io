/* jshint quotmark: double */
/* global require */

require.config({
  shim: {
    bootstrap: {
      deps: [
        "jquery"
      ]
    },
    datepicker: {
      deps: [
        "jquery", "bootstrap"
      ]
    },
    datepickerGB: {
      deps: [
        "jquery","bootstrap", "datepicker"
      ]
    },
    jquery: {
      exports: "$"
    },
    "jquery-ui": {
      deps: [
        "jquery"
      ]
    },
    "openspace": {
      deps: [],
      exports: "OpenSpace"
    },
    "combobox" : {
        deps: [
            "bootstrap", "jquery"
        ]
    }
  },
  paths: {
    "bootstrap": "vendor/bootstrap",
    "combobox" : "vendor/bootstrap-combobox",
    "cookies" : "cookie-banner",
    "datepicker" : "vendor/bootstrap-datepicker",
    "datepickerGB": "locales/bootstrap-datepicker.en-GB",
    "datatables": "vendor/jquery.dataTables",
    "highlight": "vendor/highlight.pack",
    jquery: "vendor/jquery",
    "jquery-ui": "vendor/jquery-ui",
    lodash: "vendor/lodash",
    "openspace": "https://api.os.uk/search/names/v1/find?key=Hen1vZOZQlw1b4jQIFG1hX9KhCe9q4XD",
    "moment" : "vendor/plugins/dataTables/moment.min",
    "datetime-moment" : "vendor/plugins/dataTables/datetime-moment",
    "datatables-responsive": "vendor/datatables.responsive"
  },
  packages: [
  ]
});

