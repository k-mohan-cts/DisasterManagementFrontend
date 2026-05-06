# Support & Resources Implementation - Code Snippets

## 1. Component TypeScript (Full Code)

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

interface ReliefItem {
  itemId: number;
  itemName: string;
  quantity: number;
  description: string;
  category?: string;
  available?: number;
}

interface RecoveryProgram {
  programId: number;
  programName: string;
  description: string;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface Distribution {
  distributionId: number;
  itemName: string;
  quantity: number;
  status: string;
  allocatedDate?: string;
  expectedDelivery?: string;
  location?: string;
}

@Component({
  selector: 'app-support-resources',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './support-resources.component.html',
  styleUrl: './support-resources.component.css'
})
export class SupportResourcesComponent implements OnInit {
  reliefItems: ReliefItem[] = [];
  recoveryPrograms: RecoveryProgram[] = [];
  distributions: Distribution[] = [];

  loadingRelief = false;
  loadingPrograms = false;
  loadingDistribution = false;

  errorRelief: string | null = null;
  errorPrograms: string | null = null;
  errorDistribution: string | null = null;

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.fetchReliefItems();
    this.fetchRecoveryPrograms();
    this.fetchDistributions();
  }

  fetchReliefItems() {
    this.loadingRelief = true;
    this.errorRelief = null;
    this.disasterService.getReliefItems().subscribe({
      next: (data) => {
        this.reliefItems = data || [];
        this.loadingRelief = false;
      },
      error: (err) => {
        console.error('Error fetching relief items:', err);
        this.errorRelief = 'Failed to load relief items';
        this.loadingRelief = false;
      }
    });
  }

  fetchRecoveryPrograms() {
    this.loadingPrograms = true;
    this.errorPrograms = null;
    this.disasterService.getRecoveryPrograms().subscribe({
      next: (data) => {
        this.recoveryPrograms = data || [];
        this.loadingPrograms = false;
      },
      error: (err) => {
        console.error('Error fetching recovery programs:', err);
        this.errorPrograms = 'Failed to load recovery programs';
        this.loadingPrograms = false;
      }
    });
  }

