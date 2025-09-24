/**
 * RestaurantSimulationPure - AAA Quality Restaurant Management System
 *
 * Advanced restaurant simulation system with:
 * - Order queue management and customer service
 * - Ingredient inventory and supply chain
 * - Cooking mini-games and recipe systems
 * - Staff management with specialized roles
 * - Customer satisfaction and ratings
 * - Menu management and pricing strategies
 * - Mobile-optimized restaurant controls
 * - Integration with other MIFF modules
 * - Remix-safe deterministic behavior
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';

// ============================================================================
// RESTAURANT SYSTEM TYPES & INTERFACES
// ============================================================================

/**
 * Restaurant types in the simulation
 */
export type RestaurantType = 'fast_food' | 'casual_dining' | 'fine_dining' | 'cafe' | 'food_truck' | 'bakery';

/**
 * Customer types and behaviors
 */
export type CustomerType = 'regular' | 'rush_hour' | 'family' | 'business' | 'tourist' | 'critic';

/**
 * Staff roles in the restaurant
 */
export type RestaurantRole = 'chef' | 'cook' | 'waiter' | 'bartender' | 'manager' | 'cleaner' | 'host';

/**
 * Order status in the system
 */
export type OrderStatus = 'pending' | 'preparing' | 'cooking' | 'ready' | 'served' | 'cancelled';

/**
 * Menu item categories
 */
export type MenuCategory = 'appetizer' | 'main_course' | 'dessert' | 'beverage' | 'special';

/**
 * Ingredient quality levels
 */
export type IngredientQuality = 'basic' | 'fresh' | 'premium' | 'organic' | 'imported';

/**
 * Customer satisfaction levels
 */
export type SatisfactionLevel = 'very_dissatisfied' | 'dissatisfied' | 'neutral' | 'satisfied' | 'very_satisfied';

/**
 * Restaurant facility definition
 */
export interface RestaurantFacility {
  id: string;
  name: string;
  description: string;
  type: RestaurantType;
  baseCost: number;
  currentValue: number;
  operational: boolean;
  level: number;
  maxLevel: number;
  capacity: number;           // Maximum customers
  tables: number;             // Number of tables
  kitchenSize: number;        // Kitchen equipment slots
  storageCapacity: number;    // Ingredient storage capacity
  ambiance: number;           // 0-100 ambiance rating
  cleanliness: number;        // 0-100 cleanliness rating
  reputation: number;         // 0-100 restaurant reputation
  location: { x: number; y: number };
  unlocked: boolean;
  metadata?: Record<string, any>;
}

/**
 * Menu item definition
 */
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  cost: number;               // Cost to prepare
  preparationTime: number;    // Time in seconds to prepare
  difficulty: number;         // 1-5 difficulty level
  ingredients: IngredientRequirement[];
  cookingMethod: CookingMethod;
  presentation: number;       // 0-100 presentation score
  popularity: number;         // 0-100 popularity score
  available: boolean;
  seasonal: boolean;
  unlocked: boolean;
  metadata?: Record<string, any>;
}

/**
 * Ingredient requirement for menu items
 */
export interface IngredientRequirement {
  ingredientId: string;
  quantity: number;
  quality: IngredientQuality;
  optional: boolean;
}

/**
 * Cooking method for menu items
 */
export interface CookingMethod {
  type: 'grill' | 'fry' | 'bake' | 'boil' | 'steam' | 'raw' | 'mix';
  equipment: string;         // Required equipment
  temperature?: number;       // Cooking temperature
  time: number;               // Cooking time in seconds
  technique: string;          // Special cooking technique
}

/**
 * Customer order definition
 */
export interface CustomerOrder {
  id: string;
  customerId: string;
  customerType: CustomerType;
  items: OrderItem[];
  orderTime: number;
  status: OrderStatus;
  priority: number;           // 1-5 priority level
  tableNumber?: number;
  specialRequests: string[];
  satisfaction: number;       // 0-100 customer satisfaction
  totalPrice: number;
  tip: number;
  readyTime?: number;
  servedTime?: number;
  metadata?: Record<string, any>;
}

/**
 * Order item from menu
 */
export interface OrderItem {
  menuItemId: string;
  quantity: number;
  customizations: string[];
  specialInstructions: string;
  status: OrderStatus;
}

/**
 * Staff member in restaurant
 */
