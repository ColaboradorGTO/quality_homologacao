sap.ui.define(
  [
    "com/quality/quality/controller/BaseController",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
  ],
  function (BaseController, MessageBox, History) {
    "use strict";

    return BaseController.extend(
      "com.quality.quality.controller.modulos.SelecaoModulos",
      {
        handleRouteMatched: function (oEvent) {
          var sAppId = "App61afba7be445d901d0fe635f";

          var oParams = {};

          if (oEvent.mParameters.data.context) {
            this.sContext = oEvent.mParameters.data.context;
          } else {
            if (this.getOwnerComponent().getComponentData()) {
              var patternConvert = function (oParam) {
                if (Object.keys(oParam).length !== 0) {
                  for (var prop in oParam) {
                    if (prop !== "sourcePrototype" && prop.includes("Set")) {
                      return prop + "(" + oParam[prop][0] + ")";
                    }
                  }
                }
              };

              this.sContext = patternConvert(
                this.getOwnerComponent().getComponentData().startupParameters
              );
            }
          }

          var oPath;

          if (this.sContext) {
            oPath = {
              path: "/" + this.sContext,
              parameters: oParams,
            };
            this.getView().bindObject(oPath);
          }
        },

        _onModuloSelecionado: function () {
          this.getRouter().navTo("menu");
        },

        _onPressSair: function () {
          this.getRouter().navTo("login");
        },

        onInit: function () {
          this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          this.oRouter
            .getTarget("modulos")
            .attachDisplay(this.handleRouteMatched, this);
        },
        handleRouteMatched: function (oEvent) {
          this.verifyToken().then(
            function (hasToken) {
              if (!hasToken) {
                this.getRouter().navTo("login");
              }
            }.bind(this)
          );
        },
      }
    );
  },
  /* bExport= */ true
);
