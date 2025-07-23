sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    return Opa5.extend("com.arvo.resumobalanco.test.integration.arrangements.Startup", {
        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "com.arvo.resumobalanco",
                    async: true,
                    manifest: true
                }
            });
        }
    });
});
