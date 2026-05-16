import { _decorator, Collider2D, Component, Contact2DType, Vec3 } from 'cc';
import { ColliderGroup } from './Config';
import { Enemy } from './Enemy';
const { ccclass, property } = _decorator;

@ccclass('PlayerBullet')
export class PlayerBullet extends Component {

    // 子弹属性
    speed: number = 0;
    damage: number = 1;
    direction: Vec3 = new Vec3();
    pierceCount: number = 0; // 穿透次数
    currentPierce: number = 0; // 当前已穿透次数


    collider: Collider2D = null;

    start() {
        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    init(direction: Vec3, speed: number, damage: number, pierce: number = 0) {
        this.direction = direction;
        this.speed = speed;
        this.damage = damage;
        this.pierceCount = pierce;
        this.currentPierce = 0;
    }

    onBeginContact(self: Collider2D, other: Collider2D) {
        if (other.group == (1 << ColliderGroup.Enemy)) {
            const enemyComp = other.getComponent(Enemy);
            if (enemyComp) {
                enemyComp.onHit(this.damage);
                //音效 TODO

                // 检查穿透
                this.currentPierce++;
                if (this.currentPierce >= this.pierceCount) {
                    this.node.destroy();
                }
            }
        }
    }

    update(deltaTime: number) {
        this.direction.normalize();
        this.direction.multiplyScalar(this.speed * deltaTime);
        this.node.translate(this.direction);
        if (this.node.x > 1700 || this.node.x < -1700 || this.node.y > 1445 || this.node.y < -1445) {
            this.node.destroy();
        }
    }
}