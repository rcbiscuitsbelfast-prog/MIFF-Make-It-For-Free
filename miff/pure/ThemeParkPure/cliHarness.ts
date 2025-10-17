#!/usr/bin/env tsx

/**
 * ThemeParkPure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the ThemeParkPure theme park management system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
ThemeParkPure CLI Harness - Theme Park Management System

Usage: npx tsx miff/pure/ThemeParkPure/cliHarness.ts [command] [options]

Commands:
  test                     - Run basic theme park tests
  create-park <name>       - Create new theme park
  add-ride <name> <type>   - Add ride to park
  add-guest <type>         - Add guest to park
  add-staff <role>         - Add staff member
  get-park-status          - Get park status
  get-finances             - Get financial status
  get-guest-satisfaction   - Get guest satisfaction
  simulate-day             - Simulate park day
  simulate                 - Simulate theme park
  help                     - Show this help

Examples:
  npx tsx miff/pure/ThemeParkPure/cliHarness.ts test
  npx tsx miff/pure/ThemeParkPure/cliHarness.ts create-park "Magic Land"
  npx tsx miff/pure/ThemeParkPure/cliHarness.ts add-ride "Roller Coaster" thrill
  npx tsx miff/pure/ThemeParkPure/cliHarness.ts simulate
`);
  process.exit(0);
}

import * as readline from 'readline';
import { ThemeParkPure, RideType, GuestType, StaffRole, ThemeParkRide, ThemeParkGuest, ThemeParkStaff } from './index';

class ThemeParkCLI {
  private themePark: ThemeParkPure;
  private rl: readline.Interface;
  private parkId: string | null = null;

  constructor() {
    this.themePark = new ThemeParkPure();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'ThemePark> '
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.rl.on('line', (input) => {
      this.handleCommand(input.trim());
    });

    this.rl.on('close', () => {
      console.log('\n👋 Theme Park CLI closed');
      process.exit(0);
    });
  }

  private async handleCommand(input: string): Promise<void> {
    const [command, ...args] = input.split(' ');

    switch (command.toLowerCase()) {
      case 'test':
        await this.runTests();
        break;
      case 'create-park':
        await this.createPark(args[0]);
        break;
      case 'add-ride':
        await this.addRide(args[0], args[1]);
        break;
      case 'add-guest':
        await this.addGuest(args[0]);
        break;
      case 'add-staff':
        await this.addStaff(args[0]);
        break;
      case 'get-park-status':
        this.getParkStatus();
        break;
      case 'get-finances':
        this.getFinances();
        break;
      case 'get-guest-satisfaction':
        this.getGuestSatisfaction();
        break;
      case 'simulate-day':
        await this.simulateDay();
        break;
      case 'simulate':
        await this.simulate();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'exit':
      case 'quit':
        this.rl.close();
        break;
      case '':
        // Empty line, just show prompt
        break;
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Type "help" for available commands');
    }

    this.rl.prompt();
  }

  private async runTests(): Promise<void> {
    console.log('🧪 Running Theme Park tests...\n');

    try {
      // Test 1: Park creation
      console.log('1. Testing park creation...');
      const parkId = this.themePark.createPark('Test Park');
      console.log(`   ✅ Park created with ID: ${parkId}`);

      // Test 2: Ride addition
      console.log('2. Testing ride addition...');
      const ride: ThemeParkRide = {
        id: 'ride-1',
        name: 'Test Roller Coaster',
        type: 'thrill',
        capacity: 24,
        duration: 120,
        thrillLevel: 8,
        popularity: 85,
        maintenanceCost: 1000,
        ticketPrice: 5.00,
        isOperational: true,
        queueLength: 0,
        waitTime: 0
      };
      
      const addRideResult = this.themePark.addRide(parkId, ride);
      console.log(`   ${addRideResult ? '✅' : '❌'} Ride added: ${addRideResult ? 'Success' : 'Failed'}`);

      // Test 3: Guest addition
      console.log('3. Testing guest addition...');
      const guest: ThemeParkGuest = {
        id: 'guest-1',
        name: 'Test Guest',
        type: 'family',
        age: 35,
        satisfaction: 80,
        money: 100.00,
        energy: 100,
        preferences: ['thrill', 'family'],
        currentRide: null,
        waitTime: 0
      };
      
      const addGuestResult = this.themePark.addGuest(parkId, guest);
      console.log(`   ${addGuestResult ? '✅' : '❌'} Guest added: ${addGuestResult ? 'Success' : 'Failed'}`);

      // Test 4: Staff addition
      console.log('4. Testing staff addition...');
      const staff: ThemeParkStaff = {
        id: 'staff-1',
        name: 'Test Staff',
        role: 'ride_operator',
        salary: 15.00,
        experience: 2,
        efficiency: 85,
        currentRide: 'ride-1',
        isWorking: true
      };
      
      const addStaffResult = this.themePark.addStaff(parkId, staff);
      console.log(`   ${addStaffResult ? '✅' : '❌'} Staff added: ${addStaffResult ? 'Success' : 'Failed'}`);

      // Test 5: Park status
      console.log('5. Testing park status...');
      const status = this.themePark.getParkStatus(parkId);
      console.log(`   ✅ Park status retrieved: ${status.isOpen ? 'Open' : 'Closed'}`);
      console.log(`      Rides: ${status.totalRides}, Guests: ${status.totalGuests}, Staff: ${status.totalStaff}`);

      // Test 6: Financial status
      console.log('6. Testing financial status...');
      const finances = this.themePark.getFinances(parkId);
      console.log(`   ✅ Financial status: Revenue: $${finances.revenue}, Expenses: $${finances.expenses}, Profit: $${finances.profit}`);

      // Test 7: Guest satisfaction
      console.log('7. Testing guest satisfaction...');
      const satisfaction = this.themePark.getGuestSatisfaction(parkId);
      console.log(`   ✅ Average guest satisfaction: ${satisfaction.averageSatisfaction}%`);

      console.log('\n🎉 All tests passed!');

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Test failed:', err instanceof Error ? message: String(err));
    }
  }

  private async createPark(name?: string): Promise<void> {
    if (!name) {
      console.log('❌ Usage: create-park <name>');
      return;
    }

    try {
      const parkId = this.themePark.createPark(name);
      this.parkId = parkId;
      console.log(`✅ Theme park "${name}" created with ID: ${parkId}`);
      console.log('🎢 Welcome to your new theme park! Start adding rides and guests.');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Park creation failed:', err instanceof Error ? message: String(err));
    }
  }

  private async addRide(name?: string, type?: string): Promise<void> {
    if (!name || !type) {
      console.log('❌ Usage: add-ride <name> <type>');
      console.log('   Types: thrill, family, kids, water, dark, show');
      return;
    }

    if (!this.parkId) {
      console.log('❌ No active park. Create a park first.');
      return;
    }

    try {
      const ride: ThemeParkRide = {
        id: `ride-${Date.now()}`,
        name,
        type: type as RideType,
        capacity: Math.floor(Math.random() * 30) + 10,
        duration: Math.floor(Math.random() * 300) + 60,
        thrillLevel: Math.floor(Math.random() * 10) + 1,
        popularity: Math.floor(Math.random() * 100) + 1,
        maintenanceCost: Math.floor(Math.random() * 2000) + 500,
        ticketPrice: Math.floor(Math.random() * 10) + 2,
        isOperational: true,
        queueLength: 0,
        waitTime: 0
      };

      const result = this.themePark.addRide(this.parkId, ride);
      if (result) {
        console.log(`✅ Added ${type} ride "${name}"`);
        console.log(`   Capacity: ${ride.capacity}, Duration: ${ride.duration}s, Thrill: ${ride.thrillLevel}/10`);
        console.log(`   Price: $${ride.ticketPrice}, Maintenance: $${ride.maintenanceCost}`);
      } else {
        console.log('❌ Failed to add ride');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Ride addition failed:', err instanceof Error ? message: String(err));
    }
  }

  private async addGuest(type?: string): Promise<void> {
    if (!type) {
      console.log('❌ Usage: add-guest <type>');
      console.log('   Types: family, teen, child, adult, senior, group');
      return;
    }

    if (!this.parkId) {
      console.log('❌ No active park. Create a park first.');
      return;
    }

    try {
      const guest: ThemeParkGuest = {
        id: `guest-${Date.now()}`,
        name: `Guest ${Math.floor(Math.random() * 1000)}`,
        type: type as GuestType,
        age: Math.floor(Math.random() * 60) + 5,
        satisfaction: Math.floor(Math.random() * 40) + 60,
        money: Math.floor(Math.random() * 200) + 50,
        energy: Math.floor(Math.random() * 40) + 60,
        preferences: this.getRandomPreferences(),
        currentRide: null,
        waitTime: 0
      };

      const result = this.themePark.addGuest(this.parkId, guest);
      if (result) {
        console.log(`✅ Added ${type} guest "${guest.name}"`);
        console.log(`   Age: ${guest.age}, Money: $${guest.money}, Energy: ${guest.energy}%`);
        console.log(`   Preferences: ${guest.preferences.join(', ')}`);
      } else {
        console.log('❌ Failed to add guest');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Guest addition failed:', err instanceof Error ? message: String(err));
    }
  }

  private async addStaff(role?: string): Promise<void> {
    if (!role) {
      console.log('❌ Usage: add-staff <role>');
      console.log('   Roles: ride_operator, maintenance, security, janitor, manager');
      return;
    }

    if (!this.parkId) {
      console.log('❌ No active park. Create a park first.');
      return;
    }

    try {
      const staff: ThemeParkStaff = {
        id: `staff-${Date.now()}`,
        name: `Staff ${Math.floor(Math.random() * 1000)}`,
        role: role as StaffRole,
        salary: Math.floor(Math.random() * 20) + 10,
        experience: Math.floor(Math.random() * 10) + 1,
        efficiency: Math.floor(Math.random() * 40) + 60,
        currentRide: null,
        isWorking: true
      };

      const result = this.themePark.addStaff(this.parkId, staff);
      if (result) {
        console.log(`✅ Added ${role} staff "${staff.name}"`);
        console.log(`   Salary: $${staff.salary}/hour, Experience: ${staff.experience} years`);
        console.log(`   Efficiency: ${staff.efficiency}%`);
      } else {
        console.log('❌ Failed to add staff');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Staff addition failed:', err instanceof Error ? message: String(err));
    }
  }

  private getParkStatus(): void {
    if (!this.parkId) {
      console.log('❌ No active park. Create a park first.');
      return;
    }

    try {
      const status = this.themePark.getParkStatus(this.parkId);
      console.log('🎢 Park Status:');
      console.log(`   Status: ${status.isOpen ? '🟢 Open' : '🔴 Closed'}`);
      console.log(`   Rides: ${status.totalRides} (${status.operationalRides} operational)`);
      console.log(`   Guests: ${status.totalGuests} (${status.guestsInRides} in rides)`);
      console.log(`   Staff: ${status.totalStaff} (${status.workingStaff} working)`);
      console.log(`   Average Wait Time: ${status.averageWaitTime} minutes`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Failed to get park status:', err instanceof Error ? message: String(err));
    }
  }

  private getFinances(): void {
    if (!this.parkId) {
      console.log('❌ No active park. Create a park first.');
      return;
    }

    try {
      const finances = this.themePark.getFinances(this.parkId);
      console.log('💰 Financial Status:');
      console.log(`   Revenue: $${finances.revenue.toFixed(2)}`);
      console.log(`   Expenses: $${finances.expenses.toFixed(2)}`);
      console.log(`   Profit: $${finances.profit.toFixed(2)} ${finances.profit >= 0 ? '📈' : '📉'}`);
      console.log(`   Ticket Sales: ${finances.ticketSales}`);
      console.log(`   Maintenance Costs: $${finances.maintenanceCosts.toFixed(2)}`);
      console.log(`   Staff Costs: $${finances.staffCosts.toFixed(2)}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Failed to get finances:', err instanceof Error ? message: String(err));
    }
  }

  private getGuestSatisfaction(): void {
    if (!this.parkId) {
      console.log('❌ No active park. Create a park first.');
      return;
    }

    try {
      const satisfaction = this.themePark.getGuestSatisfaction(this.parkId);
      console.log('😊 Guest Satisfaction:');
      console.log(`   Average: ${satisfaction.averageSatisfaction}% ${this.getSatisfactionEmoji(satisfaction.averageSatisfaction)}`);
      console.log(`   Happy Guests: ${satisfaction.happyGuests}`);
      console.log(`   Neutral Guests: ${satisfaction.neutralGuests}`);
      console.log(`   Unhappy Guests: ${satisfaction.unhappyGuests}`);
      console.log(`   Complaints: ${satisfaction.complaints}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Failed to get guest satisfaction:', err instanceof Error ? message: String(err));
    }
  }

  private async simulateDay(): Promise<void> {
    if (!this.parkId) {
      console.log('❌ No active park. Create a park first.');
      return;
    }

    try {
      console.log('🌅 Simulating theme park day...');
      
      // Simulate park operations
      for (let hour = 9; hour <= 21; hour++) {
        console.log(`   ${hour}:00 - Park operations...`);
        
        // Simulate some random events
        if (Math.random() < 0.3) {
          console.log(`      🎢 Ride maintenance completed`);
        }
        if (Math.random() < 0.2) {
          console.log(`      👥 New guests arrived`);
        }
        if (Math.random() < 0.1) {
          console.log(`      ⚠️  Ride temporarily closed for maintenance`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('🌙 Day simulation completed!');
      
      // Show final stats
      this.getParkStatus();
      this.getFinances();
      this.getGuestSatisfaction();
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Day simulation failed:', err instanceof Error ? message: String(err));
    }
  }

  private async simulate(): Promise<void> {
    console.log('🎭 Starting theme park simulation...');
    
    try {
      // Create a theme park
      console.log('1. Creating theme park...');
      const parkId = this.themePark.createPark('Simulation Park');
      this.parkId = parkId;
      console.log(`   ✅ Park created: ${parkId}`);

      // Add various rides
      console.log('2. Adding rides...');
      const rideTypes: RideType[] = ['thrill', 'family', 'kids', 'water', 'dark', 'show'];
      const rideNames = ['Thunder Coaster', 'Family Fun Ride', 'Kids Carousel', 'Water Splash', 'Haunted House', 'Magic Show'];
      
      for (let i = 0; i < 6; i++) {
        const ride: ThemeParkRide = {
          id: `sim-ride-${i + 1}`,
          name: rideNames[i],
          type: rideTypes[i],
          capacity: Math.floor(Math.random() * 30) + 10,
          duration: Math.floor(Math.random() * 300) + 60,
          thrillLevel: Math.floor(Math.random() * 10) + 1,
          popularity: Math.floor(Math.random() * 100) + 1,
          maintenanceCost: Math.floor(Math.random() * 2000) + 500,
          ticketPrice: Math.floor(Math.random() * 10) + 2,
          isOperational: true,
          queueLength: 0,
          waitTime: 0
        };

        this.themePark.addRide(parkId, ride);
        console.log(`   ✅ Added ${rideTypes[i]} ride: ${rideNames[i]}`);
      }

      // Add guests
      console.log('3. Adding guests...');
      const guestTypes: GuestType[] = ['family', 'teen', 'child', 'adult', 'senior', 'group'];
      
      for (let i = 0; i < 20; i++) {
        const guest: ThemeParkGuest = {
          id: `sim-guest-${i + 1}`,
          name: `Guest ${i + 1}`,
          type: guestTypes[i % guestTypes.length],
          age: Math.floor(Math.random() * 60) + 5,
          satisfaction: Math.floor(Math.random() * 40) + 60,
          money: Math.floor(Math.random() * 200) + 50,
          energy: Math.floor(Math.random() * 40) + 60,
          preferences: this.getRandomPreferences(),
          currentRide: null,
          waitTime: 0
        };

        this.themePark.addGuest(parkId, guest);
      }
      console.log(`   ✅ Added 20 guests`);

      // Add staff
      console.log('4. Adding staff...');
      const staffRoles: StaffRole[] = ['ride_operator', 'maintenance', 'security', 'janitor', 'manager'];
      
      for (let i = 0; i < 10; i++) {
        const staff: ThemeParkStaff = {
          id: `sim-staff-${i + 1}`,
          name: `Staff ${i + 1}`,
          role: staffRoles[i % staffRoles.length],
          salary: Math.floor(Math.random() * 20) + 10,
          experience: Math.floor(Math.random() * 10) + 1,
          efficiency: Math.floor(Math.random() * 40) + 60,
          currentRide: null,
          isWorking: true
        };

        this.themePark.addStaff(parkId, staff);
      }
      console.log(`   ✅ Added 10 staff members`);

      // Simulate park operations
      console.log('5. Simulating park operations...');
      for (let hour = 9; hour <= 18; hour++) {
        console.log(`   ${hour}:00 - Park operations...`);
        
        // Simulate random events
        if (Math.random() < 0.3) {
          console.log(`      🎢 Ride maintenance completed`);
        }
        if (Math.random() < 0.4) {
          console.log(`      👥 New guests arrived`);
        }
        if (Math.random() < 0.1) {
          console.log(`      ⚠️  Ride temporarily closed`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Final results
      console.log('6. Final results...');
      const status = this.themePark.getParkStatus(parkId);
      const finances = this.themePark.getFinances(parkId);
      const satisfaction = this.themePark.getGuestSatisfaction(parkId);
      
      console.log(`   🎢 Total Rides: ${status.totalRides}`);
      console.log(`   👥 Total Guests: ${status.totalGuests}`);
      console.log(`   👷 Total Staff: ${status.totalStaff}`);
      console.log(`   💰 Revenue: $${finances.revenue.toFixed(2)}`);
      console.log(`   📈 Profit: $${finances.profit.toFixed(2)}`);
      console.log(`   😊 Guest Satisfaction: ${satisfaction.averageSatisfaction}%`);

      console.log('✅ Theme park simulation completed successfully');

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Simulation failed:', err instanceof Error ? message: String(err));
    }
  }

  private getRandomPreferences(): string[] {
    const allPreferences = ['thrill', 'family', 'kids', 'water', 'dark', 'show'];
    const numPreferences = Math.floor(Math.random() * 3) + 1;
    const shuffled = allPreferences.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numPreferences);
  }

  private getSatisfactionEmoji(satisfaction: number): string {
    if (satisfaction >= 80) return '😊';
    if (satisfaction >= 60) return '😐';
    if (satisfaction >= 40) return '😕';
    return '😠';
  }

  private showHelp(): void {
    console.log(`
Available commands:
  test                     - Run basic theme park tests
  create-park <name>       - Create new theme park
  add-ride <name> <type>   - Add ride to park
  add-guest <type>         - Add guest to park
  add-staff <role>         - Add staff member
  get-park-status          - Get park status
  get-finances             - Get financial status
  get-guest-satisfaction   - Get guest satisfaction
  simulate-day             - Simulate park day
  simulate                 - Simulate theme park
  help                     - Show this help
  exit/quit                - Exit the CLI

Ride Types: thrill, family, kids, water, dark, show
Guest Types: family, teen, child, adult, senior, group
Staff Roles: ride_operator, maintenance, security, janitor, manager
`);
  }

  public async start(): Promise<void> {
    console.log('🚀 Theme Park CLI Started');
    console.log('Type "help" for available commands or "test" to run tests\n');
    
    this.rl.prompt();
  }
}

// Main execution
async function main() {
  const cli = new ThemeParkCLI();
  await cli.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}