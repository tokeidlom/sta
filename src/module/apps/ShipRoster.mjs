const api = foundry.applications.api;

export class ShipRoster extends api.HandlebarsApplicationMixin(api.ApplicationV2) {

  static instance = null;

  static async _onShipRoster(event) {
    event.preventDefault();

Handlebars.registerHelper('if_eq', function(a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

    const staRoll = new STARoll();

    if (!ShipRoster.instance) {
      ShipRoster.instance = new ShipRoster();
    }

    ShipRoster.instance.render(true);
  }

  static DEFAULT_OPTIONS = {
    classes: ["console-container"],

    actions: {
      openActor: ShipRoster._onOpenActor,
      onAttributeTest: ShipRoster._onAttributeTest,
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

  const starships = game.actors.filter(actor => actor.type === "starship");
  const characters = game.actors.filter(actor =>
    actor.type === "character" && actor.system.assignment
  );

  const tabs = starships.map(starship => {
    const assigned = characters.filter(character => {
      const assignment = String(character.system.assignment ?? "").trim().toLowerCase();
      const shipName = String(starship.name ?? "").trim().toLowerCase();
      return assignment === shipName;
    });

    const groups = { character: [], supporting: [], npc: [] };
    for (const actor of assigned) {
      const sheetClass = actor.sheet?.constructor;
      if (sheetClass === game.sta.applications.STANPCSheet2e) {
        groups.npc.push(actor);
      } else if (sheetClass === game.sta.applications.STASupportingSheet2e) {
        groups.supporting.push(actor);
      } else {
        groups.character.push(actor);
      }
    }

    const firstCharacter = groups.character[0];
    const firstSupporting = groups.supporting[0];
    const firstNpc = groups.npc[0];

    const defaultSelectedId = firstCharacter?.id
      ?? firstSupporting?.id
      ?? firstNpc?.id
      ?? null;

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
      totalCount: assigned.length,
      defaultSelectedId, // 👈 pass this to template
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


    const attributes = [
      'control',
      'daring',
      'fitness',
      'insight',
      'presence',
      'reason',
    ];
    const disciplines = [
      'command',
      'conn',
      'engineering',
      'security',
      'medicine',
      'science',
    ];
    const systems = [
      'communications',
      'computers',
      'engines',
      'sensors',
      'structure',
      'weapons',
    ];
    const departments = [
      'command',
      'conn',
      'engineering',
      'security',
      'medicine',
      'science',
    ];
    const rollList = [
      'justrollboth',
      'justrollcrew',
      'melee',
      'ranged',
      'attack',
      'firstaid',
      'direct',
      'guard',
      'sprint',
      'rally',
      'damagecontrol',
      'transport',
      'attackpattern',
      'evasiveaction',
      'maneuver',
      'ram',
      'warp',
      'regainpower',
      'regenerateshields',
      'reveal',
      'scanforweakness',
      'sensorsweep',
      'defensivefire',
      'tractorbeam',
    ];


    const rollPresets = {
      melee: ['daring', 'security', 'none', 'none'],
      ranged: ['control', 'security', 'none', 'none'],
      attack: ['control', 'security', 'weapons', 'security'],
      firstaid: ['daring', 'medicine', 'none', 'none'],
      direct: ['control', 'command', 'none', 'none'],
      guard: ['insight', 'security', 'none', 'none'],
      sprint: ['fitness', 'conn', 'none', 'none'],
      rally: ['presence', 'command', 'none', 'none'],
      damagecontrol: ['presence', 'engineering', 'none', 'none'],
      transport: ['control', 'engineering', 'sensors', 'science'],
      attackpattern: ['control', 'conn', 'engines', 'conn'],
      evasiveaction: ['daring', 'conn', 'structure', 'conn'],
      maneuver: ['control', 'conn', 'engines', 'conn'],
      ram: ['daring', 'conn', 'engines', 'conn'],
      warp: ['control', 'conn', 'engines', 'conn'],
      regainpower: ['control', 'engineering', 'none', 'none'],
      regenerateshields: ['control', 'engineering', 'structure', 'engineering'],
      reveal: ['reason', 'science', 'sensors', 'science'],
      scanforweakness: ['control', 'science', 'sensors', 'security'],
      sensorsweep: ['reason', 'science', 'sensors', 'science'],
      defensivefire: ['daring', 'security', 'weapons', 'security'],
      tractorbeam: ['control', 'security', 'structure', 'security'],
    };

  return {
    ...context,
    tabs,
    activeTab,
    activeActor: activeTab?.actor ?? null,
    attributes,
    disciplines,
    systems,
    departments,
    rollList,
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


static _onAttributeTest (event) {
const selectedRadioId = document.querySelector('input[name="selectedCrewMember"]:checked')?.value;

const optionalIds = Array.from(document.querySelectorAll('input[name="optionalCrewMembers"]:checked'))
  .map(input => input.value);

}

}
