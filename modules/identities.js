export class IcIdentities {
  constructor(optionsBackend) {
    this.optionsBackend = optionsBackend;
  }

  async getIdentities() {
    console.debug("IcIdentities#getIdentities -- begin");

    var cachedIdentities = await this.optionsBackend.getCachedIdentities();
    if (this.cachedIdentitiesIncludeAccountIds(cachedIdentities)) {
      console.debug("IcIdentities#getIdentities -- using cached identities", cachedIdentities);
      return cachedIdentities;
    }

    var icIdentities = [];

    var identitiesProps = await this.optionsBackend.getIdentitiesExtendedProps();
    if (!identitiesProps) {
      identitiesProps = {};
    }

    var accounts = await this.loadAccountsWithRetry();
    if (accounts.length == 0) {
      console.debug("IcIdentities#getIdentities -- no accounts available");
      return icIdentities;
    }

    var nextPositionInMenu = Object.entries(identitiesProps).length;
    var identitiesPropsChanged = false;

    for (const account of accounts) {
      for (const identity of account.identities) {
        var props = identitiesProps[identity.id];

        if (!props) {
          props = {
            showInMenu: true,
            positionInMenu: nextPositionInMenu++
          };
          identitiesProps[identity.id] = props;
          identitiesPropsChanged = true;
        }

        // inserting at index props.positionInMenu may create
        // non-continious indices. We'll filter these empty indexes
        // after this for loop.
        icIdentities[props.positionInMenu] = {
          "id": identity.id,
          "accountId": account.id,
          "showInMenu": props.showInMenu,
          "label": this.toIdentityLabel(identity),
          "identity": identity,
        }
      }
    }

    if (identitiesPropsChanged) {
      await this.optionsBackend.storeIdentitiesExtendedProps(identitiesProps);
    }


    icIdentities = icIdentities.filter(function (el) {
      return el != null;
    });

    if (icIdentities.length > 0) {
      await this.optionsBackend.storeCachedIdentities(icIdentities);
    }

    console.debug("IcIdentities#getIdentities -- end", icIdentities);

    return icIdentities;
  }

  cachedIdentitiesIncludeAccountIds(cachedIdentities) {
    if (!Array.isArray(cachedIdentities) || cachedIdentities.length == 0) {
      return false;
    }

    return cachedIdentities.every(identity => "accountId" in identity);
  }

  async loadAccountsWithRetry() {
    const maxAttempts = 10;
    const retryDelayMs = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        let accounts = await browser.accounts.list();
        if (accounts.length > 0) {
          return accounts;
        }
      } catch (error) {
        // Betterbird can expose accounts late during startup. Retry instead of
        // failing the chooser on the first compose window.
      }

      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }

    return await browser.accounts.list();
  }

  toIdentityLabel(mailIdentity) {
    let name = mailIdentity.name;
    let email = mailIdentity.email;
    let idlabel = mailIdentity.label;

    let label;
    if (name != '') {
      label = `${name} <${email}>`;
    } else {
      label = email;
    }
    if (idlabel != '') {
      label = label + " (" + idlabel + ")";
    }

    return label;
  }
}
