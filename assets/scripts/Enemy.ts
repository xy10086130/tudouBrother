import { _decorator, Component, find, Node, Sprite, Vec3, Animation, tween, Prefab, Collider2D, Contact2DType, instantiate, Color, SpriteFrame } from 'cc';
import { EventMgr } from './EventMgr';
import { EnemyCfgData } from './EnemyCfgData';
import { ColliderGroup, Config } from './Config';
import { EnemyBullet } from './EnemyBullet';
import { WaveState } from './WaveState';
import { Flocking } from './Flocking';
import { Player } from './Player';
import { PlayerData } from './PlayerData';
import { ResMgr } from './ResMgr';
import { EnemyFactory } from './EnemyFactory';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {

    // 敌人属性
    id: number = 0;
    _name: string = "";
    type: string = "";
    hp: number = 0;
    attack: number = 0;
    speed: number = 0;

    // 颜色变化
    sprite: Sprite = null;                 // Sprite组件
    originalColor: Color = null;           // 原始颜色

    //冲刺
    isSprinting: boolean = false;
    sprintTime: number = 0;
    timer: number = 0;//冲刺时间定时器
    sprintTimer: number = 0;//冲刺冷却定时器
    sprintDuration: number = 0;
    originalSpeed: number = 0;
    // 射击
    @property(Prefab)
    bulletPrefab: Prefab = null;
    shootDistance: number = 400;
    shootInterval: number = 2.0;
    bulletSpeed: number = 500;
    bulletDamage: number = 1;
    //射击定时器
    shootTimer: number = 0;
    //玩家是否在射击范围内
    isPlayerInShootRange: boolean = false;

    player: Node = null;
    anim: Animation = null;
    isDead: boolean = false;

    traceDir: Vec3 = new Vec3(0, 0, 0);

    colliders: Collider2D[] = null;

    //  flock组件
    flocking: Flocking = null;

    start() {
        this.flocking = this.getComponent(Flocking);
        this.sprite = this.getComponent(Sprite);
        this.originalColor = this.sprite.color.clone();
        this.originalSpeed = this.speed;
        this.anim = this.getComponent(Animation);
        this.player = find("Canvas/player");
        if (this.type == "shoot") {
            this.colliders = this.getComponents(Collider2D);
            for (let c of this.colliders) {
                if (c.group == (1 << ColliderGroup.Enemy_Range)) {
                    c.on(Contact2DType.BEGIN_CONTACT, this.onRangeContact, this);
                    c.on(Contact2DType.END_CONTACT, this.onRangeContactEnd, this);
                }
            }
        }

    }

    initAttribute(cfg: EnemyCfgData) {
        this.isDead = false;

        this.id = cfg.id;
        this._name = cfg.name;
        this.type = cfg.type;
        this.hp = cfg.hp;
        this.attack = cfg.attack;
        this.speed = cfg.speed;

        this.shootDistance = cfg.shootDistance || 0;
        this.shootInterval = cfg.shootInterval || 0;
        this.bulletSpeed = cfg.bulletSpeed || 0;
        this.bulletDamage = cfg.bulletDamage || 0;

        this.sprintTime = cfg.sprintTime || 0;
        this.sprintDuration = cfg.sprintDuration || 0;

        this.shootTimer = this.shootInterval * 0.5;

        if (this.flocking) {
            this.flocking.initFlockingParams(
                cfg.neighborRadius || 200,
                cfg.separationDistance || 80,
                cfg.separationWeight || 1.5,
                cfg.cohesionWeight || 1.0,
                cfg.alignmentWeight || 0.8,
                cfg.flockingWeight || 0.3,
                cfg.sameTypeOnly || false
            );
        }

    }

    onRangeContact(self: Collider2D, other: Collider2D) {
        if (this.isDead) return;
        if (other.group == (1 << ColliderGroup.Player)) {
            this.isPlayerInShootRange = true;

            this.shootTimer = this.shootInterval * 0.5;
        }
    }

    onRangeContactEnd(self: Collider2D, other: Collider2D) {
        if (this.isDead) return;
        if (other.group == (1 << ColliderGroup.Player)) {
            this.isPlayerInShootRange = false;
        }
    }

    //tank 冲刺
    sprint(deltaTime: number) {

    }


    onHit(att: number) {
        if (this.isDead) {
            return;
        }
        this.hp -= att;

        if (this.hp <= 0) {
            this.isDead = true;
            EventMgr.Instance.emit(Config.ENEMY_DEATH, this.node);
            this.node.active = false;
        }
    }

    isShoot(deltaTime: number) {
        if (this.isDead) return;
        if (this.isPlayerInShootRange) {
            this.shootTimer += deltaTime;
            if (this.shootTimer >= this.shootInterval) {
                this.shootTimer = 0;
                tween(this)
                    .call(() => {
                        this.sprite.color = Color.RED;
                    })
                    .delay(0.5)
                    .call(() => {
                        this.sprite.color = this.originalColor;
                        this.shoot();
                    })
                    .start();
            }
        }
    }
    shoot() {
        const dir = this.player.getWorldPosition().subtract(this.node.getWorldPosition());
        dir.normalize();

        const canvas = find("Canvas");
        const bullet = instantiate(this.bulletPrefab);
        bullet.setParent(canvas);

        bullet.setWorldPosition(this.node.getWorldPosition().x, this.node.getWorldPosition().y, 0);

        bullet.getComponent(EnemyBullet).init(dir, this.bulletSpeed, this.bulletDamage);
    }


    tracePlayer() {
        if (this.player == null) {
            return;
        }
        this.traceDir.x = this.player.x - this.node.x;
        this.traceDir.y = this.player.y - this.node.y;
        this.traceDir.z = 0;
        this.traceDir.normalize();
    }

    //重置状态
    reset() {
        this.anim.stop();
        this.node.active = false;
    }
    update(deltaTime: number) {
        if (Config.waveState != WaveState.Ongoing) {
            this.anim.stop();
            return;
        }
        if (this.isDead) return;

        if (this.type == "shoot") {
            this.isShoot(deltaTime);
        }
        this.tracePlayer();

        // 计算群聚力
        let finalMoveDir = this.traceDir.clone();
        if (this.flocking && this.flocking.flockingWeight > 0) {
            const flockingForce = this.flocking.calculateFlockingForce();
            const flockingWeight = this.flocking.flockingWeight;
            let flockingPart = flockingForce.clone();
            flockingPart.multiplyScalar(flockingWeight);
            let tracePart = this.traceDir.clone();
            tracePart.multiplyScalar(1 - flockingWeight);
            Vec3.add(finalMoveDir, tracePart, flockingPart);
            Vec3.normalize(finalMoveDir, finalMoveDir);
        }

        let moveDelta = new Vec3();
        Vec3.multiplyScalar(moveDelta, finalMoveDir, this.speed * deltaTime);
        this.node.translate(moveDelta);
    }

}
