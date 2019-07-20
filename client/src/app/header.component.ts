import { Component, ViewEncapsulation } from '@angular/core';
import { EditorService } from './editor.service';

@Component({
  selector: 'app-header',
  template: `
    <p-overlayPanel #op>
      <app-config></app-config>
    </p-overlayPanel>

    <button
      type="button"
      pButton
      class="options ui-button-secondary"
      icon="pi pi-cog"
      (click)="op.toggle($event)"
    ></button>

    <div class="button-group">
      <button type="button" pButton icon="pi pi-caret-right" class="ui-button-success" (click)="execute()"></button>
      <button type="button" pButton icon="pi pi-times" class="ui-button-danger"></button>
    </div>

    <a class="github" href="https://github.com/youzan/show-me-the-code" target="_blank" rel="noopener noreferrer"></a>
  `,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private readonly editorService: EditorService) {}

  execute() {}
}
