import { _decorator, CircleCollider2D, Collider2D, Component, Contact2DType, Node } from 'cc';
import { ColliderGroup, Config } from '../Config';
import { EventMgr } from '../EventMgr';
import { Enemy } from '../Enemy';
import { FistMgr } from '../weapon/FistMgr';
import { PistolsMgr } from '../weapon/PistolsMgr';
import { Weapon } from '../weapon/Weapon';
const { ccclass, property } = _decorator;

@ccclass('WeaponMgr')
export class WeaponMgr extends Component {

    @property(FistMgr)
    fistMgr: FistMgr = null;

    @property(PistolsMgr)
    pistolsMgr: PistolsMgr = null;

    colliders: CircleCollider2D[] = [];

    // 近战攻击范围内的敌人数组
    enemiesInCloseRange: Node[] = [];
    // 远程攻击范围内的敌人数组
    enemiesInRangeRange: Node[] = [];

    // 所有武器管理器
    allWeaponMgrs: Weapon[] = [];

    attackRangeBonus: number = 0;

    onLoad() {
        if (this.fistMgr) {
            this.allWeaponMgrs.push(this.fistMgr);
        }
        if (this.pistolsMgr) {
            this.allWeaponMgrs.push(this.pistolsMgr);
        }
    }

    start() {
        this.colliders = this.getComponents(CircleCollider2D);
        this.initColliders();
        EventMgr.Instance.on(Config.ENEMY_DEATH, this.onEnemyDeath, this);
        EventMgr.Instance.on(Config.WEAPON_RANGE_CHANGE, this.onWeaponRangeChange, this);
    }

    initColliders() {
        for (let c of this.colliders) {
            if (c.group == (1 << ColliderGroup.Close)) {
                c.on(Contact2DType.BEGIN_CONTACT, this.onCloseBeginContact, this);
                c.on(Contact2DType.END_CONTACT, this.onCloseEndContact, this);
            }
            else if (c.group == (1 << ColliderGroup.Range)) {
                c.on(Contact2DType.BEGIN_CONTACT, this.onRangeBeginContact, this);
                c.on(Contact2DType.END_CONTACT, this.onRangeEndContact, this);
            }
        }
    }

    onWeaponRangeChange(range: number) {
        this.attackRangeBonus = range;
        for (let c of this.colliders) {
            if (c.group == (1 << ColliderGroup.Range)) {
                c.radius += range;
            }
        }
    }

    onCloseBeginContact(self: Collider2D, other: Collider2D) {
        if (other.group == (1 << ColliderGroup.Enemy)) {
            const enemyNode = other.node;
            if (this.enemiesInCloseRange.indexOf(enemyNode) == -1) {
                this.enemiesInCloseRange.push(enemyNode);
                if (this.fistMgr) {
                    this.fistMgr.setEnemyInRange(true);
                    this.fistMgr.setCurrentEnemy(this.getNearestEnemy(this.enemiesInCloseRange));
                }
            }
        }
    }

    onCloseEndContact(self: Collider2D, other: Collider2D) {
        if (other.group == (1 << ColliderGroup.Enemy)) {
            const enemyNode = other.node;
            const index = this.enemiesInCloseRange.indexOf(enemyNode);
            if (index != -1) {
                this.enemiesInCloseRange.splice(index, 1);
            }

            if (this.enemiesInCloseRange.length == 0) {
                if (this.fistMgr) {
                    this.fistMgr.setEnemyInRange(false);
                    this.fistMgr.setCurrentEnemy(null);
                }
            } else {
                if (this.fistMgr) {
                    this.fistMgr.setCurrentEnemy(this.getNearestEnemy(this.enemiesInCloseRange));
                }
            }
        }
    }

    onRangeBeginContact(self: Collider2D, other: Collider2D) {
        if (other.group == (1 << ColliderGroup.Enemy)) {
            const enemyNode = other.node;
            if (this.enemiesInRangeRange.indexOf(enemyNode) == -1) {
                this.enemiesInRangeRange.push(enemyNode);
                // 通知远程武器开始攻击
                if (this.pistolsMgr) {
                    this.pistolsMgr.setEnemyInRange(true);
                    this.pistolsMgr.setCurrentEnemy(this.getNearestEnemy(this.enemiesInRangeRange));
                }
            }
        }
    }

    // 远程攻击范围结束接触
    onRangeEndContact(self: Collider2D, other: Collider2D) {
        if (other.group == (1 << ColliderGroup.Enemy)) {
            const enemyNode = other.node;
            const index = this.enemiesInRangeRange.indexOf(enemyNode);
            if (index != -1) {
                this.enemiesInRangeRange.splice(index, 1);
            }

            if (this.enemiesInRangeRange.length == 0) {
                if (this.pistolsMgr) {
                    this.pistolsMgr.setEnemyInRange(false);
                    this.pistolsMgr.setCurrentEnemy(null);
                }
            } else {
                if (this.pistolsMgr) {
                    this.pistolsMgr.setCurrentEnemy(this.getNearestEnemy(this.enemiesInRangeRange));
                }
            }
        }
    }

