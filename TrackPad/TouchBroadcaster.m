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
    [socket emit:@"touch" with:@[@{@"event":@"touched"}]];
}

@end
