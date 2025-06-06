
import React from 'react';
import { useThree } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { WizardStaff } from './WizardStaff';
import { ProjectileSystem } from './ProjectileSystem';
import { useEnemyDamageSystem, EnemyHealth } from '../hooks/useEnemyDamageSystem';
import { FloatingCombatText, useFloatingCombatText } from './FloatingCombatText';

interface WizardStaffWeaponProps {
  enemies: any[]; // Main enemy system data
  onEnemyHit: (enemyId: string) => void;
  upgradeLevel?: number;
  playerPosition?: { x: number; y: number; z: number };
  onEnemyKilled?: () => void;
  onManaGained?: (amount: number) => void;
  damageSystem: any; // Shared damage system from parent
}

export const WizardStaffWeapon: React.FC<WizardStaffWeaponProps> = ({
  enemies,
  onEnemyHit,
  upgradeLevel = 0,
  playerPosition = { x: 0, y: 0, z: 0 },
  onEnemyKilled,
  onManaGained,
  damageSystem
}) => {
  const { camera } = useThree();
  const { texts, addText } = useFloatingCombatText();

  // Early return if damage system not ready
  if (!damageSystem) {
    console.log('WizardStaffWeapon: Damage system not ready');
    return null;
  }

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

  // Convert main enemies to format expected by ProjectileSystem
  const enemiesWithHealth = React.useMemo(() => {
    if (!damageSystem) return [];
    
    return enemies.map(enemy => {
      const healthData = damageSystem.getEnemyHealth(enemy.id);
      if (healthData) {
        return healthData;
      }
      // If no health data, create a basic structure for collision detection
      return {
        id: enemy.id,
        currentHealth: 1,
        maxHealth: 1,
        position: enemy.position,
        lastHitTime: 0
      };
    }).filter(Boolean);
  }, [enemies, damageSystem]);

  // Calculate weapon damage based on upgrade level
  const weaponDamage = React.useMemo(() => {
    const baseDamage = damageSystem.projectileDamage || 5;
    const upgradeBonus = upgradeLevel * 3; // Significant damage increase per upgrade
    return baseDamage + upgradeBonus;
  }, [damageSystem.projectileDamage, upgradeLevel]);

  return (
    <group>
      {/* Wizard Staff (hidden) */}
      <WizardStaff visible={false} />
      
      {/* Projectile System - uses enemies with health data */}
      <ProjectileSystem
        enemies={enemiesWithHealth}
        onEnemyHit={handleEnemyHit}
        projectileDamage={weaponDamage}
        upgradeLevel={upgradeLevel}
      />
      
      {/* Floating Combat Text */}
      <FloatingCombatText texts={texts} />
    </group>
  );
};
