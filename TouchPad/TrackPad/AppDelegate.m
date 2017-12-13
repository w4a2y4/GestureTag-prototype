//
//  AppDelegate.m
//  TrackPad
//
//  Created by Tony Tung on 12/8/17.
//  Copyright © 2017 gesturetag. All rights reserved.
//

#import "AppDelegate.h"

#import "TouchPoint.h"
#import "MultiTouch.h"
#import "TouchBroadcaster.h"
//@interface AppDelegate ()
//
//@end


static void touchCallback(int device, MTTouch *data, int num_fingers, double timestamp, int frame) {
    // create TouchPoint objects for all touches
    NSMutableArray *points = [[NSMutableArray alloc] initWithCapacity: num_fingers];
    for (int i = 0; i < num_fingers; i++){
        TouchPoint *point = [[TouchPoint alloc] initWithTouch:&data[i]];
        [points addObject:point];
    }
//    AppDelegate *delegate = (AppDelegate *) [NSApp delegate];
//    [delegate performSelectorOnMainThread:@selector(didTouchWithPoints:) withObject:points waitUntilDone:NO];
}

// update touch event for GTGestureRecognizer
static void updateTouch(MTDeviceRef device, long pathID, long state, MTTouch* touch){
    TouchPoint *point = [[TouchPoint alloc] initWithTouch:&touch[0]];
    AppDelegate *delegate = (AppDelegate *)[NSApp delegate];
    dispatch_async(dispatch_get_main_queue(), ^{
        [delegate updatePathInfo:point withState:state];
    });
}


@implementation AppDelegate
@synthesize touchList;
@synthesize gestureRecognizer;
@synthesize touchBroadcaster;
@synthesize pathList;
@synthesize pathState;


- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    // Insert code here to initialize your application
    
    NSArray *deviceList = (NSArray *)CFBridgingRelease(MTDeviceCreateList());
    for (int i = 0; i < [deviceList count]; i++){
        NSLog(@"Fuck");
        MTDeviceRef device = (__bridge MTDeviceRef)[deviceList objectAtIndex:i];
        MTRegisterContactFrameCallback(device, touchCallback);
        MTRegisterPathCallback(device, updateTouch);
        MTDeviceStart(device, 0);
    }
    touchBroadcaster = [[TouchBroadcaster alloc] init];
    [touchBroadcaster initSocketConnection];
    touchList = [[NSMutableArray alloc] initWithCapacity:1];
    pathList = [[NSMutableArray alloc] initWithCapacity:1];
    pathState = [[NSMutableArray alloc] initWithCapacity:1];
    gestureRecognizer = [[GTGestureRecognizer alloc] init];
}


- (void)applicationWillTerminate:(NSNotification *)aNotification {
    // Insert code here to tear down your application
//    [NSCursor unhide];
}

//- (void)didTouchWithPoints:(NSArray *)points {
////    NSLog(@"touch");
////    NSString *event = @"testEvent";
////    [_touchBroadcaster sendTouchEvent:event];
//    if(_state == 0) {
//        // no -> touched
//        NSLog(@"start touch");
//        _timer = [NSTimer scheduledTimerWithTimeInterval:2.f target:self selector:@selector(touchIntervalPassed:) userInfo:nil repeats:NO];
//        _state = 1;
//    } else {
//        [_timer invalidate];
//        _timer = nil;
//        _timer = [NSTimer scheduledTimerWithTimeInterval:0.5f target:self selector:@selector(touchIntervalPassed:) userInfo:nil repeats:NO];
//    }
//    if([points count] > 0)
//        [touchList addObject:points[0]];
//}
//
//- (void)touchIntervalPassed:(NSTimer *) timer{
//    // send out touch event
//    NSLog(@"touch ended");
//    _state = 0;
//    SwipeGesture gesture = [gestureRecognizer recognizeGesture:touchList];
////    [touchBroadcaster sendSwipeEvent:gesture];
//    [touchList removeAllObjects];
//}

# pragma mark - path update

- (void)updatePathInfo:(TouchPoint *)point withState:(int)state {
//    NSLog(@"state: %d", state);
    int path = [point pathIndex];
    if([pathList count] == 0 && state != MTTouchStateNotTracking){
        [pathList addObject:[NSNumber numberWithInt: path]];
        [pathState addObject:[NSNumber numberWithInt:state]];
    } else {
        // assume right now at most 1 path
        if(path == [pathList[0] intValue]){
            int prevState = [pathState[0] intValue];
            int newState = state;
//            NSLog(@"pre:%d, new:%d", prevState, newState);
            if(prevState == MTTouchStateNotTracking && newState == MTTouchStateNotTracking){
                // gesture detection
                // remove all touch points
                // remove the path
                SwipeGesture gesture = [gestureRecognizer recognizeGesture:touchList];
                [touchList removeAllObjects];
                [pathList removeAllObjects];
                [pathState removeAllObjects];
                [touchBroadcaster sendSwipeEvent:gesture];
//                NSLog(@"touch ended");
            } else {
                pathState[0] = [NSNumber numberWithInt:newState];
                [touchList addObject:point];
            }
        }
    }
}

@end
