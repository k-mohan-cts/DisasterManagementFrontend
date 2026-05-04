import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-document-vault',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './document-vault.component.html',
  styleUrl: './document-vault.component.css'
})
export class DocumentVaultComponent implements OnInit {
  documents: any[] = [
    { name: 'Identity_Card_Front.jpg', type: 'Image', date: '15 Oct 2023', status: 'VERIFIED' },
    { name: 'Proof_of_Address.pdf', type: 'PDF', date: '16 Oct 2023', status: 'PENDING' },
    { name: 'Medical_Certificate.doc', type: 'Document', date: '10 Oct 2023', status: 'REJECTED' }
  ];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    // In a real scenario, we'd fetch documents for the logged-in citizen
    // For now, keeping the prototype data as fallback
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
