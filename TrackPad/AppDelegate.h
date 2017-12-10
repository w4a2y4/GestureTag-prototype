//
//  AppDelegate.h
//  TrackPad
//
//  Created by Tony Tung on 12/8/17.
//  Copyright © 2017 gesturetag. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import "TouchBroadcaster.h"
@interface AppDelegate : NSObject <NSApplicationDelegate>

@property TouchBroadcaster *touchBroadcaster;
@end

