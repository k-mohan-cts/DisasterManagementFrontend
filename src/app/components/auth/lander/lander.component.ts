import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lander',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './lander.component.html',
  styleUrl: './lander.component.css'
})
export class LanderComponent {}
