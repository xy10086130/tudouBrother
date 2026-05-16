import { _decorator, Collider2D, Component, Contact2DType, find, Node, Vec3 } from 'cc';
import { ColliderGroup, Config } from './Config';
import { PlayerData } from './PlayerData';
import { EventMgr } from './EventMgr';
import { SupplyCfgData } from './SupplyCfgData';
const { ccclass, property } = _decorator;

@ccclass('Supply')
export class Supply extends Component {
    id: number = 0;
    _name: string = "";
    gold: number = 0;
    exp: number = 0;
    weight: number = 0;

    collider: Collider2D = null;

    // 是否被吸引
    isAttracted: boolean = false;
    // 玩家节点
    playerNode: Node = null;
    // 掉落物飞行速度
    flySpeed: number = 800;
    start() {
        this.playerNode = find("Canvas/player");

        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

    }

    init(supplyData: SupplyCfgData) {
        this.id = supplyData.id;
        this._name = supplyData.name;
        this.gold = supplyData.gold;
        this.exp = supplyData.exp;
        this.weight = supplyData.weight;
    }

    onBeginContact(self: Collider2D, other: Collider2D) {
        if (other.group == (1 << ColliderGroup.Supply_Range)) {
            this.isAttracted = true;
        }
    }

    onPickup() {
        PlayerData.Instance.addExp(this.exp);
        PlayerData.Instance.changeGold(this.gold);
        EventMgr.Instance.emit(Config.SUPPLY_PICKUP, this.node);
    }

    move(deltaTime: number) {
        const playerPos = this.playerNode.getWorldPosition();
        const supplyPos = this.node.getWorldPosition();
        let pos: Vec3 = playerPos.subtract(supplyPos);

        const distanceToPlayer = pos.length();
        //计算这一帧需要移动的距离
        const moveDistance = this.flySpeed * deltaTime;

        if (moveDistance >= distanceToPlayer) {
            this.node.setWorldPosition(playerPos);
            this.onPickup();
        } else {
            pos.normalize();
            pos.multiplyScalar(moveDistance);
            this.node.translate(pos);
        }

    }

  
    update(deltaTime: number) {
        if (this.isAttracted && this.playerNode) {
            this.move(deltaTime);
        }
    }

    onDestroy(): void {
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }
}


