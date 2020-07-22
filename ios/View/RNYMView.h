#ifndef RNYMView_h
#define RNYMView_h
#import <React/RCTComponent.h>
#import <YandexMapKit/YMKMapView.h>
#import <YandexMapKitSearch/YMKSearchSession.h>

@class RCTBridge;

@interface RNYMView: YMKMapView<YMKUserLocationObjectListener, RCTComponent>

@property (nonatomic, copy) RCTBubblingEventBlock _Nullable onRouteFound;
@property (nonatomic, strong) YMKSearchSuggestSession* suggestSession;
@property (nonatomic, strong) YMKSearchManager* searchManager;
@property (nonatomic, copy) RCTBubblingEventBlock onCameraPositionChanged;
@property (nonatomic, copy) RCTBubblingEventBlock onSuggest;
@property (nonatomic, strong) YMKSearchSuggestSessionResponseHandler responseHandler;
@property (nonatomic, strong) YMKSuggestOptions* options;
@property (nonatomic, strong) YMKBoundingBox* boundingBox;

// ref
-(void) setCenter:(YMKCameraPosition*_Nonnull) position withDuration:(float) duration withAnimation:(int) animation;
-(void) fitAllMarkers;
-(void) findRoutes:(NSArray<YMKRequestPoint*>*_Nonnull) points vehicles:(NSArray<NSString*>*_Nonnull) vehicles withId:(NSString*_Nonnull)_id;
- (void) fetchSuggestions:(NSString *)query;

// props
-(void) setListenUserLocation:(BOOL)listen;
-(void) setUserLocationIcon:(NSString*_Nullable) iconSource;
-(void) onCameraPositionChangedWithMap:(nonnull YMKMap *)map
    cameraPosition:(nonnull YMKCameraPosition *)cameraPosition
cameraUpdateSource:(YMKCameraUpdateSource)cameraUpdateSource
                               finished:(BOOL)finished;

@end

#endif /* RNYMView_h */
