import { _decorator, Component, Label, Node } from 'cc';
import { PlayerData } from './PlayerData';
const { ccclass, property } = _decorator;

@ccclass('AttributeListMgr')
export class AttributeListMgr extends Component {

    @property(Label)
    currentLevelLabel: Label = null;

    @property(Label)
    maxHpNumLabel: Label = null;

    @property(Label)
    hpGenerateNumLabel: Label = null;

    @property(Label)
    life_StealNumLabel: Label = null;

    @property(Label)
    damageNumLabel: Label = null;

    @property(Label)
    melee_DamageNumLabel: Label = null;

    @property(Label)
    ranged_DamageNumLabel: Label = null;

    @property(Label)
    elemental_DamageNumLabel: Label = null;

    @property(Label)
    attack_SpeedNumLabel: Label = null;

    @property(Label)
    crit_ChancelNumLabel: Label = null;

    @property(Label)
    engineering_StatNumLabel: Label = null;

    @property(Label)
    range_StatNumLabel: Label = null;

    @property(Label)
    armorNumLabel: Label = null;

    @property(Label)
    dodge_StatNumLabel: Label = null;

    @property(Label)
    speed_StatNumLabel: Label = null;

    @property(Label)
    luckNumLabel: Label = null;

    start() {
        this.init();
    }

    init(){
        this.currentLevelLabel.string = `${PlayerData.Instance.Lv}`;
        this.maxHpNumLabel.string = `${PlayerData.Instance.maxHp}`;
        this.hpGenerateNumLabel.string = `${PlayerData.Instance.hpRegeneration}`;
        this.life_StealNumLabel.string = `${PlayerData.Instance.lifeSteal}`;
        this.damageNumLabel.string = `${PlayerData.Instance.damage}`;
        this.melee_DamageNumLabel.string = `${PlayerData.Instance.meleeDamage}`;
        this.ranged_DamageNumLabel.string = `${PlayerData.Instance.rangeDamage}`;
        this.elemental_DamageNumLabel.string = `${PlayerData.Instance.elementDamage}`;
        this.attack_SpeedNumLabel.string = `${PlayerData.Instance.attackSpeed}`;
        this.crit_ChancelNumLabel.string = `${PlayerData.Instance.critChance}`;
        this.engineering_StatNumLabel.string = `${PlayerData.Instance.Engineering}`;
        this.range_StatNumLabel.string = `${PlayerData.Instance.attackRange}`;
        this.armorNumLabel.string = `${PlayerData.Instance.armor}`;
        this.dodge_StatNumLabel.string = `${PlayerData.Instance.dodge}`;
        this.speed_StatNumLabel.string = `${PlayerData.Instance.speed}`;
        this.luckNumLabel.string = `${PlayerData.Instance.luck}`;
    }

    update(deltaTime: number) {

    }
}


