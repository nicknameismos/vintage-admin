import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDocumentComponent } from './manage-document.component';

describe('ManageDocumentComponent', () => {
  let component: ManageDocumentComponent;
  let fixture: ComponentFixture<ManageDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
