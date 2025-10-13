#!/usr/bin/env tsx

/**
 * ThemeParkPure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the ThemeParkPure theme park management system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.info(`
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
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class ThemeParkCLI {
  private logger: StructuredLogger;
  private themePark: ThemeParkPure;
  private rl: readline.Interface;
  private parkId: string | null = null;

  constructor() {
    this.logger = new StructuredLogger({ module: 'ThemeParkCLI' });
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
      console.info('\n👋 Theme Park CLI closed');
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
        console.info(`❌ Unknown command: ${command}`);
        console.info('Type "help" for available commands');
    }

    this.rl.prompt();
  }

  private async runTests(): Promise<void> {
    console.info('🧪 Running Theme Park tests...\n');

    try {
      // Test 1: Park creation
      console.info('1. Testing park creation...');
      const parkId = this.themePark.createPark('Test Park');
      console.info(`   ✅ Park created with ID: ${parkId}`);

      // Test 2: Ride addition
      console.info('2. Testing ride addition...');
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
      console.info(`   ${addRideResult ? '✅' : '❌'} Ride added: ${addRideResult ? 'Success' : 'Failed'}`);

      // Test 3: Guest addition
      console.info('3. Testing guest addition...');
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
      console.info(`   ${addGuestResult ? '✅' : '❌'} Guest added: ${addGuestResult ? 'Success' : 'Failed'}`);

      // Test 4: Staff addition
      console.info('4. Testing staff addition...');
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
      console.info(`   ${addStaffResult ? '✅' : '❌'} Staff added: ${addStaffResult ? 'Success' : 'Failed'}`);

      // Test 5: Park status
      console.info('5. Testing park status...');
      const status = this.themePark.getParkStatus(parkId);
      console.info(`   ✅ Park status retrieved: ${status.isOpen ? 'Open' : 'Closed'}`);
      console.info(`      Rides: ${status.totalRides}, Guests: ${status.totalGuests}, Staff: ${status.totalStaff}`);

      // Test 6: Financial status
      console.info('6. Testing financial status...');
      const finances = this.themePark.getFinances(parkId);
      console.info(`   ✅ Financial status: Revenue: $${finances.revenue}, Expenses: $${finances.expenses}, Profit: $${finances.profit}`);

      // Test 7: Guest satisfaction
      console.info('7. Testing guest satisfaction...');
      const satisfaction = this.themePark.getGuestSatisfaction(parkId);
      console.info(`   ✅ Average guest satisfaction: ${satisfaction.averageSatisfaction}%`);

      console.info('\n🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  private async createPark(name?: string): Promise<void> {
    if (!name) {
      console.info('❌ Usage: create-park <name>');
      return;
    }

    try {
      const parkId = this.themePark.createPark(name);
      this.parkId = parkId;
      console.info(`✅ Theme park "${name}" created with ID: ${parkId}`);
      console.info('🎢 Welcome to your new theme park! Start adding rides and guests.');
    } catch (error) {
      console.error('❌ Park creation failed:', error);
    }
  }

  private async addRide(name?: string, type?: string): Promise<void> {
    if (!name || !type) {
      console.info('❌ Usage: add-ride <name> <type>');
      console.info('   Types: thrill, family, kids, water, dark, show');
      return;
    }

    if (!this.parkId) {
      console.info('❌ No active park. Create a park first.');
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
        console.info(`✅ Added ${type} ride "${name}"`);
        console.info(`   Capacity: ${ride.capacity}, Duration: ${ride.duration}s, Thrill: ${ride.thrillLevel}/10`);
        console.info(`   Price: $${ride.ticketPrice}, Maintenance: $${ride.maintenanceCost}`);
      } else {
        console.info('❌ Failed to add ride');
      }
    } catch (error) {
      console.error('❌ Ride addition failed:', error);
    }
  }

  private async addGuest(type?: string): Promise<void> {
    if (!type) {
      console.info('❌ Usage: add-guest <type>');
      console.info('   Types: family, teen, child, adult, senior, group');
      return;
    }

    if (!this.parkId) {
      console.info('❌ No active park. Create a park first.');
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
        console.info(`✅ Added ${type} guest "${guest.name}"`);
        console.info(`   Age: ${guest.age}, Money: $${guest.money}, Energy: ${guest.energy}%`);
        console.info(`   Preferences: ${guest.preferences.join(', ')}`);
      } else {
        console.info('❌ Failed to add guest');
      }
    } catch (error) {
      console.error('❌ Guest addition failed:', error);
    }
  }

  private async addStaff(role?: string): Promise<void> {
    if (!role) {
      console.info('❌ Usage: add-staff <role>');
      console.info('   Roles: ride_operator, maintenance, security, janitor, manager');
      return;
    }

    if (!this.parkId) {
      console.info('❌ No active park. Create a park first.');
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
        console.info(`✅ Added ${role} staff "${staff.name}"`);
        console.info(`   Salary: $${staff.salary}/hour, Experience: ${staff.experience} years`);
        console.info(`   Efficiency: ${staff.efficiency}%`);
      } else {
        console.info('❌ Failed to add staff');
      }
    } catch (error) {
      console.error('❌ Staff addition failed:', error);
    }
  }

  private getParkStatus(): void {
    if (!this.parkId) {
      console.info('❌ No active park. Create a park first.');
      return;
    }

    try {
      const status = this.themePark.getParkStatus(this.parkId);
      console.info('🎢 Park Status:');
      console.info(`   Status: ${status.isOpen ? '🟢 Open' : '🔴 Closed'}`);
      console.info(`   Rides: ${status.totalRides} (${status.operationalRides} operational)`);
      console.info(`   Guests: ${status.totalGuests} (${status.guestsInRides} in rides)`);
      console.info(`   Staff: ${status.totalStaff} (${status.workingStaff} working)`);
      console.info(`   Average Wait Time: ${status.averageWaitTime} minutes`);
    } catch (error) {
      console.error('❌ Failed to get park status:', error);
    }
  }

  private getFinances(): void {
    if (!this.parkId) {
      console.info('❌ No active park. Create a park first.');
      return;
    }

    try {
      const finances = this.themePark.getFinances(this.parkId);
      console.info('💰 Financial Status:');
      console.info(`   Revenue: $${finances.revenue.toFixed(2)}`);
      console.info(`   Expenses: $${finances.expenses.toFixed(2)}`);
      console.info(`   Profit: $${finances.profit.toFixed(2)} ${finances.profit >= 0 ? '📈' : '📉'}`);
      console.info(`   Ticket Sales: ${finances.ticketSales}`);
      console.info(`   Maintenance Costs: $${finances.maintenanceCosts.toFixed(2)}`);
      console.info(`   Staff Costs: $${finances.staffCosts.toFixed(2)}`);
    } catch (error) {
      console.error('❌ Failed to get finances:', error);
    }
  }

  private getGuestSatisfaction(): void {
    if (!this.parkId) {
      console.info('❌ No active park. Create a park first.');
      return;
    }

    try {
      const satisfaction = this.themePark.getGuestSatisfaction(this.parkId);
      console.info('😊 Guest Satisfaction:');
      console.info(`   Average: ${satisfaction.averageSatisfaction}% ${this.getSatisfactionEmoji(satisfaction.averageSatisfaction)}`);
      console.info(`   Happy Guests: ${satisfaction.happyGuests}`);
      console.info(`   Neutral Guests: ${satisfaction.neutralGuests}`);
      console.info(`   Unhappy Guests: ${satisfaction.unhappyGuests}`);
      console.info(`   Complaints: ${satisfaction.complaints}`);
    } catch (error) {
      console.error('❌ Failed to get guest satisfaction:', error);
    }
  }

  private async simulateDay(): Promise<void> {
    if (!this.parkId) {
      console.info('❌ No active park. Create a park first.');
      return;
    }

    try {
      console.info('🌅 Simulating theme park day...');
      
      // Simulate park operations
      for (let hour = 9; hour <= 21; hour++) {
        console.info(`   ${hour}:00 - Park operations...`);
        
        // Simulate some random events
        if (Math.random() < 0.3) {
          console.info(`      🎢 Ride maintenance completed`);
        }
        if (Math.random() < 0.2) {
          console.info(`      👥 New guests arrived`);
        }
        if (Math.random() < 0.1) {
          console.info(`      ⚠️  Ride temporarily closed for maintenance`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.info('🌙 Day simulation completed!');
      
      // Show final stats
      this.getParkStatus();
      this.getFinances();
      this.getGuestSatisfaction();
      
    } catch (error) {
      console.error('❌ Day simulation failed:', error);
    }
  }

  private async simulate(): Promise<void> {
    console.info('🎭 Starting theme park simulation...');
    
    try {
      // Create a theme park
      console.info('1. Creating theme park...');
      const parkId = this.themePark.createPark('Simulation Park');
      this.parkId = parkId;
      console.info(`   ✅ Park created: ${parkId}`);

      // Add various rides
      console.info('2. Adding rides...');
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
        console.info(`   ✅ Added ${rideTypes[i]} ride: ${rideNames[i]}`);
      }

      // Add guests
      console.info('3. Adding guests...');
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
      console.info(`   ✅ Added 20 guests`);

      // Add staff
      console.info('4. Adding staff...');
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
      console.info(`   ✅ Added 10 staff members`);

      // Simulate park operations
      console.info('5. Simulating park operations...');
      for (let hour = 9; hour <= 18; hour++) {
        console.info(`   ${hour}:00 - Park operations...`);
        
        // Simulate random events
        if (Math.random() < 0.3) {
          console.info(`      🎢 Ride maintenance completed`);
        }
        if (Math.random() < 0.4) {
          console.info(`      👥 New guests arrived`);
        }
        if (Math.random() < 0.1) {
          console.info(`      ⚠️  Ride temporarily closed`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Final results
      console.info('6. Final results...');
      const status = this.themePark.getParkStatus(parkId);
      const finances = this.themePark.getFinances(parkId);
      const satisfaction = this.themePark.getGuestSatisfaction(parkId);
      
      console.info(`   🎢 Total Rides: ${status.totalRides}`);
      console.info(`   👥 Total Guests: ${status.totalGuests}`);
      console.info(`   👷 Total Staff: ${status.totalStaff}`);
      console.info(`   💰 Revenue: $${finances.revenue.toFixed(2)}`);
      console.info(`   📈 Profit: $${finances.profit.toFixed(2)}`);
      console.info(`   😊 Guest Satisfaction: ${satisfaction.averageSatisfaction}%`);

      console.info('✅ Theme park simulation completed successfully');

    } catch (error) {
      console.error('❌ Simulation failed:', error);
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
    console.info(`
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
    console.info('🚀 Theme Park CLI Started');
    console.info('Type "help" for available commands or "test" to run tests\n');
    
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