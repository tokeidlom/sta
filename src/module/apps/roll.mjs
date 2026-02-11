const api = foundry.applications.api;

export class STARoll {
  // #########################################################
  // #                                                       #
  // #                    Task Rolls                         #
  // #                                                       #
  // #########################################################

  //Perform a normal Task Roll
  async rollTask(taskData) {
    const taskRollData = await this._performRollTask(taskData);
    taskData = { ...taskData, ...taskRollData };

    const taskResult = await this._taskResult(taskData);
    taskData = { ...taskData, ...taskResult };

    const taskResultText = await this._taskResultText(taskData);
    taskData = { ...taskData, ...taskResultText, rollType: 'task' };

    this.sendToChat(taskData);
  }
  
  //Task roll from the NPC Roller
  async rollNPCTask(taskData) {
    let crewRolltype = '';
    let shipRolltype = '';

    if (taskData.speakerName === 'NPC Crew') {
      crewRolltype = 'npccrew';
    } else {
      crewRolltype = 'character2e';
    }

    if (taskData.starshipName === 'NPC Ship') {
      shipRolltype = 'npcship';
    } else {
      shipRolltype = 'starshipassist';
    }

    let crewData = {
      speakerName: taskData.speakerName,
      selectedAttribute: taskData.selectedAttribute,
      selectedAttributeValue: taskData.selectedAttributeValue,
      selectedDiscipline: taskData.selectedDiscipline,
      selectedDisciplineValue: taskData.selectedDisciplineValue,
      rolltype: crewRolltype,
      dicePool: taskData.dicePool,
      usingFocus: taskData.usingFocus,
      usingDedicatedFocus: taskData.usingDedicatedFocus,
      usingDetermination: taskData.usingDetermination,
      complicationRange: taskData.complicationRange,
      skillLevel: taskData.skillLevel,
      selectedSystemValue: 0,
      selectedDepartmentValue: 0,
    };

    const crewtaskRollData = await this._performRollTask(crewData);
    crewData = { ...crewData, ...crewtaskRollData };

    const crewtaskResult = await this._taskResult(crewData);
    crewData = { ...crewData, ...crewtaskResult };

    let shipData = '';
    let crewshipData = '';

    if (taskData.selectedSystem === 'none') {
      const crewtaskResultText = await this._taskResultText(crewData);
      crewshipData = { ...crewData, ...crewtaskResultText, rollType: 'task' };

    } else {
      shipData = {
        speakerName: taskData.starshipName,
        selectedSystem: taskData.selectedSystem,
        selectedSystemValue: taskData.selectedSystemValue,
        selectedDepartment: taskData.selectedDepartment,
        selectedDepartmentValue: taskData.selectedDepartmentValue,
        rolltype: shipRolltype,
        complicationRange: taskData.complicationRange,
        dicePool: 1,
        usingFocus: true,
        selectedAttributeValue: 0,
        selectedDisciplineValue: 0,
      };

      const shiptaskRollData = await this._performRollTask(shipData);
      shipData = { ...shipData, ...shiptaskRollData };

      const shiptaskResult = await this._taskResult(shipData);
      shipData = { ...shipData, ...shiptaskResult };

      crewshipData = {
        ...taskData,
        diceStringcrew: crewData.diceString,
        diceStringship: shipData.diceString,
        diceOutcome: [...crewData.diceOutcome, ...shipData.diceOutcome || []],
        success: crewData.success + shipData.success,
        checkTargetcrew: crewData.checkTarget,
        checkTargetship: shipData.checkTarget,
        doubleDiscipline: crewData.doubleDiscipline,
        complicationMinimumValue: crewData.complicationMinimumValue,
        withDetermination: crewData.withDetermination,
        withFocus: crewData.withFocus,
        withDedicatedFocus: crewData.withDedicatedFocus,
        flavorcrew: crewData.flavor,
        flavorship: shipData.flavor,
        complication: crewData.complication + shipData.complication,
        successText: crewData.successText + shipData.successText,
        complicationText: crewData.complicationText + shipData.complicationText,
      };

      const crewshiptaskResultText = await this._taskResultText(crewshipData);
      crewshipData = { ...crewshipData, ...crewshiptaskResultText, rollType: 'npc', };
    }

      this.sendToChat(crewshipData);
  }

  async _performRollTask(taskData) {
    // Calculate how many dice to roll
    let diceToRoll = taskData.dicePool;
    if (taskData.usingDetermination && taskData.rolltype !== 'character1e') {
      diceToRoll = taskData.dicePool - 1;
    }

    // Do the roll
    const taskRolled = await new Roll(diceToRoll + 'd20').evaluate({});

    return { diceToRoll, taskRolled };
  }

