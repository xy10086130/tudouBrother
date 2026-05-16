import { _decorator, Collider2D, Component, Contact2DType, Node, resources, Sprite, SpriteFrame } from 'cc';
import { ColliderGroup, Config } from './Config';
import { EventMgr } from './EventMgr';
import { Enemy } from './Enemy';
import { PlayerData } from './PlayerData';
import { UpgradeCfgData } from './UpgradeCfgData';
import { WaveState } from './WaveState';
import { PlayerControl } from './PlayerControl';
import { AudioMgr } from './AudioMgr';
import { WeaponMgr } from './weapon/WeaponMgr';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    public static instance: Player = null;

    maxHp: number = 9;
    currentHp: number = 9;

    @property(Node)
    hpUiNode: Node = null;

    @property(Sprite)
    hpProgress: Sprite = null;

    @property(Sprite)
    player: Sprite = null;

    isFullyHp: boolean = true;

    // 武器系统
    @property(WeaponMgr)
    weaponSystem: WeaponMgr = null;

    colliders: Collider2D[] = [];

    // 生命恢复累加器
    private hpRegenAccumulator: number = 0;

    // 升级后的属性增益
    damageBonus: number = 0;      // 伤害加成
    attackSpeedBonus: number = 0; // 攻击速度加成
    dodgeChance: number = 0;      // 闪避几率
    lifeSteal: number = 0;        // 生命偷取
    hpRegeneration: number = 0;   // 生命回复
    speed: number = 0;            // 移动速度

    protected onLoad(): void {
        Player.instance = this;
    }

    start() {
        this.choosePlayerUI();
        this.colliders = this.getComponents(Collider2D);
        for (let c of this.colliders) {
            if (c.group == (1 << ColliderGroup.Player)) {
                c.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            }
        }

        // // 初始化最大生命值
        // this.maxHp = PlayerData.Instance.maxHp;
        // this.currentHp = this.maxHp;

        // // 初始时血量满，隐藏血条
        // if (this.hpUiNode) {
        //     this.hpUiNode.active = false;
        // }
        // if (this.hpProgress) {
        //     this.hpProgress.fillRange = 1.0; // 满血
        // }

        //EventMgr.Instance.on(Config.PLAYER_HP_CHANGE, this.onPlayerHpUIChange, this);
    }

    // onPlayerHpUIChange(hp: number) {
    //     // 更新血条显示逻辑
    //     if (this.hpUiNode) {
    //         this.hpUiNode.active = (hp < this.maxHp);
    //     }
    //     if (this.hpProgress) {
    //         this.hpProgress.fillRange = hp / this.maxHp;
    //     }
    // }

    choosePlayerUI() {
        resources.load(`player/player${PlayerData.Instance.playerSpriteFrameIndex}/spriteFrame`, SpriteFrame, (err, SpriteFrame) => {
            if (err) {
                console.log(err.message);
                return;
            }
            this.player.spriteFrame = SpriteFrame;
        })
    }

    attributeApply(data: UpgradeCfgData) {
        switch (data.type) {
            case "max_hp":
                this.maxHp = PlayerData.Instance.maxHp;
                if (this.currentHp > this.maxHp) {
                    this.currentHp = this.maxHp;
                    EventMgr.Instance.emit(Config.PLAYER_HP_CHANGE, this.currentHp);
                }
                break;
            case "hp_regeneration":
                this.hpRegeneration = PlayerData.Instance.hpRegeneration;
                break;
            case "life_steal":
                this.lifeSteal = PlayerData.Instance.lifeSteal;
                break;
            case "damage":
                this.damageBonus = PlayerData.Instance.damage;
                this.weaponSystem.applyWeaponAttribute("damage", this.damageBonus);
                break;
            case "melee_damage":
                this.weaponSystem.applyWeaponAttribute("melee_damage", PlayerData.Instance.meleeDamage);
                break;
            case "ranged_damage":
                this.weaponSystem.applyWeaponAttribute("ranged_damage", PlayerData.Instance.rangeDamage || 0);
                break;
            case "attack_speed":
                this.attackSpeedBonus = PlayerData.Instance.attackSpeed;
                this.weaponSystem.applyWeaponAttribute("attack_speed", this.attackSpeedBonus);
                break;
            case "attack_range":
                this.weaponSystem.applyWeaponAttribute("attack_range", PlayerData.Instance.attackRange);
                break;
            case "dodge":
                this.dodgeChance = PlayerData.Instance.dodge;
                break;
            case "speed":
                this.speed = PlayerData.Instance.speed;
                PlayerControl.Instance.speedIncrease(this.speed);
                break;
        }
    }

    // 触发生命偷取
    triggerlifeSteal() {
        if (this.lifeSteal > 0 && Math.random() * 100 < this.lifeSteal) {
            this.currentHp = Math.min(this.currentHp + 1, this.maxHp);
            EventMgr.Instance.emit(Config.PLAYER_HP_CHANGE, this.currentHp);
            console.log("生命steal");
        }
    }

    changeHp(_hp: number) {
        this.currentHp = _hp;
        EventMgr.Instance.emit(Config.PLAYER_HP_CHANGE, this.currentHp);
    }

    onBeginContact(self: Collider2D, other: Collider2D) {
        if (other.group == (1 << ColliderGroup.Enemy)) {

            let att = other.getComponent(Enemy).attack;
            this.onHit(att);

            // 计算生命回复值
            if (this.lifeSteal > 0) {
                let random = Math.random() * 100;
                if (random < this.lifeSteal) {
                    this.currentHp += 1;
                    EventMgr.Instance.emit(Config.PLAYER_HP_CHANGE, this.currentHp);
                }
            }
        }
    }

    onHit(att: number) {
        // 检查闪避
        if (this.dodgeChance > 0 && Math.random() * 100 < this.dodgeChance) {
            console.log("闪避成功!");
            return;
        }
        AudioMgr.Instance.playEffect(Config.SOUND_HIT);
        this.currentHp -= att;



        if (this.currentHp <= 0) {
            this.currentHp = 0;
            // 触发玩家死亡事件
            EventMgr.Instance.emit(Config.PLAYER_DEATH);
        }

        EventMgr.Instance.emit(Config.PLAYER_HP_CHANGE, this.currentHp);
    }

    update(deltaTime: number) {
        if (Config.waveState != WaveState.Ongoing) {
            return;
        }

        // 生命恢复
        if (this.hpRegeneration > 0 && this.currentHp < this.maxHp) {
            //公式
            const HPEveryXSeconds = 5.0 / (1.0 + ((this.hpRegeneration - 1) / 2.25));
            const hpPerSecond = 1 / HPEveryXSeconds;
            this.hpRegenAccumulator += hpPerSecond * deltaTime;

            if (this.hpRegenAccumulator >= 1) {
                const recoverAmount = Math.floor(this.hpRegenAccumulator);
                this.currentHp = Math.min(this.currentHp + recoverAmount, this.maxHp);
                this.hpRegenAccumulator -= recoverAmount;
                EventMgr.Instance.emit(Config.PLAYER_HP_CHANGE, this.currentHp);
            }
        }
    }
}