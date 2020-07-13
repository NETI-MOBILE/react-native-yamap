import React from 'react';
import {
  Platform,
  requireNativeComponent,
  NativeModules,
  UIManager,
  findNodeHandle,
  ViewProps,
  ImageSourcePropType,
} from 'react-native';
// @ts-ignore
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import CallbacksManager from '../utils/CallbacksManager';
import { Animation, Point, DrivingInfo, MasstransitInfo, RoutesFoundEvent, Vehicles, SearchResult } from '../interfaces';

const { yamap: NativeYamapModule } = NativeModules;

const YaMapNativeComponent = requireNativeComponent('YamapView');

export interface YaMapProps extends ViewProps {
  userLocationIcon: ImageSourcePropType;
  showUserPosition?: boolean;
  onCameraChanged?: ({lat, lon}: {lat: number, lon: number}) => void;
  onSearch?: (results: SearchResult[]) => void;
}

export class YaMap extends React.Component<YaMapProps> {
  static defaultProps = {
    showUserPosition: true,
  };

  // @ts-ignore
  map = React.createRef<YaMapNativeComponent>();

  static ALL_MASSTRANSIT_VEHICLES: Vehicles[] = [
    'bus',
    'trolleybus',
    'tramway',
    'minibus',
    'suburban',
    'underground',
    'ferry',
    'cable',
    'funicular',
  ];

  public static init(apiKey: string) {
    NativeYamapModule.init(apiKey);
  }

  public static setLocale(locale: string): Promise<void> {
    return new Promise((resolve, reject) => {
      NativeYamapModule.setLocale(locale, () => resolve(), (err: string) => reject(new Error(err)));
    });
  }

  public static getLocale(): Promise<string> {
    return new Promise((resolve, reject) => {
      NativeYamapModule.getLocale((locale: string) => resolve(locale), (err: string) => reject(new Error(err)));
    });
  }

  public static resetLocale(): Promise<void> {
    return new Promise((resolve, reject) => {
      NativeYamapModule.resetLocale(() => resolve(), (err: string) => reject(new Error(err)));
    });
  }

  public findRoutes(points: Point[], vehicles: Vehicles[], callback: (event: RoutesFoundEvent<DrivingInfo | MasstransitInfo>) => void) {
    this._findRoutes(points, vehicles, callback);
  }

  public findMasstransitRoutes(points: Point[], callback: (event: RoutesFoundEvent<MasstransitInfo>) => void) {
    this._findRoutes(points, YaMap.ALL_MASSTRANSIT_VEHICLES, callback);
  }

  public findPedestrianRoutes(points: Point[], callback: (event: RoutesFoundEvent<MasstransitInfo>) => void) {
    this._findRoutes(points, [], callback);
  }

  public findDrivingRoutes(points: Point[], callback: (event: RoutesFoundEvent<DrivingInfo>) => void) {
    this._findRoutes(points, ['car'], callback);
  }

  public fitAllMarkers() {
    UIManager.dispatchViewManagerCommand(
              findNodeHandle(this),
              this.getCommand('fitAllMarkers'),
              [],
    );
  }

  public setCenter(center: { lon: number, lat: number, zoom?: number }, zoom: number = center.zoom || 10, azimuth: number = 0, tilt: number = 0, duration: number = 0, animation: Animation = Animation.SMOOTH) {
    UIManager.dispatchViewManagerCommand(
              findNodeHandle(this),
              this.getCommand('setCenter'),
              [center, zoom, azimuth, tilt, duration, animation],
    );
  }

  public search(query: string) {
    UIManager.dispatchViewManagerCommand(
              findNodeHandle(this),
              this.getCommand('search'),
              [query],
    );
  }

  private _findRoutes(points: Point[], vehicles: Vehicles[], callback: ((event: RoutesFoundEvent<DrivingInfo | MasstransitInfo>) => void) | ((event: RoutesFoundEvent<DrivingInfo>) => void) | ((event: RoutesFoundEvent<MasstransitInfo>) => void)) {
    const cbId = CallbacksManager.addCallback(callback);
    const args
              = Platform.OS === 'ios'
              ? [{ points, vehicles, id: cbId }]
              : [points, vehicles, cbId];
    UIManager.dispatchViewManagerCommand(
              findNodeHandle(this),
              this.getCommand('findRoutes'),
              args,
    );
  }

  private getCommand(cmd: string): any {
    if (Platform.OS === 'ios') {
      return UIManager.getViewManagerConfig('YamapView').Commands[cmd];
    } else {
      return cmd;
    }
  }

  private processRoute(event: any) {
    CallbacksManager.call(event.nativeEvent.id, event);
  }

  private onCameraPositionChanged = (event: any) => {
    if (this.props.onCameraChanged) {
      this.props.onCameraChanged(event.nativeEvent);
    }
  }

  private onSearch = (event: any) => {
    if (this.props.onSearch) {
      this.props.onSearch(event.nativeEvent);
    }
  }

  private resolveImageUri(img: ImageSourcePropType) {
    return img ? resolveAssetSource(img).uri : '';
  }

  private getProps() {
    return (
              {
                ...this.props,
                onRouteFound: this.processRoute,
                onCameraPositionChanged: this.onCameraPositionChanged,
                onSuggest: this.onSearch,
                userLocationIcon: this.resolveImageUri(this.props.userLocationIcon),
              }
    );
  }

  render() {

    return (
              <YaMapNativeComponent
                        {...this.getProps()}
                        ref={this.map}
              />
    );
  }
}
