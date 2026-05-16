import { _decorator, Component, find, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraMove')
export class CameraMove extends Component {
    @property(Node)
    player: Node = null;

    ui: Node = null;
    start() {
        this.ui = find("Canvas/ui");
    }

    update(deltaTime: number) {
        if (this.player == null) {
            return;
        }
        this.node.x = this.player.x;
        this.node.y = this.player.y;
        if (this.player.x >= 722) {
            this.node.x = 722;
        } else if (this.player.x <= -722) {
            this.node.x = -722;
        }
        if (this.player.y >= 675) {
            this.node.y = 675;
        } else if (this.player.y <= -675) {
            this.node.y = -675;
        }

        //相机位置同步ui位置
        this.ui.x = this.node.x;
        this.ui.y = this.node.y;
    }
}


