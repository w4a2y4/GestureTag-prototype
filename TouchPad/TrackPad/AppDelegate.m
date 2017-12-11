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


static int touchCallback(int device, mtTouch *data, int num_fingers, double timestamp, int frame) {
    // create TouchPoint objects for all touches
    NSMutableArray *points = [[NSMutableArray alloc] initWithCapacity: num_fingers];
    for (int i = 0; i < num_fingers; i++){
        TouchPoint *point = [[TouchPoint alloc] initWithTouch:&data[i]];
        [points addObject:point];
    }
    AppDelegate *delegate = (AppDelegate *) [NSApp delegate];
    [delegate performSelectorOnMainThread:@selector(didTouchWithPoints:) withObject:points waitUntilDone:NO];
    
    return 0;
}



@implementation AppDelegate
@synthesize touchList;
@synthesize gestureRecognizer;
@synthesize touchBroadcaster;


- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    // Insert code here to initialize your application
    
    NSArray *deviceList = (NSArray *)CFBridgingRelease(MTDeviceCreateList());
    for (int i = 0; i < [deviceList count]; i++){
        NSLog(@"Fuck");
        MTDeviceRef device = (__bridge MTDeviceRef)[deviceList objectAtIndex:i];
        MTRegisterContactFrameCallback(device, touchCallback);
        MTDeviceStart(device, 0);
    }
    touchBroadcaster = [[TouchBroadcaster alloc] init];
    [touchBroadcaster initSocketConnection];
    touchList = [[NSMutableArray alloc] initWithCapacity:1];
    gestureRecognizer = [[GTGestureRecognizer alloc] init];
}


- (void)applicationWillTerminate:(NSNotification *)aNotification {
    // Insert code here to tear down your application
//    [NSCursor unhide];
}

- (void)didTouchWithPoints:(NSArray *)points {
//    NSLog(@"touch");
//    NSString *event = @"testEvent";
//    [_touchBroadcaster sendTouchEvent:event];
    if(_state == 0) {
        // no -> touched
        NSLog(@"start touch");
        _timer = [NSTimer scheduledTimerWithTimeInterval:2.f target:self selector:@selector(touchIntervalPassed:) userInfo:nil repeats:NO];
        _state = 1;
    } else {
        [_timer invalidate];
        _timer = nil;
        _timer = [NSTimer scheduledTimerWithTimeInterval:0.5f target:self selector:@selector(touchIntervalPassed:) userInfo:nil repeats:NO];
    }
    if([points count] > 0)
        [touchList addObject:points[0]];
}

- (void)touchIntervalPassed:(NSTimer *) timer{
    // send out touch event
    NSLog(@"touch ended");
    _state = 0;
    SwipeGesture gesture = [gestureRecognizer recognizeGesture:touchList];
    [touchBroadcaster sendSwipeEvent:gesture];
    [touchList removeAllObjects];
}


@end
