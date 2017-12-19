//
//  AppDelegate.h
//  TrackPad
//
//  Created by Tony Tung on 12/8/17.
//  Copyright © 2017 gesturetag. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import "TouchBroadcaster.h"
#import "GTGestureRecognizer.h"
#import "Utils.h"
@interface AppDelegate : NSObject <NSApplicationDelegate>

@property TouchBroadcaster *touchBroadcaster;
@property NSTimer *timer;
@property NSMutableArray *touchList;
@property NSMutableArray *pathList;
@property NSMutableArray *pathState;
@property GTGestureRecognizer *gestureRecognizer;
@property int state;
-(void)updatePathInfo:(TouchPoint *)point withState:(int)state;
@end

