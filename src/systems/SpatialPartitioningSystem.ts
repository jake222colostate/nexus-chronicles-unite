import { Vector3 } from 'three';

interface SpatialNode {
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  objects: string[];
  children?: SpatialNode[];
  level: number;
}

export class SpatialPartitioningSystem {
  private rootNode: SpatialNode;
  private maxObjectsPerNode = 10;
  private maxDepth = 6;
  private objectMap = new Map<string, { position: Vector3; data: any }>();

  constructor(worldBounds: { minX: number; maxX: number; minZ: number; maxZ: number }) {
    this.rootNode = {
      bounds: worldBounds,
      objects: [],
      level: 0
    };
  }

  // Add object to spatial system
  addObject(id: string, position: Vector3, data: any) {
    this.objectMap.set(id, { position, data });
    this.insertObject(this.rootNode, id, position);
  }

  // Remove object from spatial system
  removeObject(id: string) {
    const obj = this.objectMap.get(id);
    if (obj) {
      this.removeObjectFromNode(this.rootNode, id);
      this.objectMap.delete(id);
    }
  }

  // Get visible objects within camera frustum
  getVisibleObjects(cameraPosition: Vector3, viewDistance: number): Array<{ id: string; data: any }> {
    const visibleBounds = {
      minX: cameraPosition.x - viewDistance,
      maxX: cameraPosition.x + viewDistance,
      minZ: cameraPosition.z - viewDistance,
      maxZ: cameraPosition.z + viewDistance
    };

    const visibleIds: string[] = [];
    this.queryRegion(this.rootNode, visibleBounds, visibleIds);

    return visibleIds.map(id => {
      const obj = this.objectMap.get(id);
      return { id, data: obj?.data };
    }).filter(item => item.data);
  }

  // Get objects in specific chunk for streaming
  getChunkObjects(chunkX: number, chunkZ: number, chunkSize: number): Array<{ id: string; data: any }> {
    const bounds = {
      minX: chunkX * chunkSize,
      maxX: (chunkX + 1) * chunkSize,
      minZ: chunkZ * chunkSize,
      maxZ: (chunkZ + 1) * chunkSize
    };

    const chunkIds: string[] = [];
    this.queryRegion(this.rootNode, bounds, chunkIds);

    return chunkIds.map(id => {
      const obj = this.objectMap.get(id);
      return { id, data: obj?.data };
    }).filter(item => item.data);
  }

  private insertObject(node: SpatialNode, id: string, position: Vector3) {
    // Check if position is within node bounds
    if (!this.isPositionInBounds(position, node.bounds)) {
      return false;
    }

    // If node has children, try to insert into appropriate child
    if (node.children) {
      for (const child of node.children) {
        if (this.insertObject(child, id, position)) {
          return true;
        }
      }
      return false;
    }

    // Add to current node
    node.objects.push(id);

    // Split node if necessary
    if (node.objects.length > this.maxObjectsPerNode && node.level < this.maxDepth) {
      this.splitNode(node);
    }

    return true;
  }

  private splitNode(node: SpatialNode) {
    const { bounds } = node;
    const midX = (bounds.minX + bounds.maxX) / 2;
    const midZ = (bounds.minZ + bounds.maxZ) / 2;

    node.children = [
      // Top-left
      {
        bounds: { minX: bounds.minX, maxX: midX, minZ: bounds.minZ, maxZ: midZ },
        objects: [],
        level: node.level + 1
      },
      // Top-right
      {
        bounds: { minX: midX, maxX: bounds.maxX, minZ: bounds.minZ, maxZ: midZ },
        objects: [],
        level: node.level + 1
      },
      // Bottom-left
      {
        bounds: { minX: bounds.minX, maxX: midX, minZ: midZ, maxZ: bounds.maxZ },
        objects: [],
        level: node.level + 1
      },
      // Bottom-right
      {
        bounds: { minX: midX, maxX: bounds.maxX, minZ: midZ, maxZ: bounds.maxZ },
        objects: [],
        level: node.level + 1
      }
    ];

    // Redistribute objects to children
    const objectsToRedistribute = [...node.objects];
    node.objects = [];

    for (const objectId of objectsToRedistribute) {
      const obj = this.objectMap.get(objectId);
      if (obj) {
        let inserted = false;
        for (const child of node.children) {
          if (this.insertObject(child, objectId, obj.position)) {
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          // Keep in parent node if doesn't fit in any child
          node.objects.push(objectId);
        }
      }
    }
  }

  private isPositionInBounds(position: Vector3, bounds: SpatialNode['bounds']): boolean {
    return position.x >= bounds.minX && position.x < bounds.maxX &&
           position.z >= bounds.minZ && position.z < bounds.maxZ;
  }

  private queryRegion(node: SpatialNode, bounds: SpatialNode['bounds'], results: string[]) {
    // Check if node bounds intersect with query bounds
    if (!this.boundsIntersect(node.bounds, bounds)) {
      return;
    }

    // Add objects from this node
    results.push(...node.objects);

    // Query children
    if (node.children) {
      for (const child of node.children) {
        this.queryRegion(child, bounds, results);
      }
    }
  }

  private boundsIntersect(bounds1: SpatialNode['bounds'], bounds2: SpatialNode['bounds']): boolean {
    return !(bounds1.maxX < bounds2.minX || bounds1.minX > bounds2.maxX ||
             bounds1.maxZ < bounds2.minZ || bounds1.minZ > bounds2.maxZ);
  }

  private removeObjectFromNode(node: SpatialNode, id: string): boolean {
    const index = node.objects.indexOf(id);
    if (index !== -1) {
      node.objects.splice(index, 1);
      return true;
    }

    if (node.children) {
      for (const child of node.children) {
        if (this.removeObjectFromNode(child, id)) {
          return true;
        }
      }
    }

    return false;
  }
}