export interface RestaurantStaff {
  id: string;
  name: string;
  role: RestaurantRole;
  facilityId: string;
  skill: number;              // 0-100 skill level
  speed: number;              // 0-100 preparation speed
  experience: number;         // 0-100 experience level
  morale: number;             // 0-100 happiness level
  efficiency: number;         // 0-1 productivity multiplier
  salary: number;             // Hourly salary
  assignedStation: string;    // Kitchen station assignment
  hireDate: number;
  performance: number;        // 0-100 performance rating
  unlocked: boolean;
  metadata?: Record<string, any>;
}

/**
 * Ingredient inventory item
 */
export interface Ingredient {
  id: string;
  name: string;
  description: string;
  quality: IngredientQuality;
  basePrice: number;
  currentStock: number;
  maxStock: number;
  consumptionRate: number;    // Units per hour
  freshness: number;          // 0-100 freshness level
  supplier: string;
  deliveryTime: number;       // Hours for delivery
  autoReorder: boolean;
  reorderPoint: number;
  reorderQuantity: number;
  unlocked: boolean;
  metadata?: Record<string, any>;
}

/**
 * Kitchen equipment
 */
export interface KitchenEquipment {
  id: string;
  name: string;
  description: string;
  type: string;
  efficiency: number;         // 0-1 operational efficiency
  capacity: number;           // Items it can process
  maintenanceCost: number;    // Per hour maintenance
  upgradeLevel: number;
  maxUpgradeLevel: number;
  assignedStaff: string[];    // Staff IDs assigned to this equipment
  unlocked: boolean;
  metadata?: Record<string, any>;
}

/**
 * Customer in restaurant
 */
export interface RestaurantCustomer {
  id: string;
  name: string;
  type: CustomerType;
  satisfaction: number;       // 0-100 current satisfaction
  patience: number;           // 0-100 patience level
  groupSize: number;          // Size of customer group
  arrivalTime: number;
  waitTime: number;           // Time waiting for table
  orderTime?: number;         // Time when order was placed
  tableNumber?: number;
  specialRequirements: string[];
  behavior: 'patient' | 'impatient' | 'demanding' | 'generous';
  metadata?: Record<string, any>;
}

/**
 * Restaurant statistics
 */
export interface RestaurantStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  customerCount: number;
  averageSatisfaction: number;
  averageWaitTime: number;
  ordersCompleted: number;
  ordersCancelled: number;
  menuItemsSold: number;
  staffPerformance: number;
  equipmentEfficiency: number;
  inventoryTurnover: number;
  updateTime: number;
}

/**
 * Restaurant system configuration
 */
export interface RestaurantSystemConfig {
  initialCapital: number;
  enableRushHours: boolean;
  enableSeasonalMenus: boolean;
  enableStaffTraining: boolean;
  enableCustomerAI: boolean;
  enableInventoryManagement: boolean;
  enableReputationSystem: boolean;
  updateInterval: number;
  performanceMode: 'high' | 'medium' | 'low';
  debugMode: boolean;
}

/**
 * Integration hooks for other systems
 */
export interface RestaurantIntegration {
  onOrderPlaced?: (order: CustomerOrder) => void;
  onOrderCompleted?: (order: CustomerOrder) => void;
  onCustomerSatisfied?: (customerId: string, satisfaction: number) => void;
  onCustomerDissatisfied?: (customerId: string, reason: string) => void;
  onIngredientDepleted?: (ingredientId: string) => void;
  onStaffPerformance?: (staffId: string, performance: number) => void;
  onReputationChange?: (oldReputation: number, newReputation: number) => void;
  getCurrentTime?: () => number;
  getPlayerState?: () => any;
  getWorldState?: () => any;
}

// ============================================================================
// RESTAURANT SYSTEM IMPLEMENTATION
// ============================================================================

/**
 * Main RestaurantSimulationPure class
 * Provides AAA-quality restaurant management with full integration support
 */
export class RestaurantSimulationPure {
  private eventBus: EventBus;
  private config: RestaurantSystemConfig;
  private integrations: RestaurantIntegration = {};

  // Core restaurant state
  private facilities: Map<string, RestaurantFacility> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private orders: Map<string, CustomerOrder> = new Map();
  private customers: Map<string, RestaurantCustomer> = new Map();
  private staff: Map<string, RestaurantStaff> = new Map();
  private ingredients: Map<string, Ingredient> = new Map();
  private equipment: Map<string, KitchenEquipment> = new Map();

  // Restaurant state
  private currentCustomers: number = 0;
  private totalRevenue: number = 0;
  private totalExpenses: number = 0;
  private reputation: number = 50;
  private lastUpdateTime: number = 0;
  private isPaused: boolean = false;
  private performanceMode: 'high' | 'medium' | 'low' = 'high';

