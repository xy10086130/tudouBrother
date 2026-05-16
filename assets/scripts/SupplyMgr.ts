import { _decorator, Component, instantiate, Node, NodePool, Prefab } from 'cc';
import { Config } from './Config';
import { EventMgr } from './EventMgr';
import { ResMgr } from './ResMgr';
import { SupplyCfgData } from './SupplyCfgData';
import { Supply } from './Supply';
const { ccclass, property } = _decorator;

@ccclass('SupplyMgr')
export class SupplyMgr extends Component {

    supplyPool: Map<string, NodePool> = new Map<string, NodePool>();
    waitingForPrefabs: boolean = false;
    isPoolInitialized: boolean = false;
    supplyPrefab: Prefab = null;
    start() {
        EventMgr.Instance.on(Config.SUPPLY_CONFIG_LOADED, this.onSupplyConfigLoaded, this);
        EventMgr.Instance.on(Config.SUPPLY_PREFAB_LOADED, this.onSupplyPrefabLoaded, this);
        EventMgr.Instance.on(Config.ENEMY_DEATH, this.onEnemyDeath, this);
        EventMgr.Instance.on(Config.SUPPLY_PICKUP, this.onSupplyPickup, this);
    }

    onSupplyConfigLoaded() {
        const supplyConfigs = Config.Instance.supplyCfgData;
        if (supplyConfigs && supplyConfigs.length > 0) {
            this.waitingForPrefabs = true;
        }
    }

    onSupplyPrefabLoaded() {
        if (this.waitingForPrefabs && !this.isPoolInitialized) {
            this.initSupplyPool();
        }
    }


    initSupplyPool() {
        const preloadCount = 20;
        //这里有一个先后顺序的问题，数据配置的读取和对象池的初始化不能颠倒
        const supplyConfigs = Config.Instance.supplyCfgData;

        for (const config of supplyConfigs) {
            const pool = new NodePool();
            for (let i = 0; i < preloadCount; i++) {
                const prefab = ResMgr.Instance.getSupplyPrefab(config.name);
                if (!prefab) {
                    console.error("未找到补给预制体：" + config.name);
                    continue;
                }
                const supplyNode = instantiate(prefab);
                pool.put(supplyNode);
            }
            this.supplyPool.set(config.name, pool);
        }
        this.isPoolInitialized = true;
    }

    getSupplyFromPool(supplyName: string) {
        if (!this.isPoolInitialized) {
            console.warn("对象池未初始化，无法获取补给");
            return null;
        }
        let supplyNode: Node = null;
        let pool = this.supplyPool.get(supplyName);
        if (pool.size() > 0) {
            supplyNode = pool.get();
        } else {
            const supplyPrefab = ResMgr.Instance.getSupplyPrefab(supplyName);
            supplyNode = instantiate(supplyPrefab);
        }
        return supplyNode;
    }

    onEnemyDeath(enemyNode: Node) {
        const supplyData = this.getSupplyDataRandom();
        if (supplyData) {
            this.createSupply(supplyData, enemyNode);
        }
    }

    getSupplyDataRandom() {
        const supplyConfigs = Config.Instance.supplyCfgData;

        let totalWeight = 0;
        for (const config of supplyConfigs) {
            totalWeight += config.weight;
        }
        const randomValue = Math.random() * totalWeight;

        let accumulatedWeight = 0;
        for (const config of supplyConfigs) {
            accumulatedWeight += config.weight;
            if (randomValue <= accumulatedWeight) {
                return config;
            }
        }
        return supplyConfigs[0];
    }

    createSupply(supplyData: SupplyCfgData, enemyNode: Node) {
        const supplyNode = this.getSupplyFromPool(supplyData.name);

        if (!supplyNode) {
            console.error("无法获取补给节点");
            return;
        }

        // 重要：必须设置父节点
        supplyNode.setParent(this.node);
        const enemyPos = enemyNode.getPosition();

        // 计算随机偏移
        const offsetX = (Math.random() - 0.5) * 50;
        const offsetY = (Math.random() - 0.5) * 50;

        // 使用世界坐标设置位置
        const supplyPos = {
            x: enemyPos.x + offsetX,
            y: enemyPos.y + offsetY
        };

        // 设置补给的世界坐标
        supplyNode.setPosition(supplyPos.x, supplyPos.y, 0);
        supplyNode.active = true;

        const supplyComp = supplyNode.getComponent(Supply);
        if (supplyComp) {
            supplyComp.init(supplyData);
        } else {
            console.error("补给节点没有Supply组件");
        }
    }

    onSupplyPickup(supplyNode: Node) {
        this.recycleSupply(supplyNode);
    }

    private recycleSupply(supplyNode: Node): void {
        const supply = supplyNode.getComponent(Supply);
        if (!supply) {
            console.error("补给节点没有Supply组件");
            return;
        }
        const supplyName = supply._name;
        let pool = this.supplyPool.get(supplyName);
        // 停用节点并放回对象池
        supplyNode.active = false;
        supply.isAttracted = false;
        supplyNode.removeFromParent();
        pool.put(supplyNode);
    }

    update(deltaTime: number) {

    }

    clearAllPool() {
        for (let pool of this.supplyPool.values()) {
            pool.clear();
        }
        this.supplyPool.clear();
    }

    protected onDestroy(): void {
        EventMgr.Instance.off(Config.ENEMY_DEATH, this.onEnemyDeath, this);
        EventMgr.Instance.off(Config.SUPPLY_PICKUP, this.onSupplyPickup, this);
        EventMgr.Instance.off(Config.SUPPLY_CONFIG_LOADED, this.onSupplyConfigLoaded, this);
        EventMgr.Instance.off(Config.SUPPLY_PREFAB_LOADED, this.onSupplyPrefabLoaded, this);
        this.clearAllPool();
    }
}


