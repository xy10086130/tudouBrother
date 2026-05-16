import { _decorator, instantiate, Node, Prefab, tween, v2, Vec3 } from 'cc';
import { Weapon } from './Weapon';
import { WaveState } from '../WaveState';
import { Config } from '../Config';
import { AudioMgr } from '../AudioMgr';
import { PlayerBullet } from '../PlayerBullet';
import { Enemy } from '../Enemy';
const { ccclass, property } = _decorator;

@ccclass('PistolsMgr')
export class PistolsMgr extends Weapon {
    @property(Prefab)
    bulletPrefab: Prefab = null;

    currentCooltime: number = 0;

    // 射击点（枪口位置）
    @property(Node)
    firePoint: Node = null;

    attackSpeed: number = 0;

    start() {
        this.currentCooltime = this.cooltime;
    }

    attackSpeedIncrease(_speed: number) {
        this.attackSpeed = this.attackSpeed * (1 + _speed / 100);
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
        if (this.enemyInRange && this.currentLockEnemy && !this.isAttacking) {
            this.currentCooltime = this.cooltime;
            this.attack();
        }
    }

    rotateToEnemy() {
        let enemyWorldPos = this.currentLockEnemy.getWorldPosition();
        let weaponWorldPos = this.node.getWorldPosition();
        let direction = enemyWorldPos.subtract(weaponWorldPos);
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
        return { agl, attackLength, startPos };
    }

    attack() {

        if (Config.waveState != WaveState.Ongoing) return;

        if (this.isAttacking) return;
        this.isAttacking = true;

        if (!this.currentLockEnemy || !this.currentLockEnemy.isValid) {
            console.log("pistol没有当前锁定的enemy");
            this.isAttacking = false;
            return;
        }

        const enemyComp = this.currentLockEnemy.getComponent(Enemy);
        if (!enemyComp || enemyComp.isDead) {
            console.log("pistol锁定的敌人已死亡");
            this.isAttacking = false;
            this.currentLockEnemy = null;
            return;
        }
        let enemyWorldPos = this.currentLockEnemy.getWorldPosition();
        let weaponWorldPos = this.node.getWorldPosition();
        let direction = enemyWorldPos.subtract(weaponWorldPos);
        direction.normalize();
        //武器到敌人的角度
        let { agl, attackLength, startPos } = this.rotateToEnemy();

        const targetEnemy = this.currentLockEnemy;
        tween(this.node)
            .to(0.1, { angle: agl }, { easing: 'quadOut' })
            .call(() => {
                // 在射击前再次检查敌人是否仍然有效
                if (!targetEnemy || !targetEnemy.isValid) {
                    console.log("射击时敌人已无效");
                    this.isAttacking = false;
                    return;
                }

                const enemyCompCheck = targetEnemy.getComponent(Enemy);
                if (!enemyCompCheck || enemyCompCheck.isDead) {
                    console.log("射击时敌人已死亡");
                    this.isAttacking = false;
                    return;
                }

                this.shoot(targetEnemy);
                AudioMgr.Instance.playEffect(this.effect);
                this.isAttacking = false;
            })
            .delay(0.2)
            .to(0.1, { angle: 0 }, { easing: 'quadIn' })
            .start();
    }

    shoot(targetEnemy: Node) {
        if (!targetEnemy || !targetEnemy.isValid) {
            console.log("射击时目标敌人无效");
            return;
        }

        const enemyComp = targetEnemy.getComponent(Enemy);
        if (!enemyComp || enemyComp.isDead) {
            console.log("射击时敌人已死亡");
            return;
        }

        if (this.bulletPrefab) {
            const bulletNode = instantiate(this.bulletPrefab);

            const firePointWorldPos = this.firePoint.getWorldPosition();
            bulletNode.setParent(this.node.parent);
            bulletNode.setWorldPosition(firePointWorldPos);

            const bullet = bulletNode.getComponent(PlayerBullet);

            const enemyWorldPos = targetEnemy.getWorldPosition();
            let direction = enemyWorldPos.subtract(firePointWorldPos);
            direction.normalize();

            // 初始化子弹
            bullet.init(direction, this.bulletSpeed, this.damage, this.pierce);
        }
    }

    update(deltaTime: number) {
        if (this.isAttacking) {
            return;
        }
        this.lockEnemy(deltaTime);
    }
}





