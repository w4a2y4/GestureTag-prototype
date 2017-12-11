//
//  TouchBroadcaster.h
//  TrackPad
//
//  Created by Tony Tung on 12/8/17.
//  Copyright © 2017 gesturetag. All rights reserved.
//

#ifndef TouchBroadcaster_h
#define TouchBroadcaster_h
@import SocketIO;
#import "Utils.h"
@interface TouchBroadcaster: NSObject

@property SocketManager *manager;
- (void)initSocketConnection;
- (void)sendTouchEvent: (NSString *) eventType;
//- (void)setEmitConfiguration: (int)frequency
- (void)sendSwipeEvent: (SwipeGesture) gesture;
@end
#endif /* TouchBroadcaster_h */


