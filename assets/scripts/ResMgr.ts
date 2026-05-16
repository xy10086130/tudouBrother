import { _decorator, Component, Node, Prefab, resources, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

export class ResMgr {
    private static instance = new ResMgr();
    private constructor() { }
    public static get Instance() {
        if (!ResMgr.instance) {
            ResMgr.instance = new ResMgr();
        }
        return ResMgr.instance;
    }

    private enemyPrefabBuffer: Map<string, Prefab> = new Map();
    private supplyPrefabBuffer: Map<string, Prefab> = new Map();
    upgradeIconBuffer: Map<string, SpriteFrame> = new Map();

    public getEnemyPrefab(name: string) {
        return this.enemyPrefabBuffer.get(name);
    }

    public getSupplyPrefab(name: string) {
        return this.supplyPrefabBuffer.get(name);
    }


    public getSinglePrefab(name: string) {
        let pre: Prefab = null;
        resources.load(`prefabs/${name}`, Prefab, (err, prefab) => {
            if (err) {
                console.error(err.message);
                return;
            }
            pre = prefab;
        })
        return pre;
    }

    public loadEnemyPrefabs(callback = null) {
        resources.loadDir("prefabs/enemyPrefabs", Prefab, (err, prefabs) => {
            if (err) {
                console.error(err.message);
                return;
            }

            this.enemyPrefabBuffer.clear();
            for (let prefab of prefabs) {
                this.enemyPrefabBuffer.set(prefab.name, prefab);
            }

            if (callback) {
                callback();
            }
        })
    }

    loadSupplyPrefabs(callback = null) {
        resources.loadDir("prefabs/supplyPrefabs", Prefab, (err, prefabs) => {
            if (err) {
                console.error(err.message);
                return;
            }

            this.supplyPrefabBuffer.clear();
            for (let prefab of prefabs) {
                this.supplyPrefabBuffer.set(prefab.name, prefab);
            }

            if (callback) {
                callback();
            }
        })
    }

    loadUpgradeIcons(callback = null) {
        resources.loadDir("ui/upgradeIcon", SpriteFrame, (err, sprites) => {
            if (err) {
                console.error(err.message);
                return;
            }

            this.upgradeIconBuffer.clear();
            for (let sprite of sprites) {
                this.upgradeIconBuffer.set(sprite.name, sprite);
            }
            if (callback) {
                callback();
            }
        })
    }

    loadSingleSpriteFrame(name: string) {
        let spriteFrame: SpriteFrame = null;
        resources.load(`enemy/${name}/spriteFrame`, SpriteFrame, (err, sprite) => {
            if (err) {
                console.error(err.message);
                return;
            }
            spriteFrame = sprite;
        })
        return spriteFrame;
    }
}