  // Assemble the result strings for the chat card
  async _taskResult(taskData) {
    const checkTarget =
      taskData.selectedAttributeValue +
      taskData.selectedDisciplineValue +
      taskData.selectedSystemValue +
      taskData.selectedDepartmentValue;
    const complicationMinimumValue = 21 - taskData.complicationRange;

    if (taskData.useReputationInstead) {
      taskData.selectedDiscipline = 'reputation';
      taskData.selectedDisciplineValue = taskData.reputationValue;
    }

    const doubleDiscipline =
      taskData.selectedDisciplineValue + taskData.selectedDisciplineValue;
    let diceString = '';
    let diceOutcome = [];
    let success = 0;
    let complication = 0;
    let i;
    let result = 0;

    // Work out the number of successes and complications
    for (i = 0; i < taskData.diceToRoll; i++) {
      result = taskData.taskRolled.terms[0].results[i].result;

      // If using focus and the result is less than or equal to the discipline, that counts as 2 successes and we want to show the dice as green.
      if (
        (taskData.usingFocus &&
          result <=
            taskData.selectedDisciplineValue + taskData.selectedDepartmentValue) ||
        result === 1
      ) {
        diceString += `<li class="roll die d20 max">${result}</li>`;
        diceOutcome.push(result);
        success += 2;
      // If using dedicated focus and the result is less than or equal to double the discipline, that counts as 2 successes and we want to show the dice as green.
      } else if (
        (taskData.usingDedicatedFocus &&
          result <= doubleDiscipline) ||
        result === 1
      ) {
        diceString += `<li class="roll die d20 max">${result}</li>`;
        diceOutcome.push(result);
        success += 2;
      // If the result is less than or equal to the target (the discipline and attribute added together), that counts as 1 success but we want to show the dice as normal.
      } else if (result <= checkTarget) {
        diceString += `<li class="roll die d20">${result}</li>`;
        diceOutcome.push(result);
        success += 1;
      // If the result is greater than or equal to the complication range, then we want to count it as a complication. We also want to show it as red!
      } else if (result >= complicationMinimumValue) {
        diceString += `<li class="roll die d20 min">${result}</li>`;
        diceOutcome.push(result);
        complication += 1;
      // If none of the above is true, the dice failed to do anything and is treated as normal.
      } else {
        diceString += `<li class="roll die d20">${result}</li>`;
        diceOutcome.push(result);
      }
    }
    if (taskData.usingDetermination) {
      diceString += `<li class="roll die d20 max">1</li>`;
      diceOutcome.push(1);
      success += 2;
    }

    // Add information about what was rolled
    let bonuses = [];
    if (taskData.usingFocus) {
      bonuses.push(game.i18n.format('sta.actor.belonging.focus.title'));
    }
    if (taskData.usingDedicatedFocus) {
      bonuses.push(game.i18n.format('sta.roll.dedicatedfocus'));
    }
    if (taskData.usingDetermination) {
      bonuses.push(game.i18n.format('sta.actor.character.determination'));
    }

    let rollDetails = bonuses.join(', ');

    // Add flavor for the roll card
    let flavor = '';
    switch (taskData.rolltype) {
      case 'character2e':
      case 'character1e':
        flavor =
          `${game.i18n.format(`sta.actor.character.attribute.${taskData.selectedAttribute}`)} ` +
          `${game.i18n.format(`sta.actor.character.discipline.${taskData.selectedDiscipline}`)}`;
        break;
      case 'starship':
        flavor =
          `${game.i18n.format(`sta.actor.starship.system.${taskData.selectedSystem}`)} ` +
          `${game.i18n.format(`sta.actor.starship.department.${taskData.selectedDepartment}`)} ` +
          `${game.i18n.format('sta.roll.task.name')}`;
        break;
      case 'starshipassist':
        flavor =
          `${game.i18n.format(`sta.actor.starship.system.${taskData.selectedSystem}`)} ` +
          `${game.i18n.format(`sta.actor.starship.department.${taskData.selectedDepartment}`)} ` +
          `${game.i18n.format('sta.roll.npcshipassist')}`;
        break;
        case 'sidebar':
        flavor = game.i18n.format('sta.roll.task.name');
        break;
      case 'npccrew':
        flavor = `${game.i18n.format(`sta.roll.npccrew${taskData.skillLevel}`)} ${game.i18n.format('sta.roll.task.name')}`;
        break;
      case 'npcship':
        flavor = `${game.i18n.format('sta.roll.npcshipassist')}`;
        break;
      case 'reroll':
        flavor = `${game.i18n.format('sta.roll.rerollresults')} ${speaker.id} ${game.i18n.format('sta.roll.task.name')}`;
        break;
    }

    return {
      diceString,
      diceOutcome,
      success,
      complication,
      flavor,
      checkTarget,
      complicationMinimumValue,
      rollDetails,
    };
  }

