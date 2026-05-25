var betterbirdColors = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      betterbirdColors: {
        async getComposeColors(composeTabId) {
          try {
            let tabObject = context.extension.tabManager.get(composeTabId);
            let composeWindow = tabObject.window;
            let composeDocument = composeWindow.document;
            let colors = {};

            for (const item of composeDocument.querySelectorAll("[accountkey]")) {
              let identityKey = item.getAttribute("identitykey");
              let accountKey = item.getAttribute("accountkey");
              if (!identityKey && !accountKey) {
                continue;
              }

              let color = item.style.backgroundColor ||
                composeWindow.getComputedStyle(item).backgroundColor ||
                item.style.getPropertyValue("--icon-color") ||
                composeWindow.getComputedStyle(item).getPropertyValue("--icon-color");

              if (color) {
                color = color.trim();
              }

              if (!color) {
                continue;
              }

              if (identityKey) {
                colors[identityKey] = color;
              }

              if (accountKey) {
                colors[accountKey] = color;
              }
            }

            return colors;
          } catch (error) {
            return {};
          }
        },
      },
    };
  }
};