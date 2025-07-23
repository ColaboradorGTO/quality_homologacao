sap.ui.define(
  ["com/quality/quality/controller/BaseController"],
  function (Controller) {
    "use strict";

    return Controller.extend(
      "com.quality.quality.controller.autenticacao.Login",
      {
        onLoginTap: function () {
          //Recebe as informações da model oData e das informações em tela
          let oModel = this.getOwnerComponent().getModel();
          let oLoginModel = this.getView().getModel("loginModel");
          oLoginModel.setProperty("/isTableLoad", true);
          let username = this.getView().byId("uid").getValue();
          let password = this.getView().byId("pasw").getValue().toString();

          //Cria password criptografado em SHA256 utilizando lib CryptoJS
          let encrypted = CryptoJS.PBKDF2(
            password,
            this.getOwnerComponent()._oManifest._oManifest["sap.app"].keyWord
          );

          //Cria filtros de usuario e senha
          let aFilters = this.createFilter(username, encrypted.toString());

          //Leitura tabela funcionado com filtros de user e password
          oModel.read("/funcionario", {
            filters: aFilters,
            success: function (oDataResult) {
              //Define tela de carregamento com propriedade 'isTableLoad' true
              oLoginModel.setProperty("/isTableLoad", false);

              //Caso a leitura retorne registros
              if (oDataResult) {
                if (oDataResult.results.length > 0) {
                  //base JWT
                  let tokenJwt = this.base64url(encrypted.toString(), username);
                  //Define a model de login com os dados de usuario
                  oLoginModel.setProperty(
                    "/userCollection",
                    oDataResult.results
                  );

                  //Define tela de carregamento com propriedade 'isTableLoad' false
                  oLoginModel.setProperty("/isTableLoad", false);
                  oLoginModel.setProperty("/errorLogin", false);

                  //Função para armazenar token e data de expiração na tabela hana
                  this.createHanaToken(oModel, tokenJwt);
                } else {
                  //Error handling
                  this.setErrorMessage(oLoginModel);
                }
              } else {
                //Error handling
                this.setErrorMessage(oLoginModel);
              }
            }.bind(this),
            error: function (error) {
              console.log(error);
              sap.m.MessageBox.show(error, {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error",
              });
            },
          });
        },

        base64url: function (pass, user) {
          var date = new Date();
          var expiresIn = date.setHours(date.getHours() + 2);
          const header = {
            alg: "HS256",
            typ: "JWT",
          };

          const payload = {
            user: user,
            password: pass,
            expiresIn: expiresIn,
          };

          var secret = this.getOwnerComponent()._oManifest._oManifest["sap.app"]
            .keySecret;
          const data = payload;
          // encode header
          var stringifiedHeader = CryptoJS.enc.Utf8.parse(
            JSON.stringify(header)
          );
          var encodedHeader = this.base64Source(stringifiedHeader);

          // encode data
          var stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
          var encodedData = this.base64Source(stringifiedData);

          // build token
          var token = encodedHeader + "." + encodedData;

          // sign token
          var signature = CryptoJS.HmacSHA256(token, secret);
          //signature = this.base64Source(signature);
          var signedToken = token + "." + signature;
          localStorage.setItem("access_token", signedToken);
          var resultData = {
            userName: user,
            signedToken: signedToken,
            expiresIn: expiresIn,
          };
          return resultData;
        },

        base64Source: function (source) {
          // Encode in classical base64
          var encodedSource = CryptoJS.enc.Base64.stringify(source);

          // Remove padding equal characters
          encodedSource = encodedSource.replace(/=+$/, "");

          // Replace characters according to base64url specifications
          encodedSource = encodedSource.replace(/\+/g, "-");
          encodedSource = encodedSource.replace(/\//g, "_");

          return encodedSource;
        },

        _onGeralTilePress: function () {
          this.getRouter().navTo("geral");
        },
        _onDashboardTilePress: function () {
          this.getRouter().navTo("dashboard");
        },
        onInit: function () {
          this.setModel(
            new sap.ui.model.json.JSONModel({
              isLoginLoad: true,
              errorLogin: false,
              msgLogin: "",
              isTableLoad: false,
            }),
            "loginModel"
          );
          this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          this.oRouter
            .getTarget("login")
            .attachDisplay(this.handleRouteMatched, this);
        },
        handleRouteMatched: function () {
          //Verifica token ativo
          this.verifyToken().then(
            function (hasToken) {
              if (!hasToken) {
                this.getRouter().navTo("login");
              }
            }.bind(this)
          );
        },
        setErrorMessage: function (oLoginModel) {
          oLoginModel.setProperty("/msgLogin", "Usuário e/ou senha inválidos.");
          oLoginModel.setProperty("/errorLogin", true);
        },
        createFilter: function (user, pass) {
          let aFilters = [];
          aFilters.push(
            new sap.ui.model.Filter({
              path: "NOLOGIN",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: user,
            })
          );
          aFilters.push(
            new sap.ui.model.Filter({
              path: "SENHAHASH",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: pass,
            })
          );

          return aFilters;
        },
        createHanaToken: function (oModel, tokenJwt) {
          var timestamp = new Date();

          var entry = {
            IDTOKEN: timestamp.getMilliseconds().toString(),
            IDUSUARIO: 6,
            TOKENJWT: tokenJwt.signedToken,
            DATAEXPIRACAO: tokenJwt.expiresIn.toString(),
          };

          oModel.createEntry("/tokenjwt", {
            properties: entry,
            success: function () {
              this.getRouter().navTo("modulos");
            },
            error: function () {
              sap.m.MessageBox.show(error, {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error",
              });
            },
          });

          oModel.submitChanges({
            success: function () {
              console.log("1");
            },
            error: function () {
              console.log("2");
            },
          });
        },
      }
    );
  }
);