  async _taskResultText(taskData) {
    // Here we want to check if the success was exactly one (as "1 Successes" doesn't make grammatical sense). We create a string for the Successes.
    let successText = '';
    if (taskData.success === 1) {
      successText = `${taskData.success} ${game.i18n.format('sta.roll.success')}`;
    } else {
      successText = `${taskData.success} ${game.i18n.format('sta.roll.successPlural')}`;
    }

    let complicationText = '';
    if (taskData.complication === 1) {
      complicationText = `1 ${game.i18n.format('sta.roll.complication')}`;
    } else if (taskData.complication > 1) {
      complicationText = `${taskData.complication} ${game.i18n.format('sta.roll.complicationPlural')}`;
    }

    return { successText, complicationText };
  }

  // Get the complication range from scenetraits
  async _sceneComplications() {
    const i18nKey = 'sta.roll.complicationroller';
    let localizedLabel = game.i18n.localize(i18nKey)?.trim();
    if (!localizedLabel || localizedLabel === i18nKey) localizedLabel = 'Complication Range';

    const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const labelPattern = escRe(localizedLabel).replace(/\s+/g, '\\s*');
    const compRx = new RegExp(`${labelPattern}\\s*\\+\\s*(\\d+)`, 'i');

    const sceneComplicationBonus = (() => {
      try {
        const scene = game.scenes?.active;
        if (!scene) return 0;
        let bonus = 0;
        const tokens = scene.tokens?.contents ?? scene.tokens ?? [];
        for (const tok of tokens) {
          const actor = tok?.actor;
          if (!actor || actor.type !== 'scenetraits') continue;
          for (const item of actor.items ?? []) {
            const m = compRx.exec(item.name ?? '');
            if (m) bonus += Number(m[1]) || 0;
          }
        }
        return bonus;
      } catch (err) {
        console.error('Scene complication bonus error:', err);
        return 0;
      }
    })();

    const calculatedComplicationRange = Math.min(5, Math.max(1, 1 + sceneComplicationBonus));
    return calculatedComplicationRange;
  }

  // #########################################################
  // #                                                       #
  // #                 Challenge Rolls                       #
  // #                                                       #
  // #########################################################

  //Perform a normal Challenge Roll
  async performChallengeRoll(challengeData) {
    const rolledChallenge = await new Roll(challengeData.dicePool + 'd6').evaluate({});
    const getSuccessesEffects = await this._getSuccessesEffects(rolledChallenge);
    const diceString = await this._getDiceImageListFromChallengeRoll(rolledChallenge);
    const flavor = `${challengeData.challengeName} ${game.i18n.format('sta.roll.challenge.name')}`;

    challengeData = { ...challengeData, ...getSuccessesEffects, diceString, flavor, rollType: 'challenge' };

    this.sendToChat(challengeData);
  }

  /* Creates an HTML list of die face images from the results of a challenge roll */
  async _getDiceImageListFromChallengeRoll(rolledChallenge) {
    const diceFaceTable = [
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success1_small.png" /></li>',
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success2_small.png" /></li>',
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success0_small.png" /></li>',
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success0_small.png" /></li>',
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Effect_small.png" /></li>',
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Effect_small.png" /></li>',
    ];

    const diceString = rolledChallenge.terms[0].results
      .map((die) => die.result)
      .map((result) => diceFaceTable[result - 1])
      .join(' ');

    return diceString;
  }

  /* Returns the number of successes in a d6 challenge die roll */
  async _getSuccessesEffects(rolledChallenge) {
    let successes = 0;
    let effects = 0;
    const diceOutcome = [];
    const dice = rolledChallenge.terms[0].results.map((die) => die.result);

    for (const die of dice) {
      switch (die) {
        case 1:
          successes += 1;
          diceOutcome.push(1);
          break;
        case 2:
          successes += 2;
          diceOutcome.push(2);
          break;
        case 3:
          diceOutcome.push(3);
          break;
        case 4:
          diceOutcome.push(4);
          break;
        case 5:
          successes += 1;
          effects += 1;
          diceOutcome.push(5);
          break;
        case 6:
          successes += 1;
          effects += 1;
          diceOutcome.push(6);
          break;
        default:
          break;
      }
    }

    let successText = '';
    if (successes === 1) {
      successText = `${successes} ${game.i18n.format('sta.roll.success')}`;
    } else {
      successText = `${successes} ${game.i18n.format('sta.roll.successPlural')}`;
    }

    let effectText = '';
    if (effects === 1) {
      effectText = `${effects} ${game.i18n.format('sta.roll.effect')}`;
    } else {
      effectText = `${effects} ${game.i18n.format('sta.roll.effectPlural')}`;
    }

    return { successes, effects, successText, effectText };
  }

