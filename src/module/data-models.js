// ============================================================================
// HELPER FUNCTIONS FOR REPEATED STRUCTURES
// ============================================================================

function createAttributeSchema(labelKey, initialValue = 7, selected = false) {
  const fields = foundry.data.fields;
  return new fields.SchemaField({
    label: new fields.StringField({ initial: labelKey }),
    value: new fields.NumberField({ required: true, integer: true, initial: initialValue }),
    selected: new fields.BooleanField({ initial: selected })
  });
}

function createDisciplineSchema(labelKey, initialValue = 0, selected = false) {
  const fields = foundry.data.fields;
  return new fields.SchemaField({
    label: new fields.StringField({ initial: labelKey }),
    value: new fields.NumberField({ required: true, integer: true, initial: initialValue }),
    selected: new fields.BooleanField({ initial: selected })
  });
}

function createSystemSchema(labelKey, initialValue = 7, selected = false) {
  const fields = foundry.data.fields;
  return new fields.SchemaField({
    label: new fields.StringField({ initial: labelKey }),
    value: new fields.NumberField({ required: true, integer: true, initial: initialValue }),
    selected: new fields.BooleanField({ initial: selected }),
    breaches: new fields.NumberField({ required: true, integer: true, initial: 0 })
  });
}

// ============================================================================
// BASE CLASSES FOR TEMPLATE INHERITANCE
// ============================================================================

class CommonActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      notes: new fields.StringField({ initial: "" })
    };
  }
}

class CommonItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.StringField({ initial: "" })
    };
  }
}

// ============================================================================
// ACTOR DATA MODELS
// ============================================================================

export class CharacterData extends CommonActorData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      assignment: new fields.StringField({ initial: "" }),
      
      attributes: new fields.SchemaField({
        control: createAttributeSchema("sta.actor.character.attribute.control", 7, true),
        daring: createAttributeSchema("sta.actor.character.attribute.daring"),
        fitness: createAttributeSchema("sta.actor.character.attribute.fitness"),
        insight: createAttributeSchema("sta.actor.character.attribute.insight"),
        presence: createAttributeSchema("sta.actor.character.attribute.presence"),
        reason: createAttributeSchema("sta.actor.character.attribute.reason")
      }),
      
      determination: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 1 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 3 })
      }),
      
      disciplineorder: new fields.ArrayField(
        new fields.StringField(),
        { initial: ["command", "conn", "security", "engineering", "science", "medicine"] }
      ),
      
      disciplineorder2e: new fields.ArrayField(
        new fields.StringField(),
        { initial: ["command", "conn", "engineering", "security", "medicine", "science"] }
      ),
      
      disciplines: new fields.SchemaField({
        command: createDisciplineSchema("sta.actor.character.discipline.command", 0, true),
        conn: createDisciplineSchema("sta.actor.character.discipline.conn"),
        engineering: createDisciplineSchema("sta.actor.character.discipline.engineering"),
        medicine: createDisciplineSchema("sta.actor.character.discipline.medicine"),
        science: createDisciplineSchema("sta.actor.character.discipline.science"),
        security: createDisciplineSchema("sta.actor.character.discipline.security")
      }),
      
      environment: new fields.StringField({ initial: "" }),
      milestones: new fields.StringField({ initial: "" }),
      pronouns: new fields.StringField({ initial: "" }),
      characterrole: new fields.StringField({ initial: "" }),
      rank: new fields.StringField({ initial: "" }),
      reputation: new fields.NumberField({ required: true, integer: true, initial: 3 }),
      acclaim: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      reprimand: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      species: new fields.StringField({ initial: "" }),
      careerpath: new fields.StringField({ initial: "" }),
      pastimes: new fields.StringField({ initial: "" }),
      experience: new fields.StringField({ initial: "" }),
      careerevents: new fields.StringField({ initial: "" }),
      house: new fields.StringField({ initial: "" }),
      caste: new fields.StringField({ initial: "" }),
      status: new fields.StringField({ initial: "" }),
      temperament: new fields.StringField({ initial: "" }),
      househistory: new fields.StringField({ initial: "" }),
      influence: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      might: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      wealth: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      legacy: new fields.StringField({ initial: "" }),
      traits: new fields.StringField({ initial: "" }),
      
      stress: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0 })
      }),
      
      strmod: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      rollrepnotdis: new fields.BooleanField({ initial: false }),
      upbringing: new fields.StringField({ initial: "" })
    };
  }
}

