sap.ui.define(
  [
    "com/quality/quality/controller/BaseController",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment"
  ],
  function (BaseController, MessageBox, History, Fragment) {
    "use strict";

    return BaseController.extend(
      "com.quality.quality.controller.menu.Menu",
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
        onInit: function () {
          this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        },

        _onToggleButtonPress: function(oEvent) {
          var oToolPage = oEvent.getSource().getParent().getParent();
          var oSideNavigation = oToolPage.getAggregation('sideContent');
          var bExpanded = oSideNavigation.getExpanded();
          console.log(oSideNavigation)
          oSideNavigation.setExpanded(!bExpanded);
    
        },
        _onPressVoltar: function(oEvent){
          this.getRouter().navTo("modulos");
        },
        _onPressSair: function(oEvent){
          this.getRouter().navTo("modulos");
        },
        _onNavigationListItemSelect: function(oEvent) {
          var that = this;
          var optCRT = oEvent.getSource().mProperties.key.split("view.")
          var oCtrl = sap.ui.controller("com.quality.quality.controller/"+optCRT[1]);
          
          Fragment.load({
            type: "XML",
            name: oEvent.getSource().mProperties.key,
            controller: oCtrl
            }).then(function(frag){
              var oLayout = that.byId('fragmentContent');
              oLayout.addItem(frag);
            });
        },
      }
    );
  },
  /* bExport= */ true
);