  // #########################################################
  // #                                                       #
  // #                Item Rolls (not weapons)               #
  // #                                                       #
  // #########################################################

  async performItemRoll(item, speaker) {

    const variablePrompt = game.i18n.format('sta.roll.item.quantity');
    const variable = `<div class='dice-formula'> ` + variablePrompt.replace('|#|', item.system.quantity) + `</div>`;

    const itemData = {
      speakerName: speaker.name,
      img: item.img,
      type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
      name: item.name,
      descFieldHtml: item.system.description ? item.system.description : '',
      varFieldHtml: variable,
      rollType: 'item',
    };

    this.sendToChat(itemData);
  }

  async performTalentRoll(item, speaker) {
    const itemData = {
      speakerName: speaker.name,
      img: item.img,
      type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
      name: item.name,
      descFieldHtml: item.system.description ? item.system.description : '',
      rollType: 'item',
    };
    this.sendToChat(itemData);
  }

  async performFocusRoll(item, speaker) {
    const itemData = {
      speakerName: speaker.name,
      img: item.img,
      type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
      name: item.name,
      descFieldHtml: item.system.description ? item.system.description : '',
      rollType: 'item',
    };
    this.sendToChat(itemData);
  }

  async performValueRoll(item, speaker) {
    const itemData = {
      speakerName: speaker.name,
      img: item.img,
      type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
      name: item.name,
      descFieldHtml: item.system.description ? item.system.description : '',
      rollType: 'item',
    };
    this.sendToChat(itemData);
  }

  async performInjuryRoll(item, speaker) {
    const itemData = {
      speakerName: speaker.name,
      img: item.img,
      type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
      name: item.name,
      descFieldHtml: item.system.description ? item.system.description : '',
      rollType: 'item',
    };
    this.sendToChat(itemData);
  }

  async performTraitRoll(item, speaker) {
    const itemData = {
      speakerName: speaker.name,
      img: item.img,
      type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
      name: item.name,
      descFieldHtml: item.system.description ? item.system.description : '',
      rollType: 'item',
    };
    this.sendToChat(itemData);
  }

  async performMilestoneRoll(item, speaker) {
    const itemData = {
      speakerName: speaker.name,
      img: item.img,
      type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
      name: item.name,
      descFieldHtml: item.system.description ? item.system.description : '',
      rollType: 'item',
    };
    this.sendToChat(itemData);
  }

  async performLogRoll(item, speaker) {
    const itemData = {
      speakerName: speaker.name,
      img: item.img,
      type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
      name: item.name,
      descFieldHtml: item.system.description ? item.system.description : '',
      rollType: 'item',
    };
    this.sendToChat(itemData);
  }

  //Handle cases where (xCD) has been written into an item description causing it to be handled as a weapon instead of an item
  static async _onItemtoWeapon(item, speaker) {
    const regex = /\((.cd)\)/i;
    const match = item.system.description.toLowerCase().match(regex);
    let challengeDice = 1; // Default value
    
    if (match) {
      const x = match[1][0];
        
      if (x === 'x') {
        const defaultValue = 1;
        const template = 'systems/sta/templates/apps/dicepool-challenge.hbs';
        const html = await foundry.applications.handlebars.renderTemplate(template, {
          defaultValue
        });
        const formData = await api.DialogV2.wait({
          window: {title: game.i18n.localize('sta.apps.dicepoolwindow')},
          position: {height: 'auto', width: 350},
          content: html,
          classes: ['dialogue'],
          buttons: [{
            action: 'roll',
            default: true,
            label: game.i18n.localize('sta.apps.rolldice'),
            callback: (event, button, dialog) => {
              const challengeDiceInput = dialog.element.querySelector('#dicePoolValue');
              return {
                challengeDice: challengeDiceInput?.valueAsNumber || 1
              };
            }
          }],
          close: () => null
        });

        challengeDice = formData.challengeDice;
      } else if (!isNaN(x) && x >= '0' && x <= '9') {
        // Set challengedice to the number
        challengeDice = parseInt(x);
        console.log('Challengedice set to:', challengeDice);
      }
    }

    const itemData = { 
      name: item.name,
      img: item.img,
      type: item.type,
      system: {
        includescale: false,
        damage: challengeDice,
        description: item.system?.description || '',
      },
    };
    itemData.toObject = () => foundry.utils.deepClone(itemData);  

    const newactor = {
      name: speaker.name,
      system: {disciplines: {security: {value: 0}}},
    };

    const staRoll = new STARoll();
    this.performWeaponRoll(itemData, newactor);
  }

