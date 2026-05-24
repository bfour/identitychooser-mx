const EXTENSION_ID = "bordercolors-d@addonsdev.mozilla.org";

export class BorderColorsApi {
  constructor() {

  }

  async getAllColors() {
    let borderColors = null;
    const maxAttempts = 10;
    const retryDelayMs = 100;

    for(let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        let resp = await browser.runtime.sendMessage(EXTENSION_ID,
                                                     {command: "colors.all"});
        if(resp) {
          borderColors = resp;
          break;
        }
      } catch(error) {
        // Border Colors D not installed or not ready yet. Retry a few times
        // to cover startup timing on Betterbird.
      }

      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }

    return borderColors;
  }
}
