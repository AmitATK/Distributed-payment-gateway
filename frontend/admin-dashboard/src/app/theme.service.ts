import { Injectable } from '@angular/core';

@Injectable({ providedIn:'root' })
export class ThemeService {
  private key = 'fintech-theme';
init() {
  const saved = localStorage.getItem(this.key) || 'light';
  document.body.className = saved === 'dark' ? 'dark-theme' : '';
}

toggle() {
  const isDark = document.body.classList.contains('dark-theme');
  if (isDark) {
    document.body.classList.remove('dark-theme');
    localStorage.setItem(this.key, 'light');
  } else {
    document.body.classList.add('dark-theme');
    localStorage.setItem(this.key, 'dark');
  }
}

}
