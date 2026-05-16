import { _decorator, Component, instantiate, Node, NodePool, Prefab, tween, Animation } from 'cc';
import { Enemy } from './Enemy';
import { EventMgr } from './EventMgr';
import { Config } from './Config';
import { EnemyCfgData } from './EnemyCfgData';
import { ResMgr } from './ResMgr';
const { ccclass, property } = _decorator;

@ccclass('EnemyFactory')
export class EnemyFactory extends Component {
    public static Instance: EnemyFactory = null;

    enemyPrefab: Prefab = null;

    @property(Prefab)
    signalPrefab: Prefab = null;

    @property(Prefab)
    hitPrefab: Prefab = null;

    // 存活的敌人节点
    enemyNodes: Node[] = [];

    // 敌人对象池池
    private enemyPools: Map<string, NodePool> = new Map<string, NodePool>();

    //敌人出现信号对象池
    private signalPools: NodePool = new NodePool();

    //敌人死亡信号对象池
    private hitPools: NodePool = new NodePool();

    //群体生成 概率
    groupEnemyProbility: number = 0.6;
    minGroupSpawnDistance: number = 100;
    maxGroupSpawnDistance: number = 250;

    waitingForPrefabs: boolean = false;
    isPoolInitialized: boolean = false;

    protected onLoad(): void {
        EnemyFactory.Instance = this;
        EventMgr.Instance.on(Config.ENEMY_DEATH, this.enemyDeathListener, this);
        EventMgr.Instance.on(Config.ENEMY_CONFIG_LOADED, this.onEnemyConfigLoaded, this);
        EventMgr.Instance.on(Config.ENEMY_PREFAB_LOADED, this.onEnemyPrefabLoaded, this);
    }

    start() {

    }

    onEnemyConfigLoaded() {
        const enemyConfigs = Config.Instance.enemyCfgData;
        if (enemyConfigs.length > 0) {
            this.waitingForPrefabs = true;
        }
    }

    onEnemyPrefabLoaded() {
        if (this.waitingForPrefabs && !this.isPoolInitialized) {
            this.initPool();
        }
    }


    initPool(): void {
        const preloadCount = 20;
        const enemyConfigs = Config.Instance.enemyCfgData;

        for (let i = 0; i < preloadCount; i++) {
            const signalNode = instantiate(this.signalPrefab);
            signalNode.active = false;
            this.signalPools.put(signalNode);

            const hitNode = instantiate(this.hitPrefab);
            hitNode.active = false;
            this.hitPools.put(hitNode);
        }

        for (let config of enemyConfigs) {
            let pool = new NodePool();
            for (let i = 0; i < preloadCount; i++) {
                const prefab = ResMgr.Instance.getEnemyPrefab(config.name);
                if (!prefab) {
                    console.error("未找到enemy预制体：" + config.name);
                    continue;
                }
                const enemyNode = instantiate(prefab);
                //？？？？
                enemyNode.active = false;
                pool.put(enemyNode);
            }
            this.enemyPools.set(config.name, pool);

        }
        this.isPoolInitialized = true;
    }

    getEnemyFromPool(enemyName: string) {
        if (!this.isPoolInitialized) {
            console.warn("对象池未初始化，无法获取敌人");
            return null;
        }
        let enemyNode: Node = null;
        let pool = this.enemyPools.get(enemyName);

        if (pool && pool.size() > 0) {
            enemyNode = pool.get();

        } else {
            const enemyPrefab = ResMgr.Instance.getEnemyPrefab(enemyName);
            if (enemyPrefab) {
                enemyNode = instantiate(enemyPrefab);
                enemyNode.active = false;
            } else {
                console.error("未找到enemy预制体：" + enemyName);
                return null;
            }
        }
        return enemyNode;
    }

    getSignalFromPool() {
        if (this.signalPools.size() > 0) {
            return this.signalPools.get();
        }
        return instantiate(this.signalPrefab);
    }

    getHitSignalFromPool() {
        if (this.hitPools.size() > 0) {
            return this.hitPools.get();
        }
        return instantiate(this.hitPrefab);
    }

    createEnemy(enemyData: EnemyCfgData) {
        //敌人生成位置判断
        let randomNum = Math.random();
        if (enemyData.sameTypeOnly) {
            randomNum = 0.8;
        }
        let pos: { x: number, y: number };
        if (randomNum < this.groupEnemyProbility && this.enemyNodes.length > 0) {
            pos = this.getGroupEnemyPosition();
        } else {
            pos = this.getRandomPosition();
        }
        // 从对象池获取敌人节点
        const enemyNode = this.getEnemyFromPool(enemyData.name);
        enemyNode.setParent(this.node);
        const enemyComp = enemyNode.getComponent(Enemy);

        const signal = this.getSignalFromPool();
        signal.setParent(this.node);
        signal.setPosition(pos.x, pos.y);
        signal.active = true;
        signal.getComponent(Animation).play();

        tween(this)
            .delay(1)
            .call(() => {
                this.recycleSignal(signal);
                enemyNode.active = true;
                enemyComp.initAttribute(enemyData);
                enemyComp.getComponent(Animation).play();
                enemyNode.setPosition(pos.x, pos.y);
                this.addEnemyNode(enemyNode);
            })
            .start();
    }

    private recycleEnemy(enemyNode: Node): void {
        const enemyComp = enemyNode.getComponent(Enemy);
        enemyComp.reset();
        const enemyName = enemyComp._name;

        let pool = this.enemyPools.get(enemyName);
        // 放入对象池
        pool.put(enemyNode);

    }