export class StarshipData extends CommonActorData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      
      crew: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0 })
      }),
      
      departmentorder: new fields.ArrayField(
        new fields.StringField(),
        { initial: ["command", "conn", "security", "engineering", "science", "medicine"] }
      ),
      
      departmentorder2e: new fields.ArrayField(
        new fields.StringField(),
        { initial: ["command", "conn", "engineering", "security", "medicine", "science"] }
      ),
      
      departments: new fields.SchemaField({
        command: createDisciplineSchema("sta.actor.starship.department.command", 0, true),
        conn: createDisciplineSchema("sta.actor.starship.department.conn"),
        engineering: createDisciplineSchema("sta.actor.starship.department.engineering"),
        medicine: createDisciplineSchema("sta.actor.starship.department.medicine"),
        science: createDisciplineSchema("sta.actor.starship.department.science"),
        security: createDisciplineSchema("sta.actor.starship.department.security")
      }),
      
      designation: new fields.StringField({ initial: "" }),
      missionprofile: new fields.StringField({ initial: "" }),
      
      power: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0 })
      }),
      
      refit: new fields.StringField({ initial: "" }),
      resistance: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      scale: new fields.NumberField({ required: true, integer: true, initial: 1 }),
      
      shields: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0 })
      }),
      
      shieldmod: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      crwmod: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      reservepower: new fields.BooleanField({ initial: true }),
      shaken: new fields.BooleanField({ initial: false }),
      servicedate: new fields.StringField({ initial: "" }),
      spaceframe: new fields.StringField({ initial: "" }),
      
      systems: new fields.SchemaField({
        communications: createSystemSchema("sta.actor.starship.system.communications", 7, true),
        computers: createSystemSchema("sta.actor.starship.system.computers"),
        engines: createSystemSchema("sta.actor.starship.system.engines"),
        sensors: createSystemSchema("sta.actor.starship.system.sensors"),
        structure: createSystemSchema("sta.actor.starship.system.structure"),
        weapons: createSystemSchema("sta.actor.starship.system.weapons")
      }),
      
      traits: new fields.StringField({ initial: "" })
    };
  }
}

export class ExtendedTaskData extends CommonActorData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      magnitude: new fields.NumberField({ required: true, integer: true, initial: 1 }),
      difficulty: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      work: new fields.NumberField({ required: true, integer: true, initial: 1 }),
      resistance: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      breakthroughs: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      workprogress: new fields.NumberField({ required: true, integer: true, initial: 0 })
    };
  }
}

export class SmallCraftData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    
    return {
      departmentorder: new fields.ArrayField(
        new fields.StringField(),
        { initial: ["command", "conn", "security", "engineering", "science", "medicine"] }
      ),
      
      departmentorder2e: new fields.ArrayField(
        new fields.StringField(),
        { initial: ["command", "conn", "engineering", "security", "medicine", "science"] }
      ),
      
      departments: new fields.SchemaField({
        command: createDisciplineSchema("sta.actor.starship.department.command", 0, true),
        conn: createDisciplineSchema("sta.actor.starship.department.conn"),
        engineering: createDisciplineSchema("sta.actor.starship.department.engineering"),
        medicine: createDisciplineSchema("sta.actor.starship.department.medicine"),
        science: createDisciplineSchema("sta.actor.starship.department.science"),
        security: createDisciplineSchema("sta.actor.starship.department.security")
      }),
      
      missionprofile: new fields.StringField({ initial: "" }),
      parentShip: new fields.StringField({ initial: "" }), // CHANGED from 'parent'
      
      power: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0 })
      }),
      
      resistance: new fields.NumberField({ required: true, integer: true, initial: 1 }),
      scale: new fields.NumberField({ required: true, integer: true, initial: 1 }),
      reservepower: new fields.BooleanField({ initial: true }),
      shaken: new fields.BooleanField({ initial: false }),
      
      shields: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0 })
      }),
      
      shieldmod: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      spaceframe: new fields.StringField({ initial: "" }),
      
      systems: new fields.SchemaField({
        communications: createSystemSchema("sta.actor.starship.system.communications", 7, true),
        computers: createSystemSchema("sta.actor.starship.system.computers"),
        engines: createSystemSchema("sta.actor.starship.system.engines"),
        sensors: createSystemSchema("sta.actor.starship.system.sensors"),
        structure: createSystemSchema("sta.actor.starship.system.structure"),
        weapons: createSystemSchema("sta.actor.starship.system.weapons")
      }),
      
      traits: new fields.StringField({ initial: "" })
    };
  }
}

export class SceneTraitsData extends CommonActorData {
  static defineSchema() {
    const parentSchema = super.defineSchema();
    return {
      ...parentSchema
    };
  }
}

// ============================================================================
// ITEM DATA MODELS
// ============================================================================

export class ItemData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      quantity: new fields.NumberField({ required: true, integer: true, initial: 1 }),
      opportunity: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      escalation: new fields.NumberField({ required: true, integer: true, initial: 0 })
    };
  }
}

export class FocusData extends CommonItemData {
  static defineSchema() {
    const parentSchema = super.defineSchema();
    return {
      ...parentSchema
    };
  }
}

export class ValueData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      used: new fields.BooleanField({ initial: false })
    };
  }
}

