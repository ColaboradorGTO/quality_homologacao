sap.ui.define(
  [
    "com/quality/quality/controller/BaseController",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
  ],
  function (BaseController, MessageBox, History) {
    
    "use strict";

    return BaseController.extend(
      "com.quality.quality.controller.financeiro.Financeiro",
      {

        teste: function(){
          alert()
        }
      }
    );
  },
  /* bExport= */ true
);
