
import React from 'react';
import { useThree } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { WizardStaff } from './WizardStaff';
import { ProjectileSystem } from './ProjectileSystem';
import { useEnemyDamageSystem, EnemyHealth } from '../hooks/useEnemyDamageSystem';
import { FloatingCombatText, useFloatingCombatText } from './FloatingCombatText';

interface WizardStaffWeaponProps {
  enemies: any[]; // Legacy enemy data
  onEnemyHit: (enemyId: string) => void;
  upgradeLevel?: number;
  playerPosition?: { x: number; y: number; z: number };
  onEnemyKilled?: () => void;
  onManaGained?: (amount: number) => void;
}

export const WizardStaffWeapon: React.FC<WizardStaffWeaponProps> = ({
  enemies,
  onEnemyHit,
  upgradeLevel = 0,
  playerPosition = { x: 0, y: 0, z: 0 },
  onEnemyKilled,
  onManaGained
}) => {
  const { camera } = useThree();
  const { texts, addText } = useFloatingCombatText();
  
  const damageSystem = useEnemyDamageSystem({
    playerZ: playerPosition.z,
    upgradeLevel
  });

  // Initialize ALL enemies in damage system - this was the missing piece
  React.useEffect(() => {
    enemies.forEach(enemy => {
      // Check if enemy exists in damage system, if not initialize it
      if (!damageSystem.getEnemyHealth(enemy.id)) {
        console.log(`Initializing enemy ${enemy.id} in damage system`);
        damageSystem.initializeEnemy(enemy.id, enemy.position);
      }
    });
    
    // Clean up enemies that no longer exist in the main enemy list
    const currentEnemyIds = new Set(enemies.map(e => e.id));
    damageSystem.enemyHealths.forEach(healthEnemy => {
      if (!currentEnemyIds.has(healthEnemy.id)) {
        console.log(`Removing stale enemy ${healthEnemy.id} from damage system`);
        damageSystem.removeEnemy(healthEnemy.id);
      }
    });
  }, [enemies, damageSystem]);

  // Handle enemy hits from projectiles
  const handleEnemyHit = React.useCallback((enemyId: string, damage: number) => {
    const enemyHealth = damageSystem.getEnemyHealth(enemyId);
    if (!enemyHealth) {
      console.log(`Enemy ${enemyId} not found in damage system, attempting to initialize`);
      // Try to find and initialize the enemy
      const legacyEnemy = enemies.find(e => e.id === enemyId);
      if (legacyEnemy) {
        damageSystem.initializeEnemy(enemyId, legacyEnemy.position);
      }
      return;
    }

    // Deal damage
    damageSystem.damageEnemy(enemyId, damage);
    
    // Show floating combat text
    const position = new Vector3(...enemyHealth.position);
    addText(`-${damage}`, position, "#FF6666");

    // Check if enemy died
    const updatedHealth = damageSystem.getEnemyHealth(enemyId);
    if (updatedHealth && updatedHealth.currentHealth <= 0) {
      // Award mana
      const manaReward = 10 + Math.floor(upgradeLevel * 2);
      if (onManaGained) {
        onManaGained(manaReward);
      }
      
      // Show mana reward text
      addText(`+${manaReward} Mana`, position, "#00FFFF");
      
      // Notify of kill
      if (onEnemyKilled) {
        onEnemyKilled();
      }
      
      // Remove enemy after delay
      setTimeout(() => {
        damageSystem.removeEnemy(enemyId);
      }, 1000);
    }

    // Legacy callback
    onEnemyHit(enemyId);
  }, [damageSystem, addText, upgradeLevel, onManaGained, onEnemyKilled, onEnemyHit, enemies]);

  return (
    <group>
      {/* Wizard Staff (hidden) */}
      <WizardStaff visible={false} />
      
      {/* Projectile System - now uses combined enemy data */}
      <ProjectileSystem
        enemies={damageSystem.enemyHealths}
        onEnemyHit={handleEnemyHit}
        projectileDamage={damageSystem.projectileDamage}
        upgradeLevel={upgradeLevel}
      />
      
      {/* Floating Combat Text */}
      <FloatingCombatText texts={texts} />
    </group>
  );
};
