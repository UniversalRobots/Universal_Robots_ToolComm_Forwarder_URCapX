import {ComponentFixture, TestBed} from '@angular/core/testing';
import { ToolCommForwarderApplicationComponent} from "./ToolCommForwarderApplication.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('ToolCommForwarderApplicationComponent', () => {
  let fixture: ComponentFixture<ToolCommForwarderApplicationComponent>;
  let component: ToolCommForwarderApplicationComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ToolCommForwarderApplicationComponent],
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader, useValue: {
            getTranslation(): Observable<Record<string, string>> {
              return of({});
            }
          }
        }
      })],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolCommForwarderApplicationComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