    onEnemyDeath(enemyNode: Node) {
        console.log("111");

        // 从近战范围数组中移除
        const closeIndex = this.enemiesInCloseRange.indexOf(enemyNode);
        if (closeIndex !== -1) {
            this.enemiesInCloseRange.splice(closeIndex, 1);
        }

        // 从远程范围数组中移除
        const rangeIndex = this.enemiesInRangeRange.indexOf(enemyNode);
        if (rangeIndex !== -1) {
            this.enemiesInRangeRange.splice(rangeIndex, 1);
        }

        // 如果这个敌人是当前锁定的敌人，清除锁定
        if (this.fistMgr && this.fistMgr.currentLockEnemy === enemyNode) {
            this.fistMgr.currentLockEnemy = null;
            this.fistMgr.setEnemyInRange(this.enemiesInCloseRange.length > 0);
        }

        if (this.pistolsMgr && this.pistolsMgr.currentLockEnemy === enemyNode) {
            this.pistolsMgr.currentLockEnemy = null;
            this.pistolsMgr.setEnemyInRange(this.enemiesInRangeRange.length > 0);
            this.pistolsMgr.isAttacking = false; // 强制停止攻击状态
        }
    }

    getNearestEnemy(enemies: Node[]): Node | null {
        if (enemies.length == 0) {
            return null;
        }

        enemies = enemies.filter((enemy) => {
            if (!enemy || !enemy.isValid || !enemy.active) {
                return false;
            }
            const enemyComp = enemy.getComponent(Enemy);
            return enemyComp && !enemyComp.isDead;
        });

        if (enemies.length == 0) {
            return null;
        }

        let nearEnemy: Node = null;
        let minDistance: number = Number.MAX_VALUE;
        let playerPos = this.node.getWorldPosition();

        for (let enemy of enemies) {
            if (enemy && enemy.isValid) {
                const enemyComp = enemy.getComponent(Enemy);
                if (enemyComp && !enemyComp.isDead) {
                    let enemyPos = enemy.getWorldPosition();
                    let distance = playerPos.subtract(enemyPos).lengthSqr();
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearEnemy = enemy;
                    }
                }
            }
        }
        return nearEnemy;
    }

    // 更新武器系统  敌人列表  锁定目标
    updateWeaponSystem(deltaTime: number) {
        this.enemiesInCloseRange = this.enemiesInCloseRange.filter(enemy =>
            enemy && enemy.isValid && enemy.active
        );
        this.enemiesInRangeRange = this.enemiesInRangeRange.filter(enemy =>
            enemy && enemy.isValid && enemy.active
        );

        // 更新近战武器锁定目标
        if (this.enemiesInCloseRange.length > 0 && this.fistMgr) {
            const nearest = this.getNearestEnemy(this.enemiesInCloseRange);
            if (this.fistMgr.currentLockEnemy) {
                const currentEnemyComp = this.fistMgr.currentLockEnemy.getComponent(Enemy);
                if (currentEnemyComp.isDead) {
                    this.fistMgr.setCurrentEnemy(nearest);
                } else if (nearest && nearest !== this.fistMgr.currentLockEnemy && !this.fistMgr.isAttacking) {
                    this.fistMgr.setCurrentEnemy(nearest);
                }
            } else {
                this.fistMgr.setCurrentEnemy(nearest);
            }
        } else if (this.fistMgr) {
            this.fistMgr.setCurrentEnemy(null);
        }

        // 更新远程武器锁定目标 
        if (this.enemiesInRangeRange.length > 0 && this.pistolsMgr) {
            const nearest = this.getNearestEnemy(this.enemiesInRangeRange);
            if (this.pistolsMgr.currentLockEnemy) {
                const currentEnemyComp = this.pistolsMgr.currentLockEnemy.getComponent(Enemy);
                if (!currentEnemyComp || currentEnemyComp.isDead) {
                    this.pistolsMgr.setCurrentEnemy(nearest);
                } else if (nearest && nearest !== this.pistolsMgr.currentLockEnemy && !this.pistolsMgr.isAttacking) {
                    this.pistolsMgr.setCurrentEnemy(nearest);
                }
            } else {
                this.pistolsMgr.setCurrentEnemy(nearest);
            }
        } else if (this.pistolsMgr) {
            this.pistolsMgr.setCurrentEnemy(null);
        }
    }

    // 应用属性加成到武器
    applyWeaponAttribute(type: string, value: number) {
        switch (type) {
            case "damage":
                // 应用伤害加成到所有武器
                for (let weapon of this.allWeaponMgrs) {
                    if (weapon instanceof FistMgr) {
                        weapon.damageIncrease(value);
                    } else if (weapon instanceof PistolsMgr) {
                        weapon.damageIncrease(value);
                    }
                }
                break;
            case "melee_damage":
                // 只应用到近战武器
                if (this.fistMgr) {
                    this.fistMgr.damageIncrease(value);
                }
                break;
            case "ranged_damage":
                // 只应用到远程武器
                if (this.pistolsMgr) {
                    this.pistolsMgr.damageIncrease(value);
                }
                break;
            case "attack_speed":
                for (let weapon of this.allWeaponMgrs) {
                    if (weapon instanceof FistMgr) {
                        weapon.cooltime = weapon.cooltime / (1 + value * 0.05);
                    } else if (weapon instanceof PistolsMgr) {
                        weapon.attackSpeedIncrease(value);
                    }
                }
                break;
            case "attack_range":
                EventMgr.Instance.emit(Config.WEAPON_RANGE_CHANGE, value);
                break;
        }
    }



    update(deltaTime: number) {
        this.updateWeaponSystem(deltaTime);
    }

    protected onDestroy(): void {
        EventMgr.Instance.off(Config.WEAPON_RANGE_CHANGE, this.onWeaponRangeChange, this);
    }


}