
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

  // Handle enemy hits from projectiles - this is the main damage handler
  const handleEnemyHit = React.useCallback((enemyId: string, damage: number) => {
    console.log(`WizardStaffWeapon: Enemy ${enemyId} hit for ${damage} damage`);
    
    const enemyHealth = damageSystem.getEnemyHealth(enemyId);
    if (!enemyHealth) {
      console.log(`Enemy ${enemyId} not found in damage system - skipping damage`);
      return;
    }

    // Deal damage through the damage system
    damageSystem.damageEnemy(enemyId, damage);
    
    // Show floating combat text
    const position = new Vector3(...enemyHealth.position);
    addText(`-${damage}`, position, "#FF6666");

    // Check if enemy died after damage
    const updatedHealth = damageSystem.getEnemyHealth(enemyId);
    if (updatedHealth && updatedHealth.currentHealth <= 0) {
      console.log(`Enemy ${enemyId} killed!`);
      
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
      
      // Remove from main enemy system
      onEnemyHit(enemyId);
      
      // Remove enemy from damage system after delay
      setTimeout(() => {
        damageSystem.removeEnemy(enemyId);
      }, 1000);
    }
  }, [damageSystem, addText, upgradeLevel, onManaGained, onEnemyKilled, onEnemyHit]);

  return (
    <group>
      {/* Wizard Staff (hidden) */}
      <WizardStaff visible={false} />
      
      {/* Projectile System - uses the damage system's enemy health data */}
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