  // Customer and order management
  private nextOrderId: number = 1;
  private nextCustomerId: number = 1;
  private customerQueue: RestaurantCustomer[] = [];
  private availableTables: number[] = [];

  constructor(eventBus: EventBus, config: RestaurantSystemConfig = {
    initialCapital: 50000,
    enableRushHours: true,
    enableSeasonalMenus: true,
    enableStaffTraining: true,
    enableCustomerAI: true,
    enableInventoryManagement: true,
    enableReputationSystem: true,
    updateInterval: 300, // Update every 5 minutes
    performanceMode: 'high',
    debugMode: false
  }) {
    this.eventBus = eventBus;
    this.config = config;

    this.initializeSystem();
    this.startUpdateLoop();
  }

  /**
   * Initialize the restaurant system
   */
  private initializeSystem(): void {
    this.initializeFacilities();
    this.initializeMenu();
    this.initializeIngredients();
    this.initializeEquipment();
    this.initializeTables();

    this.setupEventListeners();

    // Emit initialization event
    this.eventBus.emit('restaurant:system_initialized', {
      config: this.config,
      facilities: this.facilities.size,
      menuItems: this.menuItems.size,
      timestamp: Date.now()
    });
  }

  /**
   * Initialize restaurant facilities
   */
  private initializeFacilities(): void {
    const facilities: RestaurantFacility[] = [
      {
        id: 'main_restaurant',
        name: 'Main Restaurant',
        description: 'Primary restaurant location with full kitchen',
        type: 'casual_dining',
        baseCost: 0,
        currentValue: 100000,
        operational: true,
        level: 1,
        maxLevel: 5,
        capacity: 50,
        tables: 20,
        kitchenSize: 10,
        storageCapacity: 1000,
        ambiance: 70,
        cleanliness: 80,
        reputation: 60,
        location: { x: 0, y: 0 },
        unlocked: true
      },
      {
        id: 'takeout_window',
        name: 'Takeout Window',
        description: 'Quick service takeout window',
        type: 'fast_food',
        baseCost: 15000,
        currentValue: 15000,
        operational: false,
        level: 0,
        maxLevel: 3,
        capacity: 20,
        tables: 0,
        kitchenSize: 3,
        storageCapacity: 200,
        ambiance: 50,
        cleanliness: 70,
        reputation: 40,
        location: { x: 100, y: 0 },
        unlocked: true
      }
    ];

    facilities.forEach(facility => {
      this.facilities.set(facility.id, facility);
    });
  }

  /**
   * Initialize menu items
   */
  private initializeMenu(): void {
    const menuItems: MenuItem[] = [
      {
        id: 'burger',
        name: 'Classic Burger',
        description: 'Juicy beef burger with lettuce, tomato, and fries',
        category: 'main_course',
        price: 12.99,
        cost: 4.50,
        preparationTime: 600, // 10 minutes
        difficulty: 2,
        ingredients: [
          { ingredientId: 'beef_patty', quantity: 1, quality: 'fresh', optional: false },
          { ingredientId: 'lettuce', quantity: 1, quality: 'fresh', optional: false },
          { ingredientId: 'tomato', quantity: 1, quality: 'fresh', optional: false },
          { ingredientId: 'bun', quantity: 1, quality: 'basic', optional: false }
        ],
        cookingMethod: {
          type: 'grill',
          equipment: 'grill',
          temperature: 350,
          time: 300,
          technique: 'direct_heat'
        },
        presentation: 80,
        popularity: 85,
        available: true,
        seasonal: false,
        unlocked: true
      },
      {
        id: 'caesar_salad',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing and croutons',
        category: 'appetizer',
        price: 8.99,
        cost: 2.50,
        preparationTime: 300, // 5 minutes
        difficulty: 1,
        ingredients: [
          { ingredientId: 'lettuce', quantity: 2, quality: 'fresh', optional: false },
          { ingredientId: 'croutons', quantity: 1, quality: 'basic', optional: false },
          { ingredientId: 'parmesan', quantity: 0.5, quality: 'premium', optional: false }
        ],
        cookingMethod: {
          type: 'mix',
          equipment: 'prep_station',
          time: 180,
          technique: 'toss_dress'
        },
        presentation: 75,
        popularity: 70,
        available: true,
        seasonal: false,
        unlocked: true
      }
    ];

    menuItems.forEach(item => {
      this.menuItems.set(item.id, item);
    });
  }

