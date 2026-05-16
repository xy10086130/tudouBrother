import { _decorator, Collider2D, Component, Contact2DType, instantiate, Node, NodePool, Vec3 } from 'cc';
import { ColliderGroup, Config } from './Config';
import { Player } from './Player';
import { WaveState } from './WaveState';
const { ccclass, property } = _decorator;

@ccclass('EnemyBullet')
export class EnemyBullet extends Component {

    // 子弹属性
    speed: number = 0;
    damage: number = 1;
    direction: Vec3 = new Vec3();

    collider: Collider2D = null;


    bulletPools: Map<string, NodePool> = new Map<string, NodePool>();

    start() {
        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    init(direction: Vec3, speed: number, attack: number) {
        this.direction = direction;
        this.speed = speed;
        this.damage = attack;
    }

    initPool() {
        for (let i = 0; i < 10; i++) {
            let bullet = instantiate(this.node);
        }
    }

    onBeginContact(self: Collider2D, other: Collider2D) {
        if (other.group == (1 << ColliderGroup.Player)) {
            other.getComponent(Player).onHit(this.damage);
            this.node.destroy();
        }
    }

    update(deltaTime: number) {
        if (Config.waveState != WaveState.Ongoing) return;
        this.direction.normalize();
        this.direction.multiplyScalar(this.speed * deltaTime);
        this.node.translate(this.direction);
        if (this.node.x > 1700 || this.node.x < -1700 || this.node.y > 1445 || this.node.y < -1445) {
            this.node.destroy();
        }
    }
}