  // #########################################################
  // #                                                       #
  // #                   Weapon Rolls                        #
  // #                                                       #
  // #########################################################

async performWeaponRoll2e(item, speaker) {

  const variablePrompt = game.i18n.format('sta.roll.weapon.damage2e');
  const variable = `<div class="dice-formula">
                      ${variablePrompt.replace('|#|', item.system.damage)}
                    </div>`;

  const LABELS = Object.freeze({
    accurate: 'sta.actor.belonging.weapon.accurate',
    area: 'sta.actor.belonging.weapon.area',
    charge: 'sta.actor.belonging.weapon.charge',
    cumbersome: 'sta.actor.belonging.weapon.cumbersome',
    debilitating: 'sta.actor.belonging.weapon.debilitating',
    grenade: 'sta.actor.belonging.weapon.grenade',
    inaccurate: 'sta.actor.belonging.weapon.inaccurate',
    intense: 'sta.actor.belonging.weapon.intense',
    piercingx: 'sta.actor.belonging.weapon.piercingx',
    hiddenx: 'sta.actor.belonging.weapon.hiddenx',
    stun: 'sta.actor.belonging.weapon.stun',
    deadly: 'sta.actor.belonging.weapon.deadly',
  });

  const TOOLTIP_TEXT = Object.freeze({
    accurate: game.i18n.localize('sta.tooltip.character.weapon.accurate'),
    area: game.i18n.localize('sta.tooltip.character.weapon.area'),
    charge: game.i18n.localize('sta.tooltip.character.weapon.charge'),
    cumbersome: game.i18n.localize('sta.tooltip.character.weapon.cumbersome'),
    debilitating: game.i18n.localize('sta.tooltip.character.weapon.debilitating'),
    grenade: game.i18n.localize('sta.tooltip.character.weapon.grenade'),
    inaccurate: game.i18n.localize('sta.tooltip.character.weapon.inaccurate'),
    intense: game.i18n.localize('sta.tooltip.character.weapon.intense'),
    piercingx: game.i18n.localize('sta.tooltip.character.weapon.piercingx'),
    hiddenx: game.i18n.localize('sta.tooltip.character.weapon.hiddenx'),
  });

  const tags = [];

  for (const [prop, rawValue] of Object.entries(item.system.qualities)) {
    if (rawValue === undefined || rawValue === null || rawValue === '') continue;
    if (!Object.prototype.hasOwnProperty.call(LABELS, prop)) continue;
    const label = game.i18n.localize(LABELS[prop]);
    const display = Number.isFinite(rawValue) ? `${label} ${rawValue}` : label;
    const tip = TOOLTIP_TEXT[prop] ?? '';
    tags.push({ label: display, tooltip: tip });
  }

  const itemData = {
    speakerName: speaker.alias ?? speaker.name,
    img: item.img,
    type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
    name: item.name,
    descFieldHtml: item.system.description ?? '',
    rollType: 'item',
    varFieldHtml: variable,
    tags,
    range: game.i18n.localize(`sta.roll.${item.system.range}`),
    weapontype: item.system.hands + ' ' + game.i18n.localize(`sta.item.genericitem.handed`),
  };

    this.sendToChat(itemData);
}

