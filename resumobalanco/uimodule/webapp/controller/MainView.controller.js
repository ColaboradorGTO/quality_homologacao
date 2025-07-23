sap.ui.define(
  [
    "com/arvo/resumobalanco/controller/BaseController",
    "sap/base/Log",
    "sap/ui/model/json/JSONModel",
  ],
  function (Controller, Log, JSONModel) {
    "use strict";

    return Controller.extend("com.arvo.resumobalanco.controller.MainView", {
      onInit: function () {
        this._crudId = "ResumobalancoCRUD";
        this._urlAPI = "http://b1.ativy.com:7502/quality/concentrador";

        this.setModel(
          new sap.ui.model.json.JSONModel({
            isTableLoad: true,
            isEdit: false,
          }),
          "crudModel"
        );
        var that = this;

        //this.getView().setModel(this.initData());
        this.initData();

        // this.getOwnerComponent()
        //   .getModel()
        //   .attachRequestCompleted(function (oEvent) {
        //     var model = oEvent.getSource();
        //     console.log(model);
        //   });
      },

      initData: function () {
        var oModel = this.getOwnerComponent().getModel();
        var oCrudModel = this.getView().getModel("crudModel");

        oModel.read("/resumobalanco", {
          urlParameters: {
            $expand: "resumobalanco_empresas",
          },
          success: function (oDataResult) {
            oCrudModel.setProperty(
              "/resumobalancoCollection",
              oDataResult.results
            );
            oCrudModel.setProperty("/isTableLoad", false);
          }.bind(this),
          error: function (error) {
            console.log(error);
          },
        });
      },

      onGrowingStarted: function () {
        //API calls to fetch more data
      },

      getField: function (id) {
        return sap.ui.getCore().byId(`${this._crudId}--${id}`).getValue();
      },

      getFieldSelected: function (id) {
        return sap.ui.getCore().byId(`${this._crudId}--${id}`).getSelectedKey();
      },

      setField: function (id, val) {
        sap.ui.getCore().byId(`${this._crudId}--${id}`).setValue(val);
      },

      setFieldSelected: function (id, val) {
        sap.ui.getCore().byId(`${this._crudId}--${id}`).setSelectedKey(val);
      },

      resetField: function (id) {
        this.setField(id, "");
      },

      resetForm: function () {
        this.resetField("IDEMPRESA");
        this.resetField("DSRESUMOBALANCO");
        this.resetField("DTABERTURA");
        this.resetField("DTFECHAMENTO");
        this.resetField("QTDTOTALITENS");
        this.resetField("QTDTOTALSOBRA");
        this.resetField("QTDTOTALFALTA");
        this.resetField("TXTOBSERVACAO");
        this.resetField("STATIVO");
      },

      onCloseViewDialog: function () {
        this._ResumobalancoCRUD.close();
      },

      onShowFormCreate: function () {
        var oCrudModel = this.getView().getModel("crudModel");
        oCrudModel.setProperty("/isEdit", false);
        if (!this._ResumobalancoCRUD) {
          this._ResumobalancoCRUD = sap.ui.xmlfragment(
            this._crudId,
            "com.arvo.resumobalanco.view.ResumobalancoCRUD",
            this
          );
          this.getView().addDependent(this._ResumobalancoCRUD);
        }
        this.resetForm();
        this._editId = null;
        this._ResumobalancoCRUD.open();
      },

      onShowFormUpdate: function (event) {
        var oCrudModel = this.getView().getModel("crudModel");
        oCrudModel.setProperty("/isEdit", true);
        if (!this._ResumobalancoCRUD) {
          this._ResumobalancoCRUD = sap.ui.xmlfragment(
            this._crudId,
            "com.arvo.resumobalanco.view.ResumobalancoCRUD",
            this
          );
          this.getView().addDependent(this._ResumobalancoCRUD);
        }

        this.resetForm();

        var sPlit = event
          .getSource()
          .oBindingContexts.crudModel.sPath.split("/");
        var sIndex = sPlit[2];
        var oData;

        var entity = event.getSource().oBindingContexts.crudModel.oModel.oData
          .resumobalancoCollection[sIndex];

        // var entity = event.getSource().getBindingContext().getObject();
        this._editId = entity.IDRESUMOBALANCO;

        this.setFieldSelected("IDEMPRESA", entity.IDEMPRESA);
        this.setField("DSRESUMOBALANCO", entity.DSRESUMOBALANCO);
        this.setField("DTABERTURA", entity.DTABERTURA);
        this.setField("DTFECHAMENTO", entity.DTFECHAMENTO);
        this.setField("QTDTOTALITENS", entity.QTDTOTALITENS);
        this.setField("QTDTOTALSOBRA", entity.QTDTOTALSOBRA);
        this.setField("QTDTOTALFALTA", entity.QTDTOTALFALTA);
        this.setField("TXTOBSERVACAO", entity.TXTOBSERVACAO);
        this.setFieldSelected("STATIVO", entity.STATIVO);

        this._ResumobalancoCRUD.open();
      },

      onShowDeleteConfirm: function (event) {
        var entity = event.getSource().getBindingContext().getObject();
        this._editId = entity.IDRESUMOBALANCO;

        sap.m.MessageBox.show(
          `Deseja realmente remover o registro ${this._editId}?`,
          {
            icon: sap.m.MessageBox.Icon.INFORMATION,
            title: "Remover",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction == "YES") {
                this.onDelete();
              }
            }.bind(this),
          }
        );
      },

      onSave: function (event) {
        var oCrudModel = this.getView().getModel("crudModel");
        var isEdit = oCrudModel.getProperty("/isEdit");
        var oModel = this.getOwnerComponent().getModel();
        oModel.setUseBatch(false);

        if (isEdit) {
          var editEntry = {
            IDEMPRESA: this.getFieldSelected("IDEMPRESA"),
            DSRESUMOBALANCO: this.getField("DSRESUMOBALANCO"),
            DTABERTURA: sap.ui
              .getCore()
              .byId("ResumobalancoCRUD--DTABERTURA")
              .getDateValue(),
            QTDTOTALITENS: this.getField("QTDTOTALITENS").replace(/[^\d]/g, ""),
            QTDTOTALSOBRA: this.getField("QTDTOTALSOBRA").replace(/[^\d]/g, ""),
            QTDTOTALFALTA: this.getField("QTDTOTALFALTA").replace(/[^\d]/g, ""),
            TXTOBSERVACAO: this.getField("TXTOBSERVACAO"),
            STATIVO: this.getFieldSelected("STATIVO"),
          };
          oModel.setChangeGroups({
            "/resumobalanco": {
              groupId: "editresumobalanco",
            },
          });

          oModel.update("/resumobalanco(" + this._editId + ")", editEntry, {
            groupId: "editresumobalanco",
          });

          oModel.submitChanges({
            groupId: "editresumobalanco",
            success: function () {
              if (this._ResumobalancoCRUD) {
                this._ResumobalancoCRUD.close();
              }
              sap.m.MessageBox.show("Registro editado com sucesso.", {
                icon: sap.m.MessageBox.Icon.SUCCESS,
                title: "Sucesso",
              });
            },
            error: function () {
              this._ResumobalancoCRUD.close();
              sap.m.MessageBox.show(error, {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error",
              });
            },
          });

          if (this._ResumobalancoCRUD) {
            this._ResumobalancoCRUD.close();
          }
          sap.m.MessageBox.show("Registro editado com sucesso.", {
            icon: sap.m.MessageBox.Icon.SUCCESS,
            title: "Sucesso",
          });
        } else {
          var timestamp = new Date();

          var entry = {
            IDRESUMOBALANCO: timestamp.getMilliseconds().toString(),
            IDEMPRESA: this.getFieldSelected("IDEMPRESA"),
            DSRESUMOBALANCO: this.getField("DSRESUMOBALANCO"),
            DTABERTURA: sap.ui
              .getCore()
              .byId("ResumobalancoCRUD--DTABERTURA")
              .getDateValue(),
            QTDTOTALITENS: this.getField("QTDTOTALITENS").replace(/[^\d]/g, ""),
            QTDTOTALSOBRA: this.getField("QTDTOTALSOBRA").replace(/[^\d]/g, ""),
            QTDTOTALFALTA: this.getField("QTDTOTALFALTA").replace(/[^\d]/g, ""),
            TXTOBSERVACAO: this.getField("TXTOBSERVACAO"),
            STATIVO: this.getFieldSelected("STATIVO"),
          };

          oModel.setUseBatch(false);
          oModel.setChangeGroups({
            "/resumobalanco": {
              groupId: "insertresumobalanco",
            },
          });
          oModel.setDeferredGroups(["insertresumobalanco"]);
          oModel.createEntry("/resumobalanco", {
            properties: entry,
            groupId: "insertresumobalanco",
          });

          oModel.submitChanges({
            groupId: "insertresumobalanco",
            success: function () {
              this._ResumobalancoCRUD.close();
              sap.m.MessageBox.show("Registro criado com sucesso.", {
                icon: sap.m.MessageBox.Icon.SUCCESS,
                title: "Sucesso",
              });
            },
            error: function () {
              this._ResumobalancoCRUD.close();
              sap.m.MessageBox.show(error, {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error",
              });
            },
          });

          this._ResumobalancoCRUD.close();
          sap.m.MessageBox.show("Registro criado com sucesso.", {
            icon: sap.m.MessageBox.Icon.SUCCESS,
            title: "Sucesso",
          });
        }
      },

      onDelete: function (event) {
        $.ajax({
          url:
            this._urlAPI +
            "/api/resumobalanco/resumobalanco.xsjs?IDRESUMOBALANCO=" +
            this._editId,
          type: "DELETE",
          dataType: "json",
          contentType: "application/json",
          success: function (res) {
            sap.m.MessageBox.show("Registro removido com sucesso.", {
              icon: sap.m.MessageBox.Icon.SUCCESS,
              title: "Sucesso",
            });
          },
          error: function (error) {
            sap.m.MessageBox.show("Ocorreu um erro.", {
              icon: sap.m.MessageBox.Icon.ERROR,
              title: "Erro",
            });
          },
        });
      },

      formatDateTime: function (val) {
        if (val) {
          return new Date(val).toLocaleString("pt-BR");
        }
        return "N/A";
      },
      sunTotalItens: function (oData) {
          
        if (oData != undefined) {
          var totalItens = oData.reduce(function (sum, current) {
            return sum + current.QTDTOTALITENS;
          }, 0);
          return totalItens;
        } else {
          null;
        }
      },
      onFilterResumobalanco: function (oEvent) {
        var value = oEvent.getSource().getValue();
        var oCrudModel = this.getView().getModel("crudModel");
        var oModel = this.getOwnerComponent().getModel();
        oCrudModel.setProperty("/isTableLoad", true);
        var aFilters = [];

        aFilters.push(
          new sap.ui.model.Filter({
            path: "DSRESUMOBALANCO",
            operator: sap.ui.model.FilterOperator.Contains,
            value1: value,
          })
        );

        oModel.read("/resumobalanco", {
          filters: aFilters,
          urlParameters: {
            $expand: "resumobalanco_empresas",
          },
          success: function (oDataResult) {
            oCrudModel.setProperty(
              "/resumobalancoCollection",
              oDataResult.results
            );
            oCrudModel.setProperty("/isTableLoad", false);
          }.bind(this),
          error: function (error) {
            console.log(error);
          },
        });
      },
    });
  }
);
