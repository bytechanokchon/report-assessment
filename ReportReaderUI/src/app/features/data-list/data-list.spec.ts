import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataList } from './data-list';

describe('DataList', () => {
  let component: DataList;
  let fixture: ComponentFixture<DataList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataList],
    }).compileComponents();

    fixture = TestBed.createComponent(DataList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
