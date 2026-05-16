import { _decorator, Component, Node } from 'cc';
import { EventMgr } from './EventMgr';
import { Config } from './Config';
import { UpgradeCfgData } from './UpgradeCfgData';
const { ccclass, property } = _decorator;

@ccclass('PlayerData')
export class PlayerData {
    private static _instance: PlayerData = null;

    public static get Instance(): PlayerData {
        if (PlayerData._instance == null) {
            PlayerData._instance = new PlayerData();
        }
        return PlayerData._instance;
    }

    private static readonly MAX_ATTRIBUTES = {
        DODGE: 60,            // 闪避最高70%
        LIFE_STEAL: 30,       // 生命偷取最高30%
        ATTACK_SPEED: 500,    // 攻击速度最高500
        ARMOR: 100,           // 护甲最高100
        CRIT_CHANCE: 80,      // 暴击率最高80%
        LUCK: 60,            // 运气最高100
    };

    //私有属性
    hp: number = 9;
    att: number = 0;
    Lv: number = 1;
    exp: number = 0;
    gold: number = 0;
    expToNextLv: number = 0;
    // // 武器UI索引
    // weaponUiIndex:number=0;

    playerSpriteFrameIndex: number = 0;

    isFist: boolean = false;
    isPistol: boolean = false;


    // 共有属性
    maxHp: number = 9;
    hpRegeneration: number = 0;
    lifeSteal: number = 0;
    damage: number = 0;
    meleeDamage: number = 0;
    rangeDamage: number = 0;
    elementDamage: number = 0;
    attackSpeed: number = 0;
    critChance: number = 0;
    Engineering: number = 0;
    attackRange: number = 0;
    armor: number = 0;
    dodge: number = 0;
    speed: number = 0;
    luck: number = 0;

    // 增加属性的方法   属性值不能超过最大值
    public addAttribute(data: UpgradeCfgData) {
        switch (data.type) {
            case "max_hp":
                this.maxHp += data.effect;
                break;
            case "hp_regeneration":
                this.hpRegeneration += data.effect;
                break;
            case "life_steal":
                this.lifeSteal = Math.min(this.lifeSteal + data.effect, PlayerData.MAX_ATTRIBUTES.LIFE_STEAL);;
                break;
            case "damage":
                this.damage += data.effect;
                break;
            case "melee_damage":
                this.meleeDamage += data.effect;
                break;
            case "range_damage":
                this.rangeDamage += data.effect;
                break;
            case "element_damage":
                this.elementDamage += data.effect;
                break;
            case "attack_speed":
                this.attackSpeed = Math.min(this.attackSpeed + data.effect, PlayerData.MAX_ATTRIBUTES.ATTACK_SPEED);
                break;
            case "crit_chance":
                this.critChance = Math.min(this.critChance + data.effect, PlayerData.MAX_ATTRIBUTES.CRIT_CHANCE);
                break;
            case "Engineering":
                this.Engineering += data.effect;
                break;
            case "attack_range":
                this.attackRange += data.effect;
                break;
            case "armor":
                this.armor = Math.min(this.armor + data.effect, PlayerData.MAX_ATTRIBUTES.ARMOR);
                break;
            case "dodge":
                this.dodge = Math.min(this.dodge + data.effect, PlayerData.MAX_ATTRIBUTES.DODGE);
                break;
            case "speed":
                this.speed += data.effect;
                break;
            case "luck":
                this.luck = Math.min(this.luck + data.effect, PlayerData.MAX_ATTRIBUTES.LUCK);
                break;
            default:
                break;
        }
    }


    // 增加经验的方法
    addExp(exp: number) {
        this.expToNextLv = Config.Instance.getExpData(this.Lv).exp;
        this.exp += exp;

        while (this.exp >= this.expToNextLv) {
            this.Lv++;
            this.exp -= this.expToNextLv;
            this.expToNextLv = Config.Instance.getExpData(this.Lv).exp;

            EventMgr.Instance.emit(Config.LEVEL_UP, this.Lv);
        }

        EventMgr.Instance.emit(Config.EXP_INCREASE, {
            currentExp: this.exp,
            expToNextLv: this.expToNextLv,
            level: this.Lv
        });
    }

    changeGold(gold: number) {
        this.gold += gold;
        EventMgr.Instance.emit(Config.GOLD_INCREASE, this.gold);
    }
reset() {
    // 基础属性重置
    this.Lv = 1;
    this.exp = 0;
    this.expToNextLv = 10;
    this.gold = 0; // 添加金币重置
    this.hp = 9;
    
    // 装备和武器重置
    this.isFist = false;
    this.isPistol = false;
    this.playerSpriteFrameIndex = 0;
    
    // 战斗属性重置
    this.maxHp = 9;
    this.hpRegeneration = 0;
    this.lifeSteal = 0;
    this.damage = 0;
    this.meleeDamage = 0;
    this.rangeDamage = 0;
    this.elementDamage = 0;
    this.attackSpeed = 0;
    this.critChance = 0;
    this.Engineering = 0;
    this.attackRange = 0;
    this.armor = 0;
    this.dodge = 0;
    this.speed = 0;
    this.luck = 0;
    
    console.log("玩家数据已重置");
}

}


