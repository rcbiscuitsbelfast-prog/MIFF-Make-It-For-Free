import { StatsManager, Stat } from '../StatsManager';

test('golden stats flow', () => {
	// Test the StatsManager directly instead of through CLI
	const manager = new StatsManager();
	
	// Test list operation (should return empty initially)
	const listResult = manager.list();
	expect(listResult).toEqual([]);
	
	// Test create operation
	const createResult = manager.create('hero', [
		{ key: 'hp', base: 30 }
	]);
	expect(createResult).toBeDefined();
	
	// Test setStat operation
	manager.setStat('hero', 'atk', 8);
	
	// Test simulate operation
	const simulateResult = manager.simulate('hero');
	expect(simulateResult).toBeDefined();
	expect(simulateResult.total).toBe(38); // 30 + 8
	
	// Test get operation
	const getResult = manager.get('hero');
	expect(getResult).toBeDefined();
	expect(getResult!.stats).toHaveLength(2); // hp and atk
	
	// Verify the final state
	const finalList = manager.list();
	expect(finalList).toHaveLength(1);
	expect(finalList[0]).toBe('hero');
});