    recycleSignal(signalNode: Node): void {
        signalNode.active = false;
        this.signalPools.put(signalNode);
    }

    recycleHitSignal(hitNode: Node): void {
        hitNode.active = false;
        this.hitPools.put(hitNode);
    }


    addEnemyNode(enemyNode: Node) {
        if (this.enemyNodes.indexOf(enemyNode) == -1) {
            this.enemyNodes.push(enemyNode);
        }
    }

    enemyDeathListener(enemyNode: Node) {
        const enemy = enemyNode.getComponent(Enemy);
        this.removeEnemyNode(enemyNode);

        this.recycleEnemy(enemyNode);

        const hitNode = this.getHitSignalFromPool();
        hitNode.setParent(this.node);
        hitNode.setPosition(enemyNode.getPosition());
        hitNode.active = true;
        hitNode.getComponent(Animation).play();
        tween(hitNode)
            .delay(0.3)
            .call(() => {
                this.recycleHitSignal(hitNode);
            })
            .start();
    }

    //在单个敌人附近生成敌人
    getGroupEnemyPosition(): { x: number, y: number } {
        if (this.enemyNodes.length == 0) {
            return this.getRandomPosition();
        }
        // 随机选择一个现有敌人作为"锚点"
        const randomIndex = ~~(Math.random() * this.enemyNodes.length);
        const anchorEnemy = this.enemyNodes[randomIndex];

        const anchorPos = anchorEnemy.getWorldPosition();
        // 在锚点周围指定范围内生成
        const angle = Math.random() * Math.PI * 2;//[0,2π]
        // 生成敌人的距离在 minGroupSpawnDistance 和 maxGroupSpawnDistance 之间
        const distance = this.minGroupSpawnDistance + Math.random() * (this.maxGroupSpawnDistance - this.minGroupSpawnDistance);

        //极坐标转换为直角坐标
        let pos = {
            x: anchorPos.x + Math.cos(angle) * distance,
            y: anchorPos.y + Math.sin(angle) * distance
        };

        return this.clampToMapBounds(pos);
    }

    private clampToMapBounds(pos: { x: number, y: number }): { x: number, y: number } {
        const margin = 100; // 增加一些边距，确保敌人在视野内
        const maxX = Config.map_WIDTH - margin;
        const minX = -Config.map_WIDTH + margin;
        const maxY = Config.map_HEIGHT - margin;
        const minY = -Config.map_HEIGHT + margin;

        return {
            x: Math.max(minX, Math.min(maxX, pos.x)),
            y: Math.max(minY, Math.min(maxY, pos.y))
        };
    }


    getRandomPosition(): { x: number, y: number } {
        const margin = 50; // 边界余量
        const edgeMargin = 300; // 距离边界的距离

        // 0-上，1-下，2-左，3-右，4-左上，5-右上，6-左下，7-右下
        const direction = Math.floor(Math.random() * 8);

        let x: number, y: number;

        switch (direction) {
            case 0: // 上
                x = (Math.random() * (Config.map_WIDTH * 2 - margin * 2)) - (Config.map_WIDTH - margin);
                y = Config.map_HEIGHT - edgeMargin;
                break;
            case 1: // 下
                x = (Math.random() * (Config.map_WIDTH * 2 - margin * 2)) - (Config.map_WIDTH - margin);
                y = -Config.map_HEIGHT + edgeMargin;
                break;
            case 2: // 左
                x = -Config.map_WIDTH + edgeMargin;
                y = (Math.random() * (Config.map_HEIGHT * 2 - margin * 2)) - (Config.map_HEIGHT - margin);
                break;
            case 3: // 右
                x = Config.map_WIDTH - edgeMargin;
                y = (Math.random() * (Config.map_HEIGHT * 2 - margin * 2)) - (Config.map_HEIGHT - margin);
                break;
            case 4: // 左上
                x = -Config.map_WIDTH + edgeMargin;
                y = Config.map_HEIGHT - edgeMargin;
                break;
            case 5: // 右上
                x = Config.map_WIDTH - edgeMargin;
                y = Config.map_HEIGHT - edgeMargin;
                break;
            case 6: // 左下
                x = -Config.map_WIDTH + edgeMargin;
                y = -Config.map_HEIGHT + edgeMargin;
                break;
            case 7: // 右下
                x = Config.map_WIDTH - edgeMargin;
                y = -Config.map_HEIGHT + edgeMargin;
                break;
            default:
                // 默认在地图中心
                x = 0;
                y = 0;
        }

        return { x, y };
    }

    getAllEnemyNodes(): Node[] {
        return this.enemyNodes;
    }



    removeEnemyNode(enemyNode: Node) {
        let index = this.enemyNodes.indexOf(enemyNode);
        if (index != -1) {
            this.enemyNodes.splice(index, 1);
        }
    }

    clearAllPool() {
        for (let pool of this.enemyPools.values()) {
            pool.clear();
        }
        this.enemyPools.clear();
    }

    update(deltaTime: number) {
        
    }

    protected onDestroy(): void {
        EventMgr.Instance.off(Config.ENEMY_DEATH, this.enemyDeathListener, this);
        EventMgr.Instance.off(Config.ENEMY_CONFIG_LOADED, this.onEnemyConfigLoaded, this);
        EventMgr.Instance.off(Config.ENEMY_PREFAB_LOADED, this.onEnemyPrefabLoaded, this);
        this.clearAllPool();
    }
}