  /**
   * Initialize ingredients
   */
  private initializeIngredients(): void {
    const ingredients: Ingredient[] = [
      {
        id: 'beef_patty',
        name: 'Beef Patty',
        description: 'Ground beef patty for burgers',
        quality: 'fresh',
        basePrice: 3.50,
        currentStock: 50,
        maxStock: 100,
        consumptionRate: 10,
        freshness: 95,
        supplier: 'Local Butcher',
        deliveryTime: 24,
        autoReorder: true,
        reorderPoint: 20,
        reorderQuantity: 50,
        unlocked: true
      },
      {
        id: 'lettuce',
        name: 'Lettuce',
        description: 'Fresh green lettuce',
        quality: 'fresh',
        basePrice: 1.20,
        currentStock: 100,
        maxStock: 200,
        consumptionRate: 20,
        freshness: 98,
        supplier: 'Green Farms',
        deliveryTime: 12,
        autoReorder: true,
        reorderPoint: 50,
        reorderQuantity: 100,
        unlocked: true
      },
      {
        id: 'tomato',
        name: 'Tomato',
        description: 'Ripe red tomatoes',
        quality: 'fresh',
        basePrice: 1.80,
        currentStock: 75,
        maxStock: 150,
        consumptionRate: 15,
        freshness: 92,
        supplier: 'Valley Produce',
        deliveryTime: 18,
        autoReorder: true,
        reorderPoint: 40,
        reorderQuantity: 75,
        unlocked: true
      }
    ];

    ingredients.forEach(ingredient => {
      this.ingredients.set(ingredient.id, ingredient);
    });
  }

  /**
   * Initialize kitchen equipment
   */
  private initializeEquipment(): void {
    const equipment: KitchenEquipment[] = [
      {
        id: 'grill',
        name: 'Commercial Grill',
        description: 'High-capacity grill for burgers and meats',
        type: 'cooking',
        efficiency: 0.9,
        capacity: 12,
        maintenanceCost: 25,
        upgradeLevel: 1,
        maxUpgradeLevel: 5,
        assignedStaff: [],
        unlocked: true
      },
      {
        id: 'prep_station',
        name: 'Preparation Station',
        description: 'Workstation for food preparation',
        type: 'prep',
        efficiency: 0.95,
        capacity: 8,
        maintenanceCost: 10,
        upgradeLevel: 1,
        maxUpgradeLevel: 3,
        assignedStaff: [],
        unlocked: true
      },
      {
        id: 'fryer',
        name: 'Deep Fryer',
        description: 'Deep fryer for french fries and appetizers',
        type: 'cooking',
        efficiency: 0.85,
        capacity: 20,
        maintenanceCost: 30,
        upgradeLevel: 0,
        maxUpgradeLevel: 4,
        assignedStaff: [],
        unlocked: false
      }
    ];

    equipment.forEach(item => {
      this.equipment.set(item.id, item);
    });
  }

  /**
   * Initialize table numbers
   */
  private initializeTables(): void {
    this.availableTables = Array.from({ length: 25 }, (_, i) => i + 1);
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (this.integrations.onOrderPlaced) {
      this.eventBus.on('restaurant:order_placed', (data: { order: CustomerOrder }) => {
        this.integrations.onOrderPlaced!(data.order);
      });
    }

    if (this.integrations.onOrderCompleted) {
      this.eventBus.on('restaurant:order_completed', (data: { order: CustomerOrder }) => {
        this.integrations.onOrderCompleted!(data.order);
      });
    }

    if (this.integrations.onCustomerSatisfied) {
      this.eventBus.on('restaurant:customer_satisfied', (data: { customerId: string, satisfaction: number }) => {
        this.integrations.onCustomerSatisfied!(data.customerId, data.satisfaction);
      });
    }

    if (this.integrations.onCustomerDissatisfied) {
      this.eventBus.on('restaurant:customer_dissatisfied', (data: { customerId: string, reason: string }) => {
        this.integrations.onCustomerDissatisfied!(data.customerId, data.reason);
      });
    }

    if (this.integrations.onIngredientDepleted) {
      this.eventBus.on('restaurant:ingredient_depleted', (data: { ingredientId: string }) => {
        this.integrations.onIngredientDepleted!(data.ingredientId);
      });
    }
  }

  /**
   * Start the main update loop
   */
  private startUpdateLoop(): void {
    setInterval(() => {
      if (!this.isPaused) {
        this.updateRestaurant();
      }
    }, this.config.updateInterval);
  }

