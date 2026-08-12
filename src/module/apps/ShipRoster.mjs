const api = foundry.applications.api;

export class ShipRoster extends api.HandlebarsApplicationMixin(api.ApplicationV2) {

  static instance = null;

  static async _onShipRoster(event) {
    event.preventDefault();

    if (!ShipRoster.instance) {
      ShipRoster.instance = new ShipRoster();
    }

    ShipRoster.instance.render(true);
  }

  static DEFAULT_OPTIONS = {
    classes: ["console-container"],

    actions: {
      openActor: ShipRoster._onOpenActor,
    },

    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },

    window: {
      frame: true,
      positioned: true,
      title: 'A thing I want',
      width: 'auto',
      height: 'auto'
    }
  };

  static PARTS = {
    tracker: {
      template: "systems/sta/templates/apps/ship-roster.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    const starships = game.actors
      .filter(actor => actor.type === "starship");

    const characters = game.actors
      .filter(actor => {
        return actor.type === "character"
          && actor.system.assignment;
      });

    const tabs = starships.map(starship => {

      const assigned = characters.filter(character => {
        const assignment = String(character.system.assignment ?? "")
          .trim().toLowerCase();

        const shipName = String(starship.name ?? "")
          .trim().toLowerCase();

        return assignment === shipName;
      });

      const groups = {
        character: [],
        supporting: [],
        npc: []
      };

      for (const actor of assigned) {
        const sheetClass = actor.sheet?.constructor;

        if (sheetClass === game.sta.applications.STANPCSheet2e) {
          groups.npc.push(actor);
        }
        else if (sheetClass === game.sta.applications.STASupportingSheet2e) {
          groups.supporting.push(actor);
        }
        else {
          groups.character.push(actor);
        }
      }

      return {
        id: starship.id,
        name: starship.name,
        actor: starship,
        img: starship.img,
        active: false,
        groups,
        characterCount: groups.character.length,
        supportingCount: groups.supporting.length,
        npcCount: groups.npc.length,
        totalCount: assigned.length
      };
    });

    tabs.sort((a, b) => b.totalCount - a.totalCount);

    if (!this.tabGroups.primary && tabs.length > 0) {
      this.tabGroups.primary = tabs[0].id;
    }

    for (const tab of tabs) {
      tab.active = tab.id === this.tabGroups.primary;
    }

    const activeTab = tabs.find(tab => tab.id === this.tabGroups.primary);

    return {
      ...context,
      tabs,
      activeTab,
      activeActor: activeTab?.actor ?? null
    };
  }

  static _onOpenActor(event, target) {
    event.preventDefault();
    const actorId = target.dataset.actorId;
    if (!actorId) return;
    const actor = game.actors.get(actorId);
    if (!actor) {
      console.warn(`STA Console | Could not find Actor ${actorId}`);
      return;
    }

    actor.sheet?.render(true);
  }
}
