import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import * as Keycloak from "keycloak-js";

Vue.config.productionTip = false;
let initOptions = {
  url: "http://localhost:8000/auth",
  realm: "keycloak-demo",
  clientId: "vue-test-app",
  onLoad: "login-required",
};

let keycloak = Keycloak(initOptions);

keycloak
  .init({ onLoad: initOptions.onLoad })
  .then((auth) => {
    if (!auth) {
      window.location.reload();
    } else {
      console.log(auth);
      console.info("Authenticated");
    }

    new Vue({
      router,
      render: (h) => h(App),
    }).$mount("#app");
    console.log(keycloak);

    localStorage.setItem("vue-token", keycloak.token);
    localStorage.setItem("vue-refresh-token", keycloak.refreshToken);

    setInterval(() => {
      keycloak
        .updateToken(70)
        .success((refreshed) => {
          if (refreshed) {
            Vue.$log.debug("Token refreshed" + refreshed);
          } else {
            Vue.$log.warn(
              "Token not refreshed, valid for " +
                Math.round(
                  keycloak.tokenParsed.exp +
                    keycloak.timeSkew -
                    new Date().getTime() / 1000
                ) +
                " seconds"
            );
          }
        })
        .error(() => {
          Vue.$log.error("Failed to refresh token");
        });
    }, 60000);
  })
  .catch((e) => {
    console.log(e);
    console.error("Authenticated Failed");
  });
