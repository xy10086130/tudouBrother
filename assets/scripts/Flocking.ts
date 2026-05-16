import { _decorator, Component, Node, Vec3, error } from 'cc';
import { Enemy } from './Enemy'; // 导入Enemy类，用于类型安全
import { EnemyFactory } from './EnemyFactory';

const { ccclass, property } = _decorator;

@ccclass('Flocking')
export class Flocking extends Component {
    // 群聚参数
    @property
    neighborRadius: number = 200;      // 感知邻居的范围
    
    @property
    separationDistance: number = 80;   // 触发分离的最小距离
    
    @property
    separationWeight: number = 1.5;    // 分离力权重
    
    @property
    cohesionWeight: number = 1.0;      // 聚集力权重
    
    @property
    alignmentWeight: number = 0.8;     // 对齐力权重
    
    @property
    flockingWeight: number = 0.3;      // 群体行为整体影响权重

    @property
    sameTypeOnly: boolean = false;     // 是否只与相同类型的敌人抱团

    private enemy: Enemy = null;       // 引用Enemy组件
    private enemyType: string = '';    // 敌人类型
    private neighbors: Node[] = [];    // 邻居节点列表

    start() {
        // 获取Enemy组件
        this.enemy = this.getComponent(Enemy);
        if (!this.enemy) {
            return;
        }
        // 记录敌人类型
        this.enemyType = this.enemy.type;
    }

    /**
     * 初始化群聚参数
     */
    initFlockingParams(
        neighborRadius: number,
        separationDistance: number,
        separationWeight: number,
        cohesionWeight: number,
        alignmentWeight: number,
        flockingWeight: number,
        sameTypeOnly: boolean = false
    ) {
        this.neighborRadius = neighborRadius;
        this.separationDistance = separationDistance;
        this.separationWeight = separationWeight;
        this.cohesionWeight = cohesionWeight;
        this.alignmentWeight = alignmentWeight;
        this.flockingWeight = flockingWeight;
        this.sameTypeOnly = sameTypeOnly;
    }

    /**
     * 更新邻居列表
     * 对于fast类型敌人，只考虑相同类型的敌人作为邻居
     */
    updateNeighbors(): void {
        if (!EnemyFactory.Instance) {
            this.neighbors = [];
            return;
        }

        const allEnemies = EnemyFactory.Instance.getAllEnemyNodes();
        const currentPos = this.node.worldPosition;
        this.neighbors = [];

        for (const enemyNode of allEnemies) {
            // 排除自己
            if (enemyNode === this.node) continue;

            // 获取邻居的Enemy组件
            const neighborEnemy = enemyNode.getComponent(Enemy);
            if (!neighborEnemy) continue;

            // 如果开启了sameTypeOnly，只考虑相同类型的敌人
            if (this.sameTypeOnly && neighborEnemy.type !== this.enemyType) {
                continue;
            }

            // 计算距离
            const enemyPos = enemyNode.worldPosition;
            const distance = Vec3.distance(currentPos, enemyPos);

            // 如果距离在感知范围内，则加入邻居列表
            if (distance <= this.neighborRadius) {
                this.neighbors.push(enemyNode);
            }
        }
    }

    /**
     * 计算群聚力（分离、聚集、对齐的合力）
     */
    calculateFlockingForce(): Vec3 {
        this.updateNeighbors();
        
        // 如果没有邻居，返回零向量
        if (this.neighbors.length === 0) {
            return Vec3.ZERO;
        }

        // 计算三个力
        const separationForce = this.calculateSeparationForce();
        const cohesionForce = this.calculateCohesionForce();
        const alignmentForce = this.calculateAlignmentForce();

        // 加权合并
        const flockingForce = new Vec3();
        
        // 分离力
        separationForce.multiplyScalar(this.separationWeight);
        
        // 聚集力
        cohesionForce.multiplyScalar(this.cohesionWeight);
        
        // 对齐力
        alignmentForce.multiplyScalar(this.alignmentWeight);

        // 合并三个力
        Vec3.add(flockingForce, separationForce, cohesionForce);
        Vec3.add(flockingForce, flockingForce, alignmentForce);
        
        // 应用整体权重
        flockingForce.multiplyScalar(this.flockingWeight);

        // 归一化（保持方向，控制大小）
        if (!flockingForce.equals(Vec3.ZERO)) {
            flockingForce.normalize();
        }

        return flockingForce;
    }

    /**
     * 计算分离力（避免与邻居碰撞）
     */
    private calculateSeparationForce(): Vec3 {
        const force = new Vec3();
        const currentPos = this.node.worldPosition;

        for (const neighbor of this.neighbors) {
            const neighborPos = neighbor.worldPosition;
            const distance = Vec3.distance(currentPos, neighborPos);

            // 只在距离过近时施加分离力
            if (distance < this.separationDistance && distance > 0) {
                // 计算远离邻居的方向
                const awayDir = new Vec3();
                Vec3.subtract(awayDir, currentPos, neighborPos);
                awayDir.normalize();

                // 距离越近，分离力越强
                const strength = (this.separationDistance - distance) / this.separationDistance;
                awayDir.multiplyScalar(strength);

                Vec3.add(force, force, awayDir);
            }
        }

        return force;
    }

    /**
     * 计算聚集力
     */
    private calculateCohesionForce(): Vec3 {
        const center = new Vec3();
        const currentPos = this.node.worldPosition;

        // 计算所有邻居的中心位置
        for (const neighbor of this.neighbors) {
            Vec3.add(center, center, neighbor.worldPosition);
        }
        
        center.multiplyScalar(1 / this.neighbors.length);

        // 计算朝向中心的向量
        const toCenter = new Vec3();
        Vec3.subtract(toCenter, center, currentPos);
        
        if (!toCenter.equals(Vec3.ZERO)) {
            toCenter.normalize();
        }

        return toCenter;
    }

    /**
     * 计算对齐力
     */
    private calculateAlignmentForce(): Vec3 {
        const averageVelocity = new Vec3();

        // 计算所有邻居的平均速度方向
        for (const neighbor of this.neighbors) {
            const enemyComp = neighbor.getComponent(Enemy);
            if (enemyComp) {
                // 使用敌人的追踪方向作为速度方向
                Vec3.add(averageVelocity, averageVelocity, enemyComp.traceDir);
            }
        }
        
        averageVelocity.multiplyScalar(1 / this.neighbors.length);
        
        if (!averageVelocity.equals(Vec3.ZERO)) {
            averageVelocity.normalize();
        }

        return averageVelocity;
    }
}