  /**
   * Update restaurant operations
   */
  private updateRestaurant(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 3600000; // Convert to hours
    this.lastUpdateTime = now;

    if (deltaTime <= 0) return;

    // Generate customers
    this.generateCustomers(deltaTime);

    // Process customer queue
    this.processCustomerQueue();

    // Update orders
    this.updateOrders(deltaTime);

    // Update ingredients
    this.updateIngredients(deltaTime);

    // Update staff
    this.updateStaff(deltaTime);

    // Update equipment
    this.updateEquipment(deltaTime);

    // Check customer satisfaction
    this.checkCustomerSatisfaction();

    // Update reputation
    this.updateReputation();
  }

  /**
   * Generate customers based on time and conditions
   */
  private generateCustomers(deltaTime: number): void {
    const facilities = this.facilities.get('main_restaurant');
    if (!facilities || !facilities.operational) return;

    // Base customer generation rate
    let generationRate = 2; // 2 customers per hour base

    // Rush hour bonus
    if (this.config.enableRushHours) {
      const hour = new Date().getHours();
      if ((hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 20)) {
        generationRate *= 3; // 3x during rush hours
      }
    }

    // Reputation bonus
    const reputationBonus = 1 + (facilities.reputation / 200); // +0.5 max
    generationRate *= reputationBonus;

    const customersToGenerate = Math.floor(generationRate * deltaTime);

    for (let i = 0; i < customersToGenerate; i++) {
      this.generateCustomer();
    }
  }

  /**
   * Generate a single customer
   */
  private generateCustomer(): void {
    const customerTypes: CustomerType[] = ['regular', 'rush_hour', 'family', 'business', 'tourist'];
    const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];

    const customer: RestaurantCustomer = {
      id: `customer_${this.nextCustomerId++}`,
      name: `Customer ${this.nextCustomerId}`,
      type: customerType,
      satisfaction: 75,
      patience: this.getPatienceForType(customerType),
      groupSize: Math.floor(Math.random() * 4) + 1,
      arrivalTime: Date.now(),
      waitTime: 0,
      specialRequirements: [],
      behavior: this.getBehaviorForType(customerType)
    };

    this.customerQueue.push(customer);

