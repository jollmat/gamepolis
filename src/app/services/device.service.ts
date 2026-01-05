import { map, Observable } from "rxjs";
import { DeviceType } from "../types/devices";
import { Injectable } from "@angular/core";
import { BreakpointObserver, Breakpoints, BreakpointState } from "@angular/cdk/layout";

@Injectable({ providedIn: 'root' })
export class DeviceService {
  deviceType$!: Observable<DeviceType>;

  constructor(private breakpoint: BreakpointObserver) {
    this.deviceType$ = this.breakpoint.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet,
      Breakpoints.Web
    ]).pipe(
      map((result: BreakpointState) => {
        if (result.breakpoints[Breakpoints.Handset]) return 'MOBILE';
        if (result.breakpoints[Breakpoints.Tablet]) return 'TABLET';
        return 'DESKTOP';
      })
    );
  }
}