  async performStarshipWeaponRoll2e(item, speaker) {
    let actorWeapons = 0;
    if (speaker.system.systems.weapons.value > 6) actorWeapons = 1;
    if (speaker.system.systems.weapons.value > 8) actorWeapons = 2;
    if (speaker.system.systems.weapons.value > 10) actorWeapons = 3;
    if (speaker.system.systems.weapons.value > 12) actorWeapons = 4;
    let scaleDamage = 0;
    if (item.system.includescale == 'energy') scaleDamage = parseInt(speaker.system.scale);
    const calculatedDamage = item.system.damage + actorWeapons + scaleDamage;
    const variablePrompt = game.i18n.format('sta.roll.weapon.damage2e');
    const variable = `<div class='dice-formula'> ` + variablePrompt.replace('|#|', calculatedDamage) + `</div>`;

    const LABELS = Object.freeze({
      area: 'sta.actor.belonging.weapon.area',
      calibration: 'sta.actor.belonging.weapon.calibration',
      cumbersome: 'sta.actor.belonging.weapon.cumbersome',
      dampening: 'sta.actor.belonging.weapon.dampening',
      depleting: 'sta.actor.belonging.weapon.depleting',
      devastating: 'sta.actor.belonging.weapon.devastating',
      highyield: 'sta.actor.belonging.weapon.highyield',
      intense: 'sta.actor.belonging.weapon.intense',
      jamming: 'sta.actor.belonging.weapon.jamming',
persistent: 'sta.actor.belonging.weapon.persistent',
      piercing: 'sta.actor.belonging.weapon.piercingx',
      slowing: 'sta.actor.belonging.weapon.slowing',
      spread: 'sta.actor.belonging.weapon.spread',
      hiddenx: 'sta.actor.belonging.weapon.hiddenx',
      versatilex: 'sta.actor.belonging.weapon.versatilex',
    });

  const TOOLTIP_TEXT = Object.freeze({
      area: game.i18n.localize('sta.tooltip.starship.weapon.area'),
      calibration: game.i18n.localize('sta.tooltip.starship.weapon.calibration'),
      cumbersome: game.i18n.localize('sta.tooltip.starship.weapon.cumbersome'),
      dampening: game.i18n.localize('sta.tooltip.starship.weapon.dampening'),
      depleting: game.i18n.localize('sta.tooltip.starship.weapon.depleting'),
      devastating: game.i18n.localize('sta.tooltip.starship.weapon.devastating'),
      highyield: game.i18n.localize('sta.tooltip.starship.weapon.highyield'),
      intense: game.i18n.localize('sta.tooltip.starship.weapon.intense'),
      jamming: game.i18n.localize('sta.tooltip.starship.weapon.jamming'),
persistent: 'sta.actor.belonging.weapon.persistent',
      piercing: game.i18n.localize('sta.tooltip.starship.weapon.piercing'),
      slowing: game.i18n.localize('sta.tooltip.starship.weapon.slowing'),
      spread: game.i18n.localize('sta.tooltip.starship.weapon.spread'),
      hiddenx: game.i18n.localize('sta.tooltip.starship.weapon.hiddenx'),
      versatilex: game.i18n.localize('sta.tooltip.starship.weapon.versatilex'),
    });

  const tags = [];

  for (const [prop, rawValue] of Object.entries(item.system.qualities)) {
    if (rawValue === undefined || rawValue === null || rawValue === '') continue;
    if (!Object.prototype.hasOwnProperty.call(LABELS, prop)) continue;
    const label = game.i18n.localize(LABELS[prop]);
    const display = Number.isFinite(rawValue) ? `${label} ${rawValue}` : label;
    const tip = TOOLTIP_TEXT[prop] ?? '';
    tags.push({ label: display, tooltip: tip });
  }

  const itemData = {
    speakerName: speaker.alias ?? speaker.name,
    img: item.img,
    type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
    name: item.name,
    descFieldHtml: item.system.description ?? '',
    rollType: 'item',
    varFieldHtml: variable,
    tags,
    range: game.i18n.localize(`sta.actor.belonging.weapon.${item.system.range}`),
    weapontype: game.i18n.localize(`sta.actor.belonging.weapon.${item.system.includescale}`),
  };

    this.sendToChat(itemData);
}