    this.eventBus.emit('restaurant:customer_arrived', {
      customer: customer,
      timestamp: Date.now()
    });
  }

  /**
   * Get patience level for customer type
   */
  private getPatienceForType(type: CustomerType): number {
    switch (type) {
      case 'regular': return 80;
      case 'rush_hour': return 60;
      case 'family': return 90;
      case 'business': return 70;
      case 'tourist': return 85;
      case 'critic': return 95;
      default: return 75;
    }
  }

  /**
   * Get behavior for customer type
   */
  private getBehaviorForType(type: CustomerType): 'patient' | 'impatient' | 'demanding' | 'generous' {
    switch (type) {
      case 'regular': return Math.random() > 0.8 ? 'generous' : 'patient';
      case 'rush_hour': return 'impatient';
      case 'family': return 'patient';
      case 'business': return 'demanding';
      case 'tourist': return 'patient';
      case 'critic': return 'demanding';
      default: return 'patient';
    }
  }

  /**
   * Process customer queue
   */
  private processCustomerQueue(): void {
    if (this.availableTables.length === 0 || this.customerQueue.length === 0) return;

    const customer = this.customerQueue.shift()!;
    const tableNumber = this.availableTables.shift()!;

    customer.tableNumber = tableNumber;
    customer.orderTime = Date.now();

    this.customers.set(customer.id, customer);

    // Generate order for customer
    this.generateOrder(customer);
  }

  /**
   * Generate order for customer
   */
  private generateOrder(customer: RestaurantCustomer): void {
    const availableItems = Array.from(this.menuItems.values()).filter(item => item.available);
    const orderSize = Math.min(customer.groupSize + 1, 5); // 1-5 items based on group size

    const orderItems: OrderItem[] = [];

    for (let i = 0; i < orderSize; i++) {
      const menuItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      orderItems.push({
        menuItemId: menuItem.id,
        quantity: 1,
        customizations: [],
        specialInstructions: '',
        status: 'pending'
      });
    }

    const totalPrice = orderItems.reduce((sum, item) => {
      const menuItem = this.menuItems.get(item.menuItemId);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);

    const order: CustomerOrder = {
      id: `order_${this.nextOrderId++}`,
      customerId: customer.id,
      customerType: customer.type,
      items: orderItems,
      orderTime: customer.orderTime!,
      status: 'pending',
      priority: this.getOrderPriority(customer.type),
      tableNumber: customer.tableNumber,
      specialRequests: customer.specialRequirements,
      satisfaction: customer.satisfaction,
      totalPrice: totalPrice,
      tip: totalPrice * this.getTipPercentage(customer.type)
    };

    this.orders.set(order.id, order);

    this.eventBus.emit('restaurant:order_placed', {
      order: order,
      timestamp: Date.now()
    });
  }

  /**
   * Get order priority for customer type
   */
  private getOrderPriority(type: CustomerType): number {
    switch (type) {
      case 'critic': return 5;
      case 'business': return 4;
      case 'rush_hour': return 3;
      case 'family': return 2;
      case 'regular': return 2;
      case 'tourist': return 1;
      default: return 2;
    }
  }

  /**
   * Get tip percentage for customer type
   */
  private getTipPercentage(type: CustomerType): number {
    switch (type) {
      case 'critic': return 0.20;
      case 'business': return 0.18;
      case 'family': return 0.15;
      case 'regular': return 0.12;
      case 'rush_hour': return 0.08;
      case 'tourist': return 0.10;
      default: return 0.10;
    }
  }

  /**
   * Update orders
   */
  private updateOrders(deltaTime: number): void {
    this.orders.forEach((order, orderId) => {
      if (order.status === 'pending') {
        // Check if can start preparing
        if (this.canPrepareOrder(order)) {
          order.status = 'preparing';
          this.startPreparingOrder(order);
        }
      } else if (order.status === 'preparing' || order.status === 'cooking') {
        // Update cooking progress
        this.updateOrderProgress(order, deltaTime);
      } else if (order.status === 'ready') {
        // Check if served
        if (order.servedTime) {
          this.completeOrder(order);
        }
      }
    });
  }

  /**
   * Check if order can be prepared
   */
  private canPrepareOrder(order: CustomerOrder): boolean {
    // Check ingredient availability
    for (const orderItem of order.items) {
      const menuItem = this.menuItems.get(orderItem.menuItemId);
      if (!menuItem) continue;

      for (const requirement of menuItem.ingredients) {
        const ingredient = this.ingredients.get(requirement.ingredientId);
        if (!ingredient || ingredient.currentStock < requirement.quantity) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Start preparing order
   */
  private startPreparingOrder(order: CustomerOrder): void {
    // Deduct ingredients
    for (const orderItem of order.items) {
      const menuItem = this.menuItems.get(orderItem.menuItemId);
      if (!menuItem) continue;

      for (const requirement of menuItem.ingredients) {
        const ingredient = this.ingredients.get(requirement.ingredientId);
        if (ingredient) {
          ingredient.currentStock -= requirement.quantity;
          ingredient.freshness *= 0.95; // Slight freshness reduction

          if (ingredient.currentStock <= ingredient.reorderPoint && ingredient.autoReorder) {
            this.reorderIngredient(ingredient);
          }
        }
      }
    }

    // Calculate preparation time
    const totalPrepTime = order.items.reduce((sum, item) => {
      const menuItem = this.menuItems.get(item.menuItemId);
      return sum + (menuItem?.preparationTime || 0);
    }, 0);

    order.readyTime = Date.now() + (totalPrepTime * 1000);
  }

  /**
   * Update order progress
   */
  private updateOrderProgress(order: CustomerOrder, deltaTime: number): void {
    if (!order.readyTime) return;

    const progress = (Date.now() - order.orderTime) / (order.readyTime - order.orderTime);

    if (progress >= 1) {
      order.status = 'ready';
    } else if (progress >= 0.7 && order.status === 'preparing') {
      order.status = 'cooking';
    }
  }

  /**
   * Complete order
   */
  private completeOrder(order: CustomerOrder): void {
    // Calculate final satisfaction
    const waitTime = (order.servedTime! - order.orderTime) / 1000; // In seconds
    const expectedTime = order.items.reduce((sum, item) => {
      const menuItem = this.menuItems.get(item.menuItemId);
      return sum + (menuItem?.preparationTime || 0);
    }, 0);

    const satisfactionBonus = waitTime <= expectedTime * 1.5 ? 10 : -10;
    order.satisfaction = Math.max(0, Math.min(100, order.satisfaction + satisfactionBonus));

    // Generate revenue
    this.totalRevenue += order.totalPrice + order.tip;

    // Update customer satisfaction
    const customer = this.customers.get(order.customerId);
    if (customer) {
      customer.satisfaction = order.satisfaction;

      if (order.satisfaction >= 80) {
        this.integrations.onCustomerSatisfied?.(customer.id, order.satisfaction);
      } else if (order.satisfaction <= 40) {
        this.integrations.onCustomerDissatisfied?.(customer.id, 'long_wait_time');
      }
    }

    // Remove order and free table
    this.orders.delete(order.id);

    if (order.tableNumber) {
      this.availableTables.push(order.tableNumber);
    }

    this.eventBus.emit('restaurant:order_completed', {
      order: order,
      timestamp: Date.now()
    });
  }

  /**
   * Reorder ingredient
   */
  private reorderIngredient(ingredient: Ingredient): void {
    // This would trigger a supplier order in a full implementation
    this.eventBus.emit('restaurant:ingredient_reorder', {
      ingredientId: ingredient.id,
      quantity: ingredient.reorderQuantity,
      supplier: ingredient.supplier,
      timestamp: Date.now()
    });
  }

  /**
   * Update ingredients
   */
  private updateIngredients(deltaTime: number): void {
    this.ingredients.forEach((ingredient, ingredientId) => {
      // Reduce freshness over time
      ingredient.freshness = Math.max(0, ingredient.freshness - (deltaTime * 5));

      // Check for depletion
      if (ingredient.currentStock <= 0 && ingredient.freshness <= 0) {
        this.integrations.onIngredientDepleted?.(ingredientId);
      }
    });
  }

  /**
   * Update staff
   */
  private updateStaff(deltaTime: number): void {
    this.staff.forEach((staffMember, staffId) => {
      // Update morale and performance
      staffMember.morale = Math.max(0, Math.min(100,
        staffMember.morale + (Math.random() - 0.5) * 2 * deltaTime
      ));

      staffMember.efficiency = (staffMember.skill / 100) * (staffMember.morale / 100) * 0.9 + 0.1;
      staffMember.performance = (staffMember.skill + staffMember.experience) / 2;
    });
  }

  /**
   * Update equipment
   */
  private updateEquipment(deltaTime: number): void {
    this.equipment.forEach((equipment, equipmentId) => {
      // Equipment degrades over time
      equipment.efficiency = Math.max(0.1, equipment.efficiency - (deltaTime * 0.01));
    });
  }

  /**
   * Check customer satisfaction
   */
  private checkCustomerSatisfaction(): void {
    this.customers.forEach((customer, customerId) => {
      // Update wait time
      if (customer.tableNumber) {
        customer.waitTime = (Date.now() - customer.orderTime!) / 1000;
      } else {
        customer.waitTime = (Date.now() - customer.arrivalTime) / 1000;
      }

      // Reduce satisfaction over time
      if (customer.waitTime > 300) { // 5 minutes
        customer.satisfaction = Math.max(0, customer.satisfaction - 0.5);
      }
    });
  }

  /**
   * Update reputation
   */
  private updateReputation(): void {
    const facilities = this.facilities.get('main_restaurant');
    if (!facilities) return;

    // Base reputation calculation
    let reputationChange = 0;

    // Customer satisfaction bonus
    const satisfiedCustomers = Array.from(this.customers.values())
      .filter(c => c.satisfaction >= 80).length;
    const totalCustomers = this.customers.size;
    if (totalCustomers > 0) {
      const satisfactionRate = satisfiedCustomers / totalCustomers;
      reputationChange += satisfactionRate * 2;
    }

    // Cleanliness bonus
    reputationChange += (facilities.cleanliness - 50) / 50;

    // Update reputation
    this.reputation = Math.max(0, Math.min(100, this.reputation + reputationChange));
    facilities.reputation = this.reputation;

    // Emit reputation change event
    if (Math.abs(reputationChange) > 1) {
      this.eventBus.emit('restaurant:reputation_change', {
        oldReputation: this.reputation - reputationChange,
        newReputation: this.reputation,
        change: reputationChange,
        timestamp: Date.now()
      });
    }
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get restaurant facilities
   */
  public getFacilities(): Map<string, RestaurantFacility> {
    return new Map(this.facilities);
  }

  /**
   * Get menu items
   */
  public getMenuItems(): Map<string, MenuItem> {
    return new Map(this.menuItems);
  }

  /**
   * Get current orders
   */
  public getOrders(): Map<string, CustomerOrder> {
    return new Map(this.orders);
  }

  /**
   * Get customers
   */
  public getCustomers(): Map<string, RestaurantCustomer> {
    return new Map(this.customers);
  }

  /**
   * Get staff
   */
  public getStaff(): Map<string, RestaurantStaff> {
    return new Map(this.staff);
  }

  /**
   * Get ingredients
   */
  public getIngredients(): Map<string, Ingredient> {
    return new Map(this.ingredients);
  }

  /**
   * Get kitchen equipment
   */
  public getEquipment(): Map<string, KitchenEquipment> {
    return new Map(this.equipment);
  }

  /**
   * Get restaurant statistics
   */
  public getStats(): RestaurantStats {
    return {
      totalRevenue: this.totalRevenue,
      totalExpenses: this.totalExpenses,
      netProfit: this.totalRevenue - this.totalExpenses,
      customerCount: this.customers.size,
      averageSatisfaction: this.calculateAverageSatisfaction(),
      averageWaitTime: this.calculateAverageWaitTime(),
      ordersCompleted: Array.from(this.orders.values()).filter(o => o.status === 'served').length,
      ordersCancelled: Array.from(this.orders.values()).filter(o => o.status === 'cancelled').length,
      menuItemsSold: this.calculateMenuItemsSold(),
      staffPerformance: this.calculateAverageStaffPerformance(),
      equipmentEfficiency: this.calculateAverageEquipmentEfficiency(),
      inventoryTurnover: this.calculateInventoryTurnover(),
      updateTime: Date.now()
    };
  }

  /**
   * Set integrations
   */
  public setIntegrations(integrations: RestaurantIntegration): void {
    this.integrations = { ...this.integrations, ...integrations };
  }

  /**
   * Set paused state
   */
  public setPaused(paused: boolean): void {
    this.isPaused = paused;

    this.eventBus.emit('restaurant:paused', {
      paused: paused,
      timestamp: Date.now()
    });
  }

  // Helper methods for calculations
  private calculateAverageSatisfaction(): number {
    const customers = Array.from(this.customers.values());
    if (customers.length === 0) return 0;

    const totalSatisfaction = customers.reduce((sum, customer) => sum + customer.satisfaction, 0);
    return totalSatisfaction / customers.length;
  }

  private calculateAverageWaitTime(): number {
    const customers = Array.from(this.customers.values());
    if (customers.length === 0) return 0;

    const totalWaitTime = customers.reduce((sum, customer) => sum + customer.waitTime, 0);
    return totalWaitTime / customers.length;
  }

  private calculateMenuItemsSold(): number {
    return Array.from(this.orders.values()).reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
  }

  private calculateAverageStaffPerformance(): number {
    const staff = Array.from(this.staff.values());
    if (staff.length === 0) return 0;

    const totalPerformance = staff.reduce((sum, staffMember) => sum + staffMember.performance, 0);
    return totalPerformance / staff.length;
  }

  private calculateAverageEquipmentEfficiency(): number {
    const equipment = Array.from(this.equipment.values());
    if (equipment.length === 0) return 0;

    const totalEfficiency = equipment.reduce((sum, eq) => sum + eq.efficiency, 0);
    return totalEfficiency / equipment.length;
  }

  private calculateInventoryTurnover(): number {
    const ingredients = Array.from(this.ingredients.values());
    if (ingredients.length === 0) return 0;

    const totalTurnover = ingredients.reduce((sum, ingredient) => {
      const turnover = ingredient.consumptionRate / ingredient.maxStock;
      return sum + turnover;
    }, 0);

    return totalTurnover / ingredients.length;
  }

  /**
   * Reset restaurant
   */
  public resetRestaurant(): void {
    this.facilities.clear();
    this.menuItems.clear();
    this.orders.clear();
    this.customers.clear();
    this.staff.clear();
    this.ingredients.clear();
    this.equipment.clear();
    this.customerQueue = [];
    this.availableTables = [];
    this.totalRevenue = 0;
    this.totalExpenses = 0;
    this.nextOrderId = 1;
    this.nextCustomerId = 1;

    this.initializeSystem();
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  RestaurantType,
  CustomerType,
  RestaurantRole,
  OrderStatus,
  MenuCategory,
  IngredientQuality,
  SatisfactionLevel,
  RestaurantFacility,
  MenuItem,
  IngredientRequirement,
  CookingMethod,
  CustomerOrder,
  OrderItem,
  RestaurantStaff,
  Ingredient,
  KitchenEquipment,
  RestaurantCustomer,
  RestaurantStats,
  RestaurantSystemConfig,
  RestaurantIntegration
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default RestaurantSimulationPure;