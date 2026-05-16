import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Node, Sprite, v3, Vec3 } from 'cc';
import { Config } from './Config';
import { FistMgr } from './weapon/FistMgr';
import { WaveState } from './WaveState';
import { PlayerData } from './PlayerData';
const { ccclass, property } = _decorator;


@ccclass('PlayerControl')
export class PlayerControl extends Component {

    public static Instance: PlayerControl = null;
    onLoad() {
        PlayerControl.Instance = this;
    }

    //player图片节点
    @property(Node)
    playerSprite: Node = null;
    //移动方向向量
    moveDir: Vec3 = v3(0, 0, 0)

    leftKeyDown: boolean = false;
    rightKeyDown: boolean = false;
    upKeyDown: boolean = false;
    downKeyDown: boolean = false;

    //上一次的朝向  1 向右 -1 向左
    lastDir: number = 1;

    baseSpeed: number = Config.cfg_Speed;
    speed: number = 0;

    weaponNodes: Node[] = [];

    start() {
        this.findWeapons();
        this.speed = this.baseSpeed;
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    speedIncrease(bonus: number) {
        this.speed = this.baseSpeed * (1 + bonus / 100);
    }

    findWeapons() {
        const children = this.node.children;
        for (let child of children) {
            if (child.name == "weapon") {
                this.weaponNodes.push(child);
            }
        }
    }

    reverseWeaponSprite() {
        for (let weapon of this.weaponNodes) {
            weapon.getChildByName("pic").scale = v3(this.playerSprite.scale.x, weapon.scale.y, weapon.scale.z);
        }
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.leftKeyDown = true;
                this.playerSprite.scale = v3(-1, 1, 1);
                this.reverseWeaponSprite();
                break;
            case KeyCode.KEY_D:
                this.rightKeyDown = true;
                this.playerSprite.scale = v3(1, 1, 1);
                this.reverseWeaponSprite();
                break;
            case KeyCode.KEY_W:
                this.upKeyDown = true;
                break;
            case KeyCode.KEY_S:
                this.downKeyDown = true;
                break;
        }
        this.updateMoveDir();
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.leftKeyDown = false;
                break;
            case KeyCode.KEY_D:
                this.rightKeyDown = false;
                break;
            case KeyCode.KEY_W:
                this.upKeyDown = false;
                break;
            case KeyCode.KEY_S:
                this.downKeyDown = false;
                break;
        }
        this.updateMoveDir();
    }

    updateMoveDir() {
        //重置移动方向向量
        this.moveDir.set(0, 0, 0);

        if (this.leftKeyDown && !this.rightKeyDown) {
            this.moveDir.x = -1;
            this.lastDir = -1;
        }
        else if (this.rightKeyDown && !this.leftKeyDown) {
            this.moveDir.x = 1;
            this.lastDir = 1;
        }
        else if (this.leftKeyDown && this.rightKeyDown) {
            this.moveDir.x = 0;
        }


        if (this.upKeyDown && !this.downKeyDown) {
            this.moveDir.y = 1;
        }
        else if (this.downKeyDown && !this.upKeyDown) {
            this.moveDir.y = -1;
        }
        else if (this.upKeyDown && this.downKeyDown) {
            this.moveDir.y = 0;
        }

        //向量归一化 确保移动速度一致
        if (this.moveDir.length() > 0) {
            this.moveDir.normalize();
        }
    }


    move(dt: number) {
        //检查是否有移动
        if (Config.waveState != WaveState.Ongoing) return;
        if (this.moveDir.length() > 0) {
            const moveX = this.moveDir.x * this.speed * dt;
            const moveY = this.moveDir.y * this.speed * dt;

            this.node.x += moveX;
            this.node.y += moveY;
            if (this.node.x >= 1570) {
                this.node.x = 1570;
            }
            else if (this.node.x <= -1570) {
                this.node.x = -1570;
            }
            if (this.node.y >= 1030) {
                this.node.y = 1030;
            }
            else if (this.node.y <= -1030) {
                this.node.y = -1030;
            }

        }

    }

    update(deltaTime: number) {
        this.move(deltaTime);
    }

    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
}














