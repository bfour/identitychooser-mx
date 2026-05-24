import { Options } from '../modules/options.js';
import { IcIdentities } from '../modules/identities.js';
import { BorderColorsApi } from '../modules/bordercolorsapi.js';

class IdentitiesPopup {
  constructor() {
  }

  async run(e) {
    await this.localizePage();

    let options = new Options();

    let icIdentities = new IcIdentities(options);

    let identities = await icIdentities.getIdentities();
    let identitiesList = document.getElementById("icIdentityList");

    let borderColorsApi = new BorderColorsApi();
    let borderColorsPromise = borderColorsApi.getAllColors();

    for (const identity of identities) {
      if (identity.showInMenu) {
        let li = document.createElement("li");
        let button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("data", identity.id);
        button.addEventListener("click", this.identityButtonClicked);

        let dotEl = document.createElement("span");
        dotEl.classList.add("border-color");
        button.appendChild(dotEl);

        let textEl = document.createElement("span");
        textEl.textContent = identity.label;
        button.appendChild(textEl);

        li.appendChild(button);
        identitiesList.appendChild(li);
      }
    }

    borderColorsPromise.then(borderColors => {
      if (borderColors != null) {
        this.applyBorderColors(identitiesList, identities, borderColors);
      }
    }).catch(() => {
      // Ignore color lookup failures; the chooser still works without them.
    });

    let cancelBtn = document.getElementById("cancel");
    cancelBtn.setAttribute("data", "cancel");
    cancelBtn.addEventListener("click", this.identityButtonClicked);
  }

  applyBorderColors(identitiesList, identities, borderColors) {
    for (const identity of identities) {
      if (!identity.showInMenu) {
        continue;
      }

      let button = identitiesList.querySelector(`button[data="${identity.id}"]`);
      if (!button) {
        continue;
      }

      let color = null;
      if (identity.accountId && identity.accountId in borderColors) {
        color = borderColors[identity.accountId];
      } else if (identity.id in borderColors) {
        color = borderColors[identity.id];
      }

      if (color !== null && color !== undefined && color !== "") {
        button.style.setProperty("--bullet-color", color);
      }
    }
  }

  async identityButtonClicked(event) {
    await messenger.runtime.sendMessage({
      popupResponse: event.target.closest("button").getAttribute("data")
    });

    window.close();
  }

  async localizePage() {
    console.debug("Popup#localizePage -- start");

    for (let el of document.querySelectorAll("[data-l10n-id]")) {
      let id = el.getAttribute("data-l10n-id");
      let i18nMessage = browser.i18n.getMessage(id);
      if (i18nMessage == "") {
        i18nMessage = id;
      }
      el.textContent = i18nMessage;
    }

    for (let el of document.querySelectorAll("[data-html-l10n-id]")) {
      let id = el.getAttribute("data-html-l10n-id");
      let i18nMessage = browser.i18n.getMessage(id);
      if (i18nMessage == "") {
        i18nMessage = id;
      }
      el.insertAdjacentHTML('afterbegin', i18nMessage);
    }

    console.debug("Popup#localizePage -- end");
  }
}

var identitiesPopup = new IdentitiesPopup();
document.addEventListener("DOMContentLoaded", (e) => identitiesPopup.run(e), { once: true });
