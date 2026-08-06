const api = foundry.applications.api;

export class STAConsole extends api.HandlebarsApplicationMixin(api.ApplicationV2) {

  static instance = null;

  /* Load the STA Console */
  static async _onConsole(event) {
    event.preventDefault();

    if (!STAConsole.instance) {
      STAConsole.instance = new STAConsole();
    }

    STAConsole.instance.render(true);
  }

  static DEFAULT_OPTIONS = {
    classes: ['console-container'],
    actions: {

    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    },
    window: {
      frame: true,
      positioned: true
    },
  };

  static PARTS = {
    tracker: {
      template: 'systems/sta/templates/apps/console.hbs'
    },
  };

  async _prepareContext(options) {
    const context = {
      tabGroups: this.tabGroups,
      tabs: this.getTabs(),
    }
    return context
    };

  getTabs() {
    const tabGroup = 'primary';
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'crew';
    const tabs = {
      crew: {
        id: 'crew',
        group: tabGroup,
      },
      ships: {
        id: 'ships',
        group: tabGroup,
      },
      development: {
        id: 'development',
        group: tabGroup,
      },
      notes: {
        id: 'notes',
        group: tabGroup,
      }
    };
    for (const tab in tabs) {
      if (this.tabGroups[tabGroup] === tabs[tab].id) {
        tabs[tab].cssClass = 'active';
        tabs[tab].active = true;
      }
    }
    return tabs;
  }
}
