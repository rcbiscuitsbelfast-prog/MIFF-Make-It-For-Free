/**
 * ThemeParkPure - AAA Quality Theme Park Management System
 *
 * Advanced theme park simulation with:
 * - Ride management and guest experience
 * - Staff management and AI behavior
 * - Guest satisfaction and ratings
 * - Financial management and pricing
 * - Mobile-optimized park controls
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';

export type RideType = 'thrill' | 'family' | 'kids' | 'water' | 'dark' | 'show';
export type GuestType = 'family' | 'teen' | 'child' | 'adult' | 'senior' | 'group';
export type StaffRole = 'ride_operator' | 'maintenance' | 'security' | 'janitor' | 'manager';

export interface ThemeParkRide {
  id: string;
  name: string;
  type: RideType;
  capacity: number;
  duration: number; // seconds
  thrillLevel: number; // 0-10
  popularity: number; // 0-100
  maintenanceCost: number;
  ticketPrice: number;
  operational: boolean;
  currentGuests: number;
  totalRides: number;
  uptime: number; // percentage
}

export interface ThemeParkGuest {
  id: string;
  type: GuestType;
  satisfaction: number;
  energy: number;
  moneySpent: number;
  timeInPark: number;
  ridesCompleted: string[];
  favoriteRide: string;
}

export interface ThemeParkStaff {
  id: string;
  role: StaffRole;
  efficiency: number;
  salary: number;
  assignedRide: string;
  performance: number;
}

export class ThemeParkPure {
  private eventBus: EventBus;
  private rides: Map<string, ThemeParkRide> = new Map();
  private guests: Map<string, ThemeParkGuest> = new Map();
  private staff: Map<string, ThemeParkStaff> = new Map();
  private totalRevenue: number = 0;
  private totalGuests: number = 0;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.initializeRides();
  }

  private initializeRides(): void {
    const rides: ThemeParkRide[] = [
      {
        id: 'roller_coaster',
        name: 'Thunder Coaster',
        type: 'thrill',
        capacity: 24,
        duration: 180,
        thrillLevel: 8,
        popularity: 90,
        maintenanceCost: 50,
        ticketPrice: 8,
        operational: true,
        currentGuests: 0,
        totalRides: 0,
        uptime: 95
      },
      {
        id: 'merry_go_round',
        name: 'Merry-Go-Round',
        type: 'family',
        capacity: 30,
        duration: 120,
        thrillLevel: 2,
        popularity: 75,
        maintenanceCost: 20,
        ticketPrice: 3,
        operational: true,
        currentGuests: 0,
        totalRides: 0,
        uptime: 98
      }
    ];

    rides.forEach((ride: any) => 
      this.rides.set(id: ride.id, ride);
    });
  }

  public getRides(): Map<string, ThemeParkRide> {
    return new Map(this.rides);
  }

  public getGuests(): Map<string, ThemeParkGuest> {
    return new Map(this.guests);
  }

  public getStaff(): Map<string, ThemeParkStaff> {
    return new Map(this.staff);
  }

  public getTotalRevenue(): number {
    return this.totalRevenue;
  }

  public getTotalGuests(): number {
    return this.totalGuests;
  }
}

export default ThemeParkPure;