    async performWeaponRoll1e(item, speaker) {
    let actorSecurity = 0;
    if (speaker.system.disciplines) {
      actorSecurity = parseInt(speaker.system.disciplines.security.value);
    } else if (speaker.system.departments) {
      actorSecurity = parseInt(speaker.system.departments.security.value);
    }
    let scaleDamage = 0;
    if (item.system.includescale && speaker.system.scale) scaleDamage = parseInt(speaker.system.scale);
    const calculatedDamage = item.system.damage + actorSecurity + scaleDamage;
    // Create variable div and populate it with localisation to use in the HTML.
    let variablePrompt = game.i18n.format('sta.roll.weapon.damagePlural');
    if (calculatedDamage == 1) {
      variablePrompt = game.i18n.format('sta.roll.weapon.damage');
    }
    const variable = `<div class='dice-formula'> ` + variablePrompt.replace('|#|', calculatedDamage) + `</div>`;

    const LABELS = Object.freeze({
      charge: 'sta.actor.belonging.weapon.charge',
      grenade: 'sta.actor.belonging.weapon.grenade',
      area: 'sta.actor.belonging.weapon.area',
      intense: 'sta.actor.belonging.weapon.intense',
      knockdown: 'sta.actor.belonging.weapon.knockdown',
      accurate: 'sta.actor.belonging.weapon.accurate',
      debilitating: 'sta.actor.belonging.weapon.debilitating',
      cumbersome: 'sta.actor.belonging.weapon.cumbersome',
      inaccurate: 'sta.actor.belonging.weapon.inaccurate',
      deadly: 'sta.actor.belonging.weapon.deadly',
      nonlethal: 'sta.actor.belonging.weapon.nonlethal',
      hiddenx: 'sta.actor.belonging.weapon.hiddenx',
      piercingx: 'sta.actor.belonging.weapon.piercingx',
      viciousx: 'sta.actor.belonging.weapon.viciousx',
    });

  const TOOLTIP_TEXT = Object.freeze({
      charge: game.i18n.localize('sta.tooltip.character.weapon.charge'),
      grenade: game.i18n.localize('sta.tooltip.character.weapon.grenade'),
      area: game.i18n.localize('sta.tooltip.character.weapon.area'),
      intense: game.i18n.localize('sta.tooltip.character.weapon.intense'),
      knockdown: game.i18n.localize('sta.tooltip.character.weapon.knockdown'),
      accurate: game.i18n.localize('sta.tooltip.character.weapon.accurate'),
      debilitating: game.i18n.localize('sta.tooltip.character.weapon.debilitating'),
      cumbersome: game.i18n.localize('sta.tooltip.character.weapon.cumbersome'),
      inaccurate: game.i18n.localize('sta.tooltip.character.weapon.inaccurate'),
      deadly: game.i18n.localize('sta.tooltip.character.weapon.deadly'),
      nonlethal: game.i18n.localize('sta.tooltip.character.weapon.nonlethal'),
      hiddenx: game.i18n.localize('sta.tooltip.character.weapon.hiddenx'),
      piercingx: game.i18n.localize('sta.tooltip.character.weapon.piercingx'),
      viciousx: game.i18n.localize('sta.tooltip.character.weapon.viciousx'),
    });

  const tags = [];

  for (const [prop, rawValue] of Object.entries(item.system.qualities)) {
    if (rawValue === undefined || rawValue === null || rawValue === '') continue;
    if (!Object.prototype.hasOwnProperty.call(LABELS, prop)) continue;
    const label = game.i18n.localize(LABELS[prop]);
    const display = Number.isFinite(rawValue) ? `${label} ${rawValue}` : label;
    const tip = TOOLTIP_TEXT[prop] ?? '';
    tags.push({ label: display, tooltip: tip });
  }

    const damageRoll = await new Roll(calculatedDamage + 'd6').evaluate({});
    const getSuccessesEffects = await this._getSuccessesEffects(damageRoll);
    const diceImages = await this._getDiceImageListFromChallengeRoll(damageRoll);

    const itemData = {
    speakerName: speaker.alias ?? speaker.name,
    img: item.img,
    type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
    name: item.name,
    descFieldHtml: item.system.description ?? '',
    rollType: 'weapon',
    varFieldHtml: variable,
    tags,
    range: game.i18n.localize(`sta.roll.${item.system.range}`),
    weapontype: item.system.hands + ' ' + game.i18n.localize(`sta.item.genericitem.handed`),
  };

    this.sendToChat(itemData);
}

