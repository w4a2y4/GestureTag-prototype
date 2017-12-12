//
//  TouchBroadcaster.m
//  TrackPad
//
//  Created by Tony Tung on 12/8/17.
//  Copyright © 2017 gesturetag. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "TouchBroadcaster.h"


@implementation TouchBroadcaster

- (void)initSocketConnection{
    NSURL *url = [[NSURL alloc] initWithString:@"http://localhost:3000"];
    _manager = [[SocketManager alloc] initWithSocketURL: url config:@{@"log": @YES, @"compress": @YES}];
    SocketIOClient *socket = _manager.defaultSocket;
    
    [socket on:@"connect" callback:^(NSArray* data, SocketAckEmitter* ack) {
        NSLog(@"socket connected");
    }];
    
    [socket connect];
}

- (void)sendTouchEvent:(NSString *)eventType {
    SocketIOClient *socket = _manager.defaultSocket;
    [socket emit:@"swipe" with:@[eventType]];
}


-(void)sendSwipeEvent:(SwipeGesture)gesture {
    NSString *eventType = @"";
    switch (gesture) {
        case SWIPE_RIGHT:
            eventType = @"right";
            break;
        case SWIPE_LEFT:
            eventType = @"left";
            break;
        case SWIPE_UP:
            eventType = @"up";
            break;
        case SWIPE_DOWN:
            eventType = @"down";
            break;
        default:
            eventType = @"UNKOWN";
            break;
    }
    [self sendTouchEvent:eventType];
}
@end
