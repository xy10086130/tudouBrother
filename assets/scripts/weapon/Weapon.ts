import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Weapon')
export class Weapon extends Component {

    id: number = 0;
    _name: string = " ";
    type: string = "";
    damage: number = 0;
    range: number = 0;
    cooltime: number = 0;
    speed: number = 0;
    effect: string = " ";
    bulletSpeed: number = 0;
    bulletLifeTime: number = 0;
    pierce: number = 0;

    //是否正在攻击
    isAttacking: boolean = false;
    //是否有敌人在攻击范围
    enemyInRange: boolean = false;
    //当前锁定敌人
    currentLockEnemy: Node = null;


    init(weaponData) {
        this.id = weaponData.id;
        this._name = weaponData.name;
        this.type = weaponData.type;
        this.damage = weaponData.damage;
        this.range = weaponData.range;  //范围
        this.cooltime = weaponData.cooltime;
        this.speed = weaponData.speed;
        this.effect = weaponData.effect;
        this.bulletSpeed = weaponData.bulletSpeed || 0;
        this.bulletLifeTime = weaponData.bulletLifeTime || 0;
        this.pierce = weaponData.pierce || 0;
    }

    damageIncrease(_damage: number) {
        this.damage = this.damage * (1 + _damage / 100);
    }

    public setEnemyInRange(inRange: boolean) {
        this.enemyInRange = inRange;
    }
}