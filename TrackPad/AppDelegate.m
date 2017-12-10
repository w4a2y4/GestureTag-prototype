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
//    NSLog(@"callback");
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

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    // Insert code here to initialize your application
    
    NSArray *deviceList = (NSArray *)CFBridgingRelease(MTDeviceCreateList());
    for (int i = 0; i < [deviceList count]; i++){
        NSLog(@"Fuck");
        MTDeviceRef device = (__bridge MTDeviceRef)[deviceList objectAtIndex:i];
        MTRegisterContactFrameCallback(device, touchCallback);
        MTDeviceStart(device, 0);
    }
    _touchBroadcaster = [[TouchBroadcaster alloc] init];
    [_touchBroadcaster initSocketConnection];

}


- (void)applicationWillTerminate:(NSNotification *)aNotification {
    // Insert code here to tear down your application
//    [NSCursor unhide];
}

- (void)didTouchWithPoints:(NSArray *)points {
//    NSLog(@"touch");
    NSString *event = @"testEvent";
    [_touchBroadcaster sendTouchEvent:event];
}


@end
