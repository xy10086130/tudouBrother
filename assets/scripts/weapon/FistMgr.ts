import { _decorator, Collider2D, Contact2DType, Node, tween, v2, Vec3 } from 'cc';
import { ColliderGroup, Config } from '../Config';
import { FistData } from './FistData';
import { Enemy } from '../Enemy';
import { EventMgr } from '../EventMgr';
import { Player } from '../Player';
import { WaveState } from '../WaveState';
import { AudioMgr } from '../AudioMgr';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('FistMgr')
export class FistMgr extends Weapon {
    currentCooltime: number = 0;
    collider: Collider2D = null;

    originalAngle: number = 0;

    enemyNode: Node = null;

    start() {
        this.currentCooltime = this.cooltime;
        this.originalAngle = this.node.angle;

        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onCloseBeginContact, this);
            this.collider.enabled = false;
        }
        this.currentCooltime = 0;
    }

    onCloseBeginContact(self: Collider2D, other: Collider2D) {
        if (other.group == (1 << ColliderGroup.Enemy)) {
            const enemy = other.node.getComponent(Enemy);
            if (enemy) {
                enemy.onHit(this.damage);
                // 播放音效
                AudioMgr.Instance.playEffect(this.effect);
                EventMgr.Instance.emit(Config.ENEMY_HIT, this.damage);
                // 触发生命偷取
                Player.instance.triggerlifeSteal();
            }
        }
    }


    setCurrentEnemy(enemy: Node | null) {
        this.currentLockEnemy = enemy;
        if (enemy) {
            this.enemyInRange = true;
        }
        else {
            this.enemyInRange = false;
        }
    }

    // 锁定敌人
    lockEnemy(_deltaTime: number) {
        // 冷却时间倒计时
        if (this.currentCooltime > 0) {
            this.currentCooltime -= _deltaTime;
            return;
        }
        // 如果有敌人在范围内，并且没有正在攻击
        if (this.enemyInRange && this.currentLockEnemy && !this.isAttacking) {
            this.currentCooltime = this.cooltime;
            this.attackEnemy();
        }
    }

    attackEnemy() {
        if (Config.waveState != WaveState.Ongoing) return;

        if (this.isAttacking) return;
        this.isAttacking = true;

        this.collider.enabled = true;

        if (!this.currentLockEnemy) {
            console.log("fist没有当前锁定的enemy");
            return;
        }

        const enemyComp = this.currentLockEnemy.getComponent(Enemy);
        if (!enemyComp || enemyComp.isDead) {
            console.log("fist锁定的敌人已死亡");
            this.isAttacking = false;
            this.currentLockEnemy = null;
            return;
        }
        
        let enemyWorldPos = this.currentLockEnemy.getWorldPosition();
        let weaponWorldPos = this.node.getWorldPosition();
        let direction = enemyWorldPos.subtract(weaponWorldPos);
        direction.normalize();
        direction.normalize();
        //武器到敌人的角度
        let agl = 180 * v2(1, 0).signAngle(direction.toVec2()) / Math.PI;
        // 记录起始位置
        const startPos = this.node.getPosition();

        let attackLength = new Vec3(
            direction.x * this.range,
            direction.y * this.range,
            0
        );
        if (this.node.getChildByName("pic").scale.x < 0) {
            agl += 180;
        }
        agl = agl > 180 ? agl - 360 : agl;

        tween(this.node)
            .to(0.2, { angle: agl }, { easing: 'quadOut' })
            .to(0.1, { position: attackLength }, { easing: 'backOut' })
            .call(() => {
                // this.collider.enabled = false;
            })
            .to(0.15, { position: startPos, angle: 0 }, { easing: 'quadIn' })
            .call(() => {
                this.isAttacking = false;
            }
            )
            .start();
    }

    update(deltaTime: number) {
        if (Config.waveState != WaveState.Ongoing) return;
        this.lockEnemy(deltaTime);
    }
}