    async performStarshipWeaponRoll1e(item, speaker) {
    let actorSecurity = 0;
    if (speaker.system.disciplines) {
      actorSecurity = parseInt(speaker.system.disciplines.security.value);
    } else if (speaker.system.departments) {
      actorSecurity = parseInt(speaker.system.departments.security.value);
    }
    let scaleDamage = 0;
    if (item.system.includescale && speaker.system.scale) scaleDamage = parseInt(speaker.system.scale);
    const calculatedDamage = item.system.damage + actorSecurity + scaleDamage;
    // Create variable div and populate it with localisation to use in the HTML.
    let variablePrompt = game.i18n.format('sta.roll.weapon.damagePlural');
    if (calculatedDamage == 1) {
      variablePrompt = game.i18n.format('sta.roll.weapon.damage');
    }
    const variable = `<div class='dice-formula'> ` + variablePrompt.replace('|#|', calculatedDamage) + `</div>`;


    const LABELS = Object.freeze({
      area: 'sta.actor.belonging.weapon.area',
      spread: 'sta.actor.belonging.weapon.spread',
      highyield: 'sta.actor.belonging.weapon.highyield',
      devastating: 'sta.actor.belonging.weapon.devastating',
      dampening: 'sta.actor.belonging.weapon.dampening',
      calibration: 'sta.actor.belonging.weapon.calibration',
      hiddenx: 'sta.actor.belonging.weapon.hiddenx',
persistent: 'sta.actor.belonging.weapon.persistent',
      piercingx: 'sta.actor.belonging.weapon.piercingx',
      viciousx: 'sta.actor.belonging.weapon.viciousx',
      versatilex: 'sta.actor.belonging.weapon.versatilex',
    });

  const TOOLTIP_TEXT = Object.freeze({
      area: game.i18n.localize('sta.tooltip.starship.weapon.area'),
      spread: game.i18n.localize('sta.tooltip.starship.weapon.spread'),
      highyield: game.i18n.localize('sta.tooltip.starship.weapon.highyield'),
      devastating: game.i18n.localize('sta.tooltip.starship.weapon.devastating'),
      dampening: game.i18n.localize('sta.tooltip.starship.weapon.dampening'),
      calibration: game.i18n.localize('sta.tooltip.starship.weapon.calibration'),
      hiddenx: game.i18n.localize('sta.tooltip.starship.weapon.hiddenx'),
persistent: 'sta.actor.belonging.weapon.persistent',
      piercingx: game.i18n.localize('sta.tooltip.starship.weapon.piercingx'),
      viciousx: game.i18n.localize('sta.tooltip.starship.weapon.viciousx'),
      versatilex: game.i18n.localize('sta.tooltip.starship.weapon.versatilex'),
    });

  const tags = [];

  for (const [prop, rawValue] of Object.entries(item.system.qualities)) {
    if (rawValue === undefined || rawValue === null || rawValue === '') continue;
    if (!Object.prototype.hasOwnProperty.call(LABELS, prop)) continue;
    const label = game.i18n.localize(LABELS[prop]);
    const display = Number.isFinite(rawValue) ? `${label} ${rawValue}` : label;
    const tip = TOOLTIP_TEXT[prop] ?? '';
    tags.push({ label: display, tooltip: tip });
  }

    const damageRoll = await new Roll(calculatedDamage + 'd6').evaluate({});
    const getSuccessesEffects = await this._getSuccessesEffects(damageRoll);
    const diceImages = await this._getDiceImageListFromChallengeRoll(damageRoll);

    const itemData = {
    speakerName: speaker.alias ?? speaker.name,
    img: item.img,
    type: game.i18n.localize(`sta.actor.belonging.${item.type}.title`),
    name: item.name,
    descFieldHtml: item.system.description ?? '',
    rollType: 'weapon',
    varFieldHtml: variable,
    tags,
    range: game.i18n.localize(`sta.roll.${item.system.range}`),
    weapontype: item.system.hands + ' ' + game.i18n.localize(`sta.item.genericitem.handed`),
  };

    this.sendToChat(itemData);
}

  // #########################################################
  // #                                                       #
  // #                  Send to Chat                         #
  // #                                                       #
  // #########################################################

  async sendToChat(rollData) {

    let chatData = '';
    let sound = '';
    switch (rollData.rollType) {
      case 'task':
        chatData = await foundry.applications.handlebars.renderTemplate(
          'systems/sta/templates/chat/attribute-test.hbs',
           rollData
        );
        sound = CONFIG.sounds.dice;
        break;
      case 'challenge':
        chatData = await foundry.applications.handlebars.renderTemplate(
          'systems/sta/templates/chat/challenge-roll.hbs',
           rollData
         );
        sound = CONFIG.sounds.dice;
         break;
      case 'npc':
        chatData = await foundry.applications.handlebars.renderTemplate(
          'systems/sta/templates/chat/attribute-test-npc.hbs',
          rollData
        );
        sound = CONFIG.sounds.dice;
        break;
      case 'reroll':
        chatData = await foundry.applications.handlebars.renderTemplate(
          'systems/sta/templates/chat/reroll.hbs',
          rollData
        );
        sound = CONFIG.sounds.dice;
        break;
      case 'acclaim':
        chatData = await foundry.applications.handlebars.renderTemplate(
          'systems/sta/templates/chat/reputation-roll.hbs',
          rollData
        );
        sound = CONFIG.sounds.dice;
        break;
      case 'item':
        chatData = await foundry.applications.handlebars.renderTemplate(
          'systems/sta/templates/chat/generic-item.hbs', 
          rollData
        );
      case 'weapon':
        chatData = await foundry.applications.handlebars.renderTemplate(
          'systems/sta/templates/chat/weapon.hbs', 
          rollData
        );
        break;
      default:
        break;
      }

    const rollMode = game.settings.get('core', 'rollMode');

    // Check if the dice3d module exists (Dice So Nice). If it does, post a roll in that.
    if (game.dice3d) {
      game.dice3d.showForRoll(taskRolled, game.user, true);
    }
    
    const messageProps = {
      content: chatData,
      sound,
      flags: {
        'sta': {
          speakerName: rollData.speakerName,
          diceOutcome: rollData.diceOutcome,
        }
      },
    };

    // Apply the roll mode to automatically adjust visibility settings
    ChatMessage.applyRollMode(messageProps, rollMode);

    // Send the chat message
    return await ChatMessage.create(messageProps);
  }
}