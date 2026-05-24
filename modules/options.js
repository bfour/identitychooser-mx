export class Options {
  constructor() {
    this.cachedIdentitiesKey = 'identityChooserCachedIdentities';
    this.cachedBorderColorsKey = 'identityChooserCachedBorderColors';

    this.defaultOptionKeys = [
      'icEnableComposeMessage',
      'icEnableReplyMessage',
      'icEnableForwardMessage',
      'icEnableDraftMessage',
      'identitiesExtendedProps'
    ];

    this.defaultOptions = {
      icEnableComposeMessage: true,
      icEnableReplyMessage: true,
      icEnableForwardMessage: true,
      icEnableDraftMessage: false
    };
  }

  async setupDefaultOptions() {
    console.debug("Option#setupDefaultOptions -- begin");

    var icOptions = await browser.storage.local.get(this.defaultOptionKeys);
    console.debug('Option#setupDefaultOptions: locally stored options:', icOptions);

    for (const [optionName, defaultValue] of Object.entries(this.defaultOptions)) {
      if (!(optionName in icOptions)) {
        browser.storage.local.set({ [optionName]: defaultValue });
      }
    }

    console.debug("Options#setupDefaultOptions: set extended properties");
    var identitiesProps = {};
    if ('identitiesExtendedProps' in icOptions) {
      identitiesProps = icOptions['identitiesExtendedProps'];
    }

    var newIdentities = {};
    var nextPositionInMenu = Object.entries(identitiesProps).length;
    var accounts = await browser.accounts.list();
    for (const account of accounts) {
      for (const identity of account.identities) {
        if (!(identity.id in identitiesProps)) {
          newIdentities[identity.id] = {
            'showInMenu': true,
            'positionInMenu': nextPositionInMenu++
          };
        }
      }
    }

    if (Object.entries(newIdentities).length > 0) {
      console.debug("Options#setupDefaultOptions: found new identities",
        newIdentities);
      var identitiesProps = { ...identitiesProps, ...newIdentities };
      await browser.storage.local.set(
        { 'identitiesExtendedProps': identitiesProps });

      console.debug("Options#setupDefaultOptions: stored extended properties",
        identitiesProps);
    }

    console.debug("Option#setupDefaultOptions -- end");
  }

  async isEnabledComposeMessage() {
    return this.isEnabledOption("icEnableComposeMessage", true);
  }

  async isEnabledReplyMessage() {
    return this.isEnabledOption("icEnableReplyMessage", true);
  }

  async isEnabledForwardMessage() {
    return this.isEnabledOption("icEnableForwardMessage", true);
  }

  async isEnabledDraftMessage() {
    return this.isEnabledOption("icEnableDraftMessage", false);
  }

  async isEnabledOption(optionKey, defaultValue) {
    var icOptions = await browser.storage.local.get(optionKey);

    var ret = defaultValue;
    if (optionKey in icOptions) {
      ret = icOptions[optionKey];
    }

    return ret;
  }

  async getAllOptions() {
    return browser.storage.local.get();
  }

  async storeOption(o) {
    return browser.storage.local.set(o);
  }

  async getIdentitiesExtendedProps() {
    var props = await browser.storage.local.get('identitiesExtendedProps');

    return props['identitiesExtendedProps'];
  }

  async storeIdentitiesExtendedProps(props) {
    return browser.storage.local.set({ identitiesExtendedProps: props });
  }

  async getCachedIdentities() {
    var cached = await browser.storage.local.get(this.cachedIdentitiesKey);

    if (this.cachedIdentitiesKey in cached) {
      return cached[this.cachedIdentitiesKey];
    }

    return null;
  }

  async storeCachedIdentities(identities) {
    return browser.storage.local.set({ [this.cachedIdentitiesKey]: identities });
  }

  async clearCachedIdentities() {
    return browser.storage.local.remove(this.cachedIdentitiesKey);
  }

  async getCachedBorderColors() {
    var cached = await browser.storage.local.get(this.cachedBorderColorsKey);

    if (this.cachedBorderColorsKey in cached) {
      return cached[this.cachedBorderColorsKey];
    }

    return null;
  }

  async storeCachedBorderColors(borderColors) {
    return browser.storage.local.set({ [this.cachedBorderColorsKey]: borderColors });
  }
}