export class CharacterWeaponData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      damage: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      range: new fields.StringField({ initial: "melee" }),
      hands: new fields.NumberField({ required: true, integer: true, initial: 1 }),
      
      qualities: new fields.SchemaField({
        area: new fields.BooleanField({ initial: false }),
        intense: new fields.BooleanField({ initial: false }),
        knockdown: new fields.BooleanField({ initial: false }),
        accurate: new fields.BooleanField({ initial: false }),
        charge: new fields.BooleanField({ initial: false }),
        cumbersome: new fields.BooleanField({ initial: false }),
        deadly: new fields.BooleanField({ initial: false }),
        debilitating: new fields.BooleanField({ initial: false }),
        grenade: new fields.BooleanField({ initial: false }),
        inaccurate: new fields.BooleanField({ initial: false }),
        nonlethal: new fields.BooleanField({ initial: false }),
        hiddenx: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        piercingx: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        viciousx: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        opportunity: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        escalation: new fields.NumberField({ required: true, integer: true, initial: 0 })
      })
    };
  }
}

export class CharacterWeapon2eData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      damage: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      range: new fields.StringField({ initial: "melee" }),
      hands: new fields.NumberField({ required: true, integer: true, initial: 1 }),
      severity: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      
      qualities: new fields.SchemaField({
        deadly: new fields.BooleanField({ initial: false }),
        stun: new fields.BooleanField({ initial: false }),
        accurate: new fields.BooleanField({ initial: false }),
        area: new fields.BooleanField({ initial: false }),
        charge: new fields.BooleanField({ initial: false }),
        cumbersome: new fields.BooleanField({ initial: false }),
        debilitating: new fields.BooleanField({ initial: false }),
        grenade: new fields.BooleanField({ initial: false }),
        inaccurate: new fields.BooleanField({ initial: false }),
        intense: new fields.BooleanField({ initial: false }),
        piercingx: new fields.BooleanField({ initial: false }),
        hiddenx: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        opportunity: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        escalation: new fields.NumberField({ required: true, integer: true, initial: 0 })
      })
    };
  }
}

export class StarshipWeaponData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      damage: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      range: new fields.StringField({ initial: "close" }),
      
      qualities: new fields.SchemaField({
        area: new fields.BooleanField({ initial: false }),
        spread: new fields.BooleanField({ initial: false }),
        dampening: new fields.BooleanField({ initial: false }),
        calibration: new fields.BooleanField({ initial: false }),
        devastating: new fields.BooleanField({ initial: false }),
        highyield: new fields.BooleanField({ initial: false }),
        persistentx: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        piercingx: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        viciousx: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        hiddenx: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        versatilex: new fields.NumberField({ required: true, integer: true, initial: 0 })
      })
    };
  }
}

export class StarshipWeapon2eData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      damage: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      range: new fields.StringField({ initial: "close" }),
      includescale: new fields.StringField({ initial: "energy" }),
      
      qualities: new fields.SchemaField({
        energy: new fields.BooleanField({ initial: false }),
        torpedo: new fields.BooleanField({ initial: false }),
        area: new fields.BooleanField({ initial: false }),
        calibration: new fields.BooleanField({ initial: false }),
        cumbersome: new fields.BooleanField({ initial: false }),
        dampening: new fields.BooleanField({ initial: false }),
        depleting: new fields.BooleanField({ initial: false }),
        devastating: new fields.BooleanField({ initial: false }),
        highyield: new fields.BooleanField({ initial: false }),
        intense: new fields.BooleanField({ initial: false }),
        jamming: new fields.BooleanField({ initial: false }),
        persistent: new fields.BooleanField({ initial: false }),
        piercing: new fields.BooleanField({ initial: false }),
        slowing: new fields.BooleanField({ initial: false }),
        spread: new fields.BooleanField({ initial: false }),
        hiddenx: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        versatilex: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        opportunity: new fields.NumberField({ required: true, integer: true, initial: 0 }),
        escalation: new fields.NumberField({ required: true, integer: true, initial: 0 })
      })
    };
  }
}

export class ArmorData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      protection: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      equipped: new fields.BooleanField({ initial: true }),
      opportunity: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      escalation: new fields.NumberField({ required: true, integer: true, initial: 0 })
    };
  }
}

export class TalentData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      talenttype: new fields.SchemaField({
        typeenum: new fields.StringField({ initial: "" }),
        description: new fields.StringField({ initial: "" }),
        minimum: new fields.NumberField({ required: true, integer: true, initial: 0 })
      })
    };
  }
}

export class MilestoneData extends CommonItemData {
  static defineSchema() {
    const parentSchema = super.defineSchema();
    return {
      ...parentSchema
    };
  }
}

export class InjuryData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      quantity: new fields.NumberField({ required: true, integer: true, initial: 1 })
    };
  }
}

export class SmallCraftContainerData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      quantity: new fields.NumberField({ required: true, integer: true, initial: 1 })
    };
  }
}

export class TraitData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      quantity: new fields.NumberField({ required: true, integer: true, initial: 1 })
    };
  }
}

export class LogData extends CommonItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const parentSchema = super.defineSchema();
    
    return {
      ...parentSchema,
      quantity: new fields.NumberField({ required: true, integer: true, initial: 1 })
    };
  }
}