  fetchDistributions() {
    this.loadingDistribution = true;
    this.errorDistribution = null;
    this.disasterService.getDistributions().subscribe({
      next: (data) => {
        this.distributions = data || [];
        this.loadingDistribution = false;
      },
      error: (err) => {
        console.error('Error fetching distributions:', err);
        this.errorDistribution = 'Failed to load distribution status';
        this.loadingDistribution = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return 'badge-green';
    if (statusLower.includes('transit') || statusLower.includes('in transit')) return 'badge-blue';
    if (statusLower.includes('pending')) return 'badge-yellow';
    return 'badge-gray';
  }
}
```

## 2. Service Methods (disaster.service.ts)

```typescript
// Relief Items
getReliefItems(): Observable<any[]> {
  return this.http.get<any[]>(`${this.reliefUrl}/ReliefItems/getReliefItem`, { headers: this.getHeaders() });
}

// Recovery Programs (already existed, no changes needed)
getRecoveryPrograms(): Observable<any[]> {
  return this.http.get<any[]>(`${this.gatewayUrl}/programs/viewAll`, { headers: this.getHeaders() });
}

// Distributions
getDistributions(): Observable<any[]> {
  return this.http.get<any[]>(`${this.reliefUrl}/Distributions/getDistribution`, { headers: this.getHeaders() });
}
```

## 3. HTML Template Sections

### Relief Items Section
```html
<section class="section-container">
  <div class="section-header">
    <h2><i class="fas fa-box"></i> Relief Items</h2>
    <p>Available resources and relief supplies</p>
  </div>

  <div *ngIf="loadingRelief" class="loading-state">
    <i class="fas fa-spinner fa-spin"></i>
    <p>Loading relief items...</p>
  </div>

  <div *ngIf="errorRelief && !loadingRelief" class="error-state">
    <i class="fas fa-exclamation-circle"></i>
    <p>{{errorRelief}}</p>
  </div>

  <div *ngIf="!loadingRelief && reliefItems.length > 0" class="cards-grid">
    <div *ngFor="let item of reliefItems" class="relief-card">
      <div class="card-header">
        <h3>{{item.itemName}}</h3>
        <span class="category-badge" *ngIf="item.category">{{item.category}}</span>
      </div>
      <div class="card-body">
        <p class="description">{{item.description}}</p>
        <div class="item-details">
          <div class="detail-row">
            <span class="label">Available Quantity:</span>
            <span class="value">{{item.available || item.quantity}} units</span>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn btn-small btn-primary">Request Item</button>
      </div>
    </div>
  </div>

  <div *ngIf="!loadingRelief && reliefItems.length === 0 && !errorRelief" class="empty-state">
    <i class="fas fa-inbox"></i>
    <p>No relief items available at this time</p>
  </div>
</section>
```

### Recovery Programs Section
```html
<section class="section-container">
  <div class="section-header">
    <h2><i class="fas fa-clipboard-list"></i> Recovery Programs</h2>
    <p>Participate in community recovery and rebuilding initiatives</p>
  </div>

  <div *ngIf="loadingPrograms" class="loading-state">
    <i class="fas fa-spinner fa-spin"></i>
    <p>Loading recovery programs...</p>
  </div>

  <div *ngIf="errorPrograms && !loadingPrograms" class="error-state">
    <i class="fas fa-exclamation-circle"></i>
    <p>{{errorPrograms}}</p>
  </div>

  <div *ngIf="!loadingPrograms && recoveryPrograms.length > 0" class="cards-grid">
    <div *ngFor="let program of recoveryPrograms" class="program-card">
      <div class="card-header">
        <h3>{{program.programName}}</h3>
        <span class="status-badge" *ngIf="program.status">{{program.status}}</span>
      </div>
      <div class="card-body">
        <p class="description">{{program.description}}</p>
        <div class="program-details">
          <div class="detail-row" *ngIf="program.targetAudience">
            <span class="label">Target Audience:</span>
            <span class="value">{{program.targetAudience}}</span>
          </div>
          <div class="detail-row" *ngIf="program.startDate">
            <span class="label">Start Date:</span>
            <span class="value">{{program.startDate | date: 'MMM d, y'}}</span>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn btn-small btn-secondary">Learn More</button>
      </div>
    </div>
  </div>

  <div *ngIf="!loadingPrograms && recoveryPrograms.length === 0 && !errorPrograms" class="empty-state">
    <i class="fas fa-inbox"></i>
    <p>No recovery programs available at this time</p>
  </div>
</section>
```

### Distribution Status Section
```html
<section class="section-container">
  <div class="section-header">
    <h2><i class="fas fa-truck"></i> Distribution Status</h2>
    <p>Track your relief allocations and delivery status</p>
  </div>

  <div *ngIf="loadingDistribution" class="loading-state">
    <i class="fas fa-spinner fa-spin"></i>
    <p>Loading distribution status...</p>
  </div>

  <div *ngIf="errorDistribution && !loadingDistribution" class="error-state">
    <i class="fas fa-exclamation-circle"></i>
    <p>{{errorDistribution}}</p>
  </div>

  <div *ngIf="!loadingDistribution && distributions.length > 0" class="distribution-list">
    <div *ngFor="let dist of distributions" class="distribution-item">
      <div class="dist-header">
        <div class="dist-title">
          <h4>{{dist.itemName}}</h4>
          <span class="badge" [ngClass]="getStatusBadgeClass(dist.status)">{{dist.status}}</span>
        </div>
        <div class="dist-quantity">{{dist.quantity}} units</div>
      </div>
      <div class="dist-body">
        <div class="dist-detail" *ngIf="dist.allocatedDate">
          <i class="far fa-calendar"></i>
          <span>Allocated: {{dist.allocatedDate | date: 'MMM d, y'}}</span>
        </div>
        <div class="dist-detail" *ngIf="dist.expectedDelivery">
          <i class="far fa-clock"></i>
          <span>Expected: {{dist.expectedDelivery | date: 'MMM d, y'}}</span>
        </div>
        <div class="dist-detail" *ngIf="dist.location">
          <i class="fas fa-map-marker-alt"></i>
          <span>Location: {{dist.location}}</span>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="!loadingDistribution && distributions.length === 0 && !errorDistribution" class="empty-state">
    <i class="fas fa-inbox"></i>
    <p>No distributions allocated yet</p>
  </div>
</section>
```

## 4. Key CSS Patterns

```css
/* Section Layout */
.section-container {
  margin-bottom: 60px;
}

/* Responsive Card Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

/* Card Styling */
.relief-card, .program-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.relief-card:hover, .program-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Status Badges */
.badge-green { background-color: #dcfce7; color: #15803d; }
.badge-blue { background-color: #dbeafe; color: #1e40af; }
.badge-yellow { background-color: #fef9c3; color: #854d0e; }
.badge-gray { background-color: #f1f5f9; color: #475569; }

/* Button Styles */
.btn-primary {
  background-color: #1a3345;
  color: white;
}

.btn-primary:hover {
  background-color: #0f1f2e;
}

.btn-secondary {
  background-color: #5b45e0;
  color: white;
}

.btn-secondary:hover {
  background-color: #4a37b8;
}
```

## 5. Adding Click Handlers

To add functionality to buttons, extend the component:

```typescript
// Add to component
requestItem(item: ReliefItem) {
  console.log('Requesting item:', item);
  // Add logic to request the item
}

learnMore(program: RecoveryProgram) {
  console.log('Learning about program:', program);
  // Add logic to show program details or navigate
}

trackDistribution(dist: Distribution) {
  console.log('Tracking distribution:', dist);
  // Add logic to show detailed tracking
}
```

Then update the template:

```html
<!-- Relief Items -->
<button class="btn btn-small btn-primary" (click)="requestItem(item)">Request Item</button>

<!-- Recovery Programs -->
<button class="btn btn-small btn-secondary" (click)="learnMore(program)">Learn More</button>

<!-- Distribution Items (optional) -->
<a (click)="trackDistribution(dist)" class="track-link">View Details</a>
```

## 6. Backend Integration Verification

Test endpoints in your browser or Postman:

```bash
# Relief Items
GET http://localhost:8082/ReliefItems/getReliefItem

# Recovery Programs
GET http://localhost:8082/api/programs/viewAll

# Distributions
GET http://localhost:8082/Distributions/getDistribution
```

Expected headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

## 7. Common Customizations

### Adjust Card Grid (3 columns instead of auto)
```css
.cards-grid {
  grid-template-columns: repeat(3, 1fr);
}
```

### Add Card Shadows
```css
.relief-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
```

### Increase Section Spacing
```css
.section-container {
  margin-bottom: 80px;
}
```

### Change Badge Colors
```css
.badge-green {
  background-color: #C1E1EC; /* Your green */
  color: #0D5F5F; /* Your text color */
